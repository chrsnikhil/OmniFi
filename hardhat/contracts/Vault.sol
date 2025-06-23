// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

/**
 * @title Vault
 * @dev A vault contract that accepts CustomERC20 deposits and uses Chainlink Data Feeds
 * to adjust deposit limits based on RWA price (using ETH/USD as proxy) and Chainlink Automation
 * for volatility-based rebalancing
 */
contract Vault is Ownable, ReentrancyGuard, AutomationCompatibleInterface {
    using SafeERC20 for IERC20;

    // State variables
    IERC20 public immutable depositToken;
    AggregatorV3Interface public immutable priceFeed;
    
    // Vault parameters
    uint256 public totalDeposits;
    uint256 public baseDepositLimit = 1000 * 10**18; // 1000 tokens base limit
    uint256 public priceThreshold = 200000000000; // $2000 in 8 decimals (Chainlink format)
    uint256 public highPriceMultiplier = 2; // 2x multiplier when price is high
    uint256 public lowPriceMultiplier = 1; // 1x multiplier when price is low (50% of base)
    
    // Volatility tracking variables
    int256[] public priceHistory; // Store last N price observations
    uint256[] public priceTimestamps; // Store timestamps for price observations
    uint256 public constant MAX_PRICE_HISTORY = 10; // Maximum price observations to store
    uint256 public volatilityIndex; // Current volatility index (0-10000, where 10000 = 100%)
    uint256 public lastPriceUpdate; // Timestamp of last price update
    uint256 public constant VOLATILITY_UPDATE_INTERVAL = 1 hours; // Minimum time between volatility updates
    
    // Rebalancing variables
    uint256 public rebalanceThreshold = 500; // 5% volatility threshold (500 = 5.00%)
    uint256 public lastRebalanceTime; // Timestamp of last rebalance
    uint256 public constant MIN_REBALANCE_INTERVAL = 12 hours; // Minimum time between rebalances
    uint256 public rebalanceCounter; // Counter for total rebalances performed
    
    // Mock allocation percentages (for demonstration)
    uint256 public conservativeAllocation = 6000; // 60% conservative allocation
    uint256 public moderateAllocation = 3000; // 30% moderate allocation  
    uint256 public aggressiveAllocation = 1000; // 10% aggressive allocation
    
    // User deposits mapping
    mapping(address => uint256) public userDeposits;
    mapping(address => uint256) public userDepositTimestamp;
    
    // Events
    event Deposit(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawal(address indexed user, uint256 amount, uint256 timestamp);
    event DepositLimitUpdated(uint256 newLimit);
    event PriceThresholdUpdated(uint256 newThreshold);
    event MultipliersUpdated(uint256 highMultiplier, uint256 lowMultiplier);
    event VolatilityUpdated(uint256 newVolatilityIndex, int256 currentPrice);
    event PriceHistoryUpdated(int256 newPrice, uint256 timestamp);
    event RebalanceTriggered(
        uint256 indexed rebalanceId,
        uint256 volatilityIndex,
        uint256 newConservativeAllocation,
        uint256 newModerateAllocation,
        uint256 newAggressiveAllocation,
        uint256 timestamp
    );
    event RebalanceThresholdUpdated(uint256 newThreshold);
    
    /**
     * @dev Constructor
     * @param _depositToken Address of the ERC20 token to accept deposits
     * @param _priceFeed Address of the Chainlink price feed (ETH/USD on Fuji)
     */
    constructor(
        address _depositToken,
        address _priceFeed,
        address _owner
    ) Ownable(_owner) {
        require(_depositToken != address(0), "Invalid deposit token address");
        require(_priceFeed != address(0), "Invalid price feed address");
        
        depositToken = IERC20(_depositToken);
        priceFeed = AggregatorV3Interface(_priceFeed);
    }
    
    /**
     * @dev Get the latest price from Chainlink Data Feed
     * @return price The latest price in 8 decimals
     */
    function getLatestPrice() public view returns (int256 price) {
        (
            /* uint80 roundID */,
            int256 answer,
            /* uint256 startedAt */,
            uint256 timeStamp,
            /* uint80 answeredInRound */
        ) = priceFeed.latestRoundData();
        
        require(timeStamp > 0, "Round not complete");
        require(answer > 0, "Invalid price data");
        
        return answer;
    }
    
    /**
     * @dev Calculate the current deposit limit based on price and volatility
     * @return currentLimit The current deposit limit
     */
    function getCurrentDepositLimit() public view returns (uint256 currentLimit) {
        int256 currentPrice = getLatestPrice();
        
        // Base limit calculation based on price
        if (uint256(currentPrice) >= priceThreshold) {
            // High price: increase deposit limit
            currentLimit = baseDepositLimit * highPriceMultiplier;
        } else {
            // Low price: decrease deposit limit  
            currentLimit = baseDepositLimit * lowPriceMultiplier / 2;
        }
        
        // Apply volatility adjustment
        // High volatility (>50%) reduces deposit limit by up to 50%
        // Low volatility (<10%) allows full deposit limit
        if (volatilityIndex > 5000) { // > 50% volatility
            uint256 volatilityReduction = ((volatilityIndex - 5000) * 50) / 5000; // 0-50% reduction
            currentLimit = currentLimit * (100 - volatilityReduction) / 100;
        }
        
        return currentLimit;
    }
    
    /**
     * @dev Deposit tokens into the vault
     * @param amount Amount of tokens to deposit
     */
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Deposit amount must be greater than 0");
        
        // Update volatility index if enough time has passed
        if (block.timestamp >= lastPriceUpdate + VOLATILITY_UPDATE_INTERVAL) {
            updateVolatilityIndex();
        }
        
        uint256 currentLimit = getCurrentDepositLimit();
        require(
            userDeposits[msg.sender] + amount <= currentLimit,
            "Deposit would exceed user limit"
        );
        
        // Transfer tokens from user to vault
        depositToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Update user and total deposits
        userDeposits[msg.sender] += amount;
        userDepositTimestamp[msg.sender] = block.timestamp;
        totalDeposits += amount;
        
        emit Deposit(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @dev Withdraw tokens from the vault
     * @param amount Amount of tokens to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Withdrawal amount must be greater than 0");
        require(userDeposits[msg.sender] >= amount, "Insufficient deposit balance");
        
        // Update user and total deposits
        userDeposits[msg.sender] -= amount;
        totalDeposits -= amount;
        
        // Transfer tokens from vault to user
        depositToken.safeTransfer(msg.sender, amount);
        
        emit Withdrawal(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @dev Get user's deposit information
     * @param user Address of the user
     * @return depositAmount User's total deposit amount
     * @return depositTime Timestamp of user's last deposit
     * @return availableLimit User's remaining deposit limit
     */
    function getUserInfo(address user) external view returns (
        uint256 depositAmount,
        uint256 depositTime,
        uint256 availableLimit
    ) {
        depositAmount = userDeposits[user];
        depositTime = userDepositTimestamp[user];
        
        uint256 currentLimit = getCurrentDepositLimit();
        availableLimit = currentLimit > depositAmount ? currentLimit - depositAmount : 0;
    }
    
    /**
     * @dev Get vault status information
     * @return totalVaultDeposits Total deposits in the vault
     * @return currentPrice Current ETH/USD price from Chainlink
     * @return currentDepositLimit Current deposit limit based on price and volatility
     * @return vaultBalance Current token balance of the vault
     * @return currentVolatility Current volatility index (0-10000)
     */
    function getVaultStatus() external view returns (
        uint256 totalVaultDeposits,
        int256 currentPrice,
        uint256 currentDepositLimit,
        uint256 vaultBalance,
        uint256 currentVolatility
    ) {
        totalVaultDeposits = totalDeposits;
        currentPrice = getLatestPrice();
        currentDepositLimit = getCurrentDepositLimit();
        vaultBalance = depositToken.balanceOf(address(this));
        currentVolatility = volatilityIndex;
    }
    
    /**
     * @dev Update price history and calculate volatility index
     * This function should be called periodically to maintain accurate volatility tracking
     */
    function updateVolatilityIndex() public {
        // Only update if enough time has passed since last update
        require(
            block.timestamp >= lastPriceUpdate + VOLATILITY_UPDATE_INTERVAL,
            "Volatility update too frequent"
        );
        
        int256 currentPrice = getLatestPrice();
        
        // Add current price to history
        _addPriceToHistory(currentPrice);
        
        // Calculate new volatility index
        volatilityIndex = _calculateVolatilityIndex();
        lastPriceUpdate = block.timestamp;
        
        emit VolatilityUpdated(volatilityIndex, currentPrice);
    }
    
    /**
     * @dev Add a new price observation to the history
     * @param newPrice The new price to add
     */
    function _addPriceToHistory(int256 newPrice) internal {
        priceHistory.push(newPrice);
        priceTimestamps.push(block.timestamp);
        
        // Remove oldest entries if we exceed maximum history size
        if (priceHistory.length > MAX_PRICE_HISTORY) {
            // Shift arrays to remove first element
            for (uint i = 0; i < priceHistory.length - 1; i++) {
                priceHistory[i] = priceHistory[i + 1];
                priceTimestamps[i] = priceTimestamps[i + 1];
            }
            priceHistory.pop();
            priceTimestamps.pop();
        }
        
        emit PriceHistoryUpdated(newPrice, block.timestamp);
    }
    
    /**
     * @dev Calculate volatility index based on price variance
     * @return volatility The calculated volatility index (0-10000, where 10000 = 100%)
     */
    function _calculateVolatilityIndex() internal view returns (uint256 volatility) {
        if (priceHistory.length < 2) {
            return 0; // Not enough data for volatility calculation
        }
        
        // Calculate mean price
        int256 sum = 0;
        for (uint i = 0; i < priceHistory.length; i++) {
            sum += priceHistory[i];
        }
        int256 mean = sum / int256(priceHistory.length);
        
        // Calculate variance (sum of squared differences from mean)
        uint256 varianceSum = 0;
        for (uint i = 0; i < priceHistory.length; i++) {
            int256 diff = priceHistory[i] - mean;
            // Convert to unsigned for squaring (assuming prices are positive)
            uint256 absDiff = diff >= 0 ? uint256(diff) : uint256(-diff);
            varianceSum += (absDiff * absDiff);
        }
        
        // Calculate standard deviation as percentage of mean
        uint256 variance = varianceSum / priceHistory.length;
        uint256 stdDev = _sqrt(variance);
        
        // Convert to volatility index (percentage * 100, max capped at 10000)
        if (mean <= 0) return 0;
        
        volatility = (stdDev * 10000) / uint256(mean > 0 ? mean : -mean);
        
        // Cap volatility at 100% (10000)
        if (volatility > 10000) {
            volatility = 10000;
        }
        
        return volatility;
    }
    
    /**
     * @dev Calculate square root using Babylonian method
     * @param x The number to find square root of
     * @return y The square root
     */
    function _sqrt(uint256 x) internal pure returns (uint256 y) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
    
    /**
     * @dev Get current volatility information
     * @return currentVolatility Current volatility index (0-10000)
     * @return priceCount Number of price observations stored
     * @return lastUpdate Timestamp of last volatility update
     * @return canUpdate Whether volatility can be updated now
     */
    function getVolatilityInfo() external view returns (
        uint256 currentVolatility,
        uint256 priceCount,
        uint256 lastUpdate,
        bool canUpdate
    ) {
        currentVolatility = volatilityIndex;
        priceCount = priceHistory.length;
        lastUpdate = lastPriceUpdate;
        canUpdate = block.timestamp >= lastPriceUpdate + VOLATILITY_UPDATE_INTERVAL;
    }
    
    /**
     * @dev Get price history array
     * @return prices Array of historical prices
     * @return timestamps Array of corresponding timestamps
     */
    function getPriceHistory() external view returns (
        int256[] memory prices,
        uint256[] memory timestamps
    ) {
        prices = priceHistory;
        timestamps = priceTimestamps;
    }
    
    // Chainlink Automation functions
    
    /**
     * @dev Chainlink Automation function to check if rebalancing is needed
     * @return upkeepNeeded Whether the vault needs rebalancing
     * @return performData Data to pass to performUpkeep (empty for this implementation)
     */
    function checkUpkeep(bytes calldata /* checkData */) 
        external 
        view 
        override 
        returns (bool upkeepNeeded, bytes memory performData) 
    {
        // Check if minimum time has passed since last rebalance
        bool timePassed = (block.timestamp - lastRebalanceTime) >= MIN_REBALANCE_INTERVAL;
        
        // Check if volatility exceeds threshold
        bool volatilityHigh = volatilityIndex >= rebalanceThreshold;
        
        // Check if we have enough price history for meaningful volatility calculation
        bool sufficientData = priceHistory.length >= 3;
        
        // Rebalance is needed if all conditions are met
        upkeepNeeded = timePassed && volatilityHigh && sufficientData;
        
        // Return empty performData for this implementation
        performData = "";
    }
    
    /**
     * @dev Chainlink Automation function to perform rebalancing
     */
    function performUpkeep(bytes calldata /* performData */) external override {
        // Verify that rebalancing is actually needed (same checks as checkUpkeep)
        bool timePassed = (block.timestamp - lastRebalanceTime) >= MIN_REBALANCE_INTERVAL;
        bool volatilityHigh = volatilityIndex >= rebalanceThreshold;
        bool sufficientData = priceHistory.length >= 3;
        
        require(timePassed && volatilityHigh && sufficientData, "Rebalancing not needed");
        
        // Perform the rebalancing
        _performRebalancing();
    }
    
    /**
     * @dev Internal function to perform vault rebalancing based on volatility
     * Adjusts allocation percentages based on current market volatility
     */
    function _performRebalancing() internal {
        uint256 currentVolatility = volatilityIndex;
        
        // Calculate new allocations based on volatility
        // Higher volatility = more conservative allocation
        // Lower volatility = more aggressive allocation
        
        uint256 newConservative;
        uint256 newModerate;
        uint256 newAggressive;
        
        if (currentVolatility >= 2000) {
            // Very high volatility (>20%): Ultra conservative
            newConservative = 8000; // 80%
            newModerate = 1500;     // 15%
            newAggressive = 500;    // 5%
        } else if (currentVolatility >= 1000) {
            // High volatility (10-20%): Conservative
            newConservative = 7000; // 70%
            newModerate = 2500;     // 25%
            newAggressive = 500;    // 5%
        } else if (currentVolatility >= 500) {
            // Medium volatility (5-10%): Balanced
            newConservative = 6000; // 60%
            newModerate = 3000;     // 30%
            newAggressive = 1000;   // 10%
        } else if (currentVolatility >= 200) {
            // Low volatility (2-5%): Moderately aggressive
            newConservative = 5000; // 50%
            newModerate = 3500;     // 35%
            newAggressive = 1500;   // 15%
        } else {
            // Very low volatility (<2%): Aggressive
            newConservative = 4000; // 40%
            newModerate = 4000;     // 40%
            newAggressive = 2000;   // 20%
        }
        
        // Update allocations
        conservativeAllocation = newConservative;
        moderateAllocation = newModerate;
        aggressiveAllocation = newAggressive;
        
        // Update rebalance tracking
        rebalanceCounter++;
        lastRebalanceTime = block.timestamp;
        
        // Emit rebalancing event
        emit RebalanceTriggered(
            rebalanceCounter,
            currentVolatility,
            newConservative,
            newModerate,
            newAggressive,
            block.timestamp
        );
    }
    
    /**
     * @dev Manual rebalancing function (for testing or emergency use)
     * Can be called by anyone if conditions are met
     */
    function manualRebalance() external {
        // Update volatility first if needed
        if (block.timestamp >= lastPriceUpdate + VOLATILITY_UPDATE_INTERVAL) {
            updateVolatilityIndex();
        }
        // Check if rebalancing conditions are met
        bool timePassed = (block.timestamp - lastRebalanceTime) >= MIN_REBALANCE_INTERVAL;
        bool volatilityHigh = volatilityIndex >= rebalanceThreshold;
        bool sufficientData = priceHistory.length >= 3;
        require(timePassed && volatilityHigh && sufficientData, "Rebalancing conditions not met");
        // Perform rebalancing
        _performRebalancing();
    }

    /**
     * @dev Owner-only emergency/manual rebalancing function
     * Allows the owner to force a rebalance at any time, bypassing all conditions.
     */
    function forceRebalance() external onlyOwner {
        // Optionally update volatility if enough time has passed
        if (block.timestamp >= lastPriceUpdate + VOLATILITY_UPDATE_INTERVAL) {
            updateVolatilityIndex();
        }
        _performRebalancing();
    }
    
    /**
     * @dev Get rebalancing information
     * @return threshold Current rebalance threshold (in basis points)
     * @return lastRebalance Timestamp of last rebalance
     * @return rebalanceCount Total number of rebalances performed
     * @return timeSinceLastRebalance Time elapsed since last rebalance
     * @return nextRebalanceEligible When next rebalance will be eligible
     */
    function getRebalanceInfo() external view returns (
        uint256 threshold,
        uint256 lastRebalance,
        uint256 rebalanceCount,
        uint256 timeSinceLastRebalance,
        uint256 nextRebalanceEligible
    ) {
        threshold = rebalanceThreshold;
        lastRebalance = lastRebalanceTime;
        rebalanceCount = rebalanceCounter;
        timeSinceLastRebalance = block.timestamp > lastRebalanceTime ? 
            block.timestamp - lastRebalanceTime : 0;
        nextRebalanceEligible = lastRebalanceTime + MIN_REBALANCE_INTERVAL;
    }
    
    /**
     * @dev Get current allocation percentages
     * @return conservative Conservative allocation percentage (basis points)
     * @return moderate Moderate allocation percentage (basis points)
     * @return aggressive Aggressive allocation percentage (basis points)
     * @return totalAllocation Total allocation (should equal 10000)
     */
    function getAllocationInfo() external view returns (
        uint256 conservative,
        uint256 moderate,
        uint256 aggressive,
        uint256 totalAllocation
    ) {
        conservative = conservativeAllocation;
        moderate = moderateAllocation;
        aggressive = aggressiveAllocation;
        totalAllocation = conservative + moderate + aggressive;
    }
    
    // Owner functions for vault management
    
    /**
     * @dev Update the base deposit limit (only owner)
     * @param newBaseLimit New base deposit limit
     */
    function updateBaseDepositLimit(uint256 newBaseLimit) external onlyOwner {
        require(newBaseLimit > 0, "Base limit must be greater than 0");
        baseDepositLimit = newBaseLimit;
        emit DepositLimitUpdated(newBaseLimit);
    }
    
    /**
     * @dev Update the price threshold (only owner)
     * @param newThreshold New price threshold in 8 decimals
     */
    function updatePriceThreshold(uint256 newThreshold) external onlyOwner {
        require(newThreshold > 0, "Threshold must be greater than 0");
        priceThreshold = newThreshold;
        emit PriceThresholdUpdated(newThreshold);
    }
    
    /**
     * @dev Update multipliers (only owner)
     * @param newHighMultiplier New high price multiplier
     * @param newLowMultiplier New low price multiplier
     */
    function updateMultipliers(
        uint256 newHighMultiplier,
        uint256 newLowMultiplier
    ) external onlyOwner {
        require(newHighMultiplier > 0, "High multiplier must be greater than 0");
        require(newLowMultiplier > 0, "Low multiplier must be greater than 0");
        
        highPriceMultiplier = newHighMultiplier;
        lowPriceMultiplier = newLowMultiplier;
        
        emit MultipliersUpdated(newHighMultiplier, newLowMultiplier);
    }
    
    /**
     * @dev Update the rebalance threshold (only owner)
     * @param newThreshold New rebalance threshold in basis points (e.g., 500 = 5%)
     */
    function updateRebalanceThreshold(uint256 newThreshold) external onlyOwner {
        require(newThreshold > 0 && newThreshold <= 5000, "Invalid threshold range"); // Max 50%
        rebalanceThreshold = newThreshold;
        emit RebalanceThresholdUpdated(newThreshold);
    }
    
    /**
     * @dev Update allocation percentages manually (only owner)
     * @param newConservative New conservative allocation percentage
     * @param newModerate New moderate allocation percentage  
     * @param newAggressive New aggressive allocation percentage
     */
    function updateAllocations(
        uint256 newConservative,
        uint256 newModerate,
        uint256 newAggressive
    ) external onlyOwner {
        require(
            newConservative + newModerate + newAggressive == 10000,
            "Allocations must total 100%"
        );
        require(
            newConservative >= 1000 && newConservative <= 9000,
            "Conservative allocation out of range"
        );
        
        conservativeAllocation = newConservative;
        moderateAllocation = newModerate;
        aggressiveAllocation = newAggressive;
        
        emit RebalanceTriggered(
            rebalanceCounter + 1, // Increment for manual update
            volatilityIndex,
            newConservative,
            newModerate,
            newAggressive,
            block.timestamp
        );
    }
    
    /**
     * @dev Emergency withdrawal function (only owner)
     * @param token Address of token to withdraw
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(token != address(0), "Invalid token address");
        IERC20(token).safeTransfer(owner(), amount);
    }
}
