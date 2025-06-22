// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/**
 * @title Vault
 * @dev A vault contract that accepts CustomERC20 deposits and uses Chainlink Data Feeds
 * to adjust deposit limits based on RWA price (using ETH/USD as proxy)
 */
contract Vault is Ownable, ReentrancyGuard {
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
    
    // User deposits mapping
    mapping(address => uint256) public userDeposits;
    mapping(address => uint256) public userDepositTimestamp;
    
    // Events
    event Deposit(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawal(address indexed user, uint256 amount, uint256 timestamp);
    event DepositLimitUpdated(uint256 newLimit);
    event PriceThresholdUpdated(uint256 newThreshold);
    event MultipliersUpdated(uint256 highMultiplier, uint256 lowMultiplier);
    
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
     * @dev Calculate the current deposit limit based on price
     * @return currentLimit The current deposit limit
     */
    function getCurrentDepositLimit() public view returns (uint256 currentLimit) {
        int256 currentPrice = getLatestPrice();
        
        if (uint256(currentPrice) >= priceThreshold) {
            // High price: increase deposit limit
            currentLimit = baseDepositLimit * highPriceMultiplier;
        } else {
            // Low price: decrease deposit limit  
            currentLimit = baseDepositLimit * lowPriceMultiplier / 2;
        }
        
        return currentLimit;
    }
    
    /**
     * @dev Deposit tokens into the vault
     * @param amount Amount of tokens to deposit
     */
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Deposit amount must be greater than 0");
        
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
     * @return currentDepositLimit Current deposit limit based on price
     * @return vaultBalance Current token balance of the vault
     */
    function getVaultStatus() external view returns (
        uint256 totalVaultDeposits,
        int256 currentPrice,
        uint256 currentDepositLimit,
        uint256 vaultBalance
    ) {
        totalVaultDeposits = totalDeposits;
        currentPrice = getLatestPrice();
        currentDepositLimit = getCurrentDepositLimit();
        vaultBalance = depositToken.balanceOf(address(this));
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
     * @dev Emergency withdrawal function (only owner)
     * @param token Address of token to withdraw
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(token != address(0), "Invalid token address");
        IERC20(token).safeTransfer(owner(), amount);
    }
}
