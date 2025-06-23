// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./CustomERC20.sol";

/**
 * @title TransferCoordinator
 * @dev Coordinates cross-chain transfers using Chainlink Functions to fetch yield data
 * Burns tokens on source chain and determines optimal destination chain based on yield
 */
contract TransferCoordinator is FunctionsClient, Ownable, ReentrancyGuard {
    using FunctionsRequest for FunctionsRequest.Request;

    // State variables
    CustomERC20 public immutable carbonToken;
    
    // Chainlink Functions configuration
    bytes32 public donId;
    uint64 public subscriptionId;
    uint32 public callbackGasLimit;
    
    // Chain configurations
    struct ChainInfo {
        uint256 chainId;
        string name;
        bool isActive;
    }
    
    mapping(uint256 => ChainInfo) public chains;
    uint256[] public activeChainIds;
    
    // Transfer tracking
    struct TransferRequest {
        address user;
        uint256 amount;
        uint256 sourceChain;
        uint256 timestamp;
        bool isProcessed;
        uint256 destinationChain;
        uint256 expectedYield;
    }
    
    mapping(bytes32 => TransferRequest) public transferRequests;
    bytes32[] public pendingRequests;
    
    // Yield data (fetched from Chainlink Functions)
    mapping(uint256 => uint256) public chainYields; // chainId => yield percentage (in basis points)
    uint256 public lastYieldUpdate;
    
    // Events
    event TransferInitiated(
        bytes32 indexed requestId,
        address indexed user,
        uint256 amount,
        uint256 sourceChain
    );
    
    event YieldDataReceived(
        bytes32 indexed requestId,
        uint256[] chainIds,
        uint256[] yields
    );
    
    event TransferCompleted(
        bytes32 indexed requestId,
        address indexed user,
        uint256 amount,
        uint256 sourceChain,
        uint256 destinationChain,
        uint256 yield
    );
    
    event ChainConfigured(uint256 indexed chainId, string name, bool isActive);

    /**
     * @dev Constructor
     * @param _router Chainlink Functions router address
     * @param _carbonToken Address of the Carbon Token contract
     * @param _donId DON ID for Chainlink Functions
     * @param _subscriptionId Subscription ID for Chainlink Functions
     */
    constructor(
        address _router,
        address _carbonToken,
        bytes32 _donId,
        uint64 _subscriptionId
    ) FunctionsClient(_router) Ownable(msg.sender) {
        carbonToken = CustomERC20(_carbonToken);
        donId = _donId;
        subscriptionId = _subscriptionId;
        callbackGasLimit = 300000; // 300k gas for callback
        
        // Initialize supported chains
        _configureChain(43113, "Avalanche Fuji", true);  // Source chain
        _configureChain(84532, "Base Sepolia", true);    // Destination chain
    }

    /**
     * @dev Configure a supported chain
     * @param _chainId Chain ID
     * @param _name Chain name
     * @param _isActive Whether the chain is active
     */
    function configureChain(
        uint256 _chainId,
        string memory _name,
        bool _isActive
    ) external onlyOwner {
        _configureChain(_chainId, _name, _isActive);
    }
    
    function _configureChain(
        uint256 _chainId,
        string memory _name,
        bool _isActive
    ) internal {
        chains[_chainId] = ChainInfo({
            chainId: _chainId,
            name: _name,
            isActive: _isActive
        });
        
        // Update active chains array
        bool found = false;
        for (uint256 i = 0; i < activeChainIds.length; i++) {
            if (activeChainIds[i] == _chainId) {
                found = true;
                if (!_isActive) {
                    // Remove from active chains
                    activeChainIds[i] = activeChainIds[activeChainIds.length - 1];
                    activeChainIds.pop();
                }
                break;
            }
        }
        
        if (!found && _isActive) {
            activeChainIds.push(_chainId);
        }
        
        emit ChainConfigured(_chainId, _name, _isActive);
    }

    /**
     * @dev Initiate cross-chain transfer with yield optimization
     * @param _amount Amount of tokens to transfer
     */
    function initiateTransfer(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(
            carbonToken.balanceOf(msg.sender) >= _amount,
            "Insufficient balance"
        );
        require(
            carbonToken.allowance(msg.sender, address(this)) >= _amount,
            "Insufficient allowance"
        );
        
        // Burn tokens from user
        carbonToken.burnFrom(msg.sender, _amount);
        
        // Create Chainlink Functions request to fetch yield data
        bytes32 requestId = _requestYieldData();
        
        // Store transfer request
        transferRequests[requestId] = TransferRequest({
            user: msg.sender,
            amount: _amount,
            sourceChain: block.chainid,
            timestamp: block.timestamp,
            isProcessed: false,
            destinationChain: 0,
            expectedYield: 0
        });
        
        pendingRequests.push(requestId);
        
        emit TransferInitiated(requestId, msg.sender, _amount, block.chainid);
    }

    /**
     * @dev Request yield data from Chainlink Functions
     * @return requestId The request ID
     */
    function _requestYieldData() internal returns (bytes32) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(_getYieldFetchingSource());
        
        // Add chain IDs as arguments
        string[] memory args = new string[](activeChainIds.length);
        for (uint256 i = 0; i < activeChainIds.length; i++) {
            args[i] = _uint256ToString(activeChainIds[i]);
        }
        req.setArgs(args);
        
        return _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            callbackGasLimit,
            donId
        );
    }

    /**
     * @dev JavaScript source code for Chainlink Functions to fetch yield data
     * @return JavaScript source code as string
     */
    function _getYieldFetchingSource() internal pure returns (string memory) {
        return
            "const chainIds = args;"
            "const yields = [];"
            "for (let i = 0; i < chainIds.length; i++) {"
            "  const chainId = chainIds[i];"
            "  let yield;"
            "  if (chainId === '43113') {"
            "    yield = Math.floor(Math.random() * 500) + 300;" // 3-8% for Fuji
            "  } else if (chainId === '84532') {"
            "    yield = Math.floor(Math.random() * 600) + 400;" // 4-10% for Base Sepolia
            "  } else {"
            "    yield = Math.floor(Math.random() * 400) + 200;" // 2-6% for others
            "  }"
            "  yields.push(yield);"
            "}"
            "console.log('Chain yields:', yields);"
            "const result = yields.join(',');"
            "return Functions.encodeString(result);";
    }

    /**
     * @dev Chainlink Functions callback
     * @param requestId The request ID
     * @param response The response from Chainlink Functions
     * @param err Any error from Chainlink Functions
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        TransferRequest storage request = transferRequests[requestId];
        require(request.user != address(0), "Request not found");
        require(!request.isProcessed, "Request already processed");
        
        if (err.length > 0) {
            // Handle error - for demo, use fallback chain (Base Sepolia)
            request.destinationChain = 84532; // Base Sepolia
            request.expectedYield = 500; // 5% fallback yield
        } else {
            // Parse yield data
            string memory yieldData = string(response);
            (uint256[] memory chainIds, uint256[] memory yields) = _parseYieldData(yieldData);
            
            // Update yield data
            for (uint256 i = 0; i < chainIds.length; i++) {
                chainYields[chainIds[i]] = yields[i];
            }
            lastYieldUpdate = block.timestamp;
            
            // Find chain with highest yield
            uint256 bestChain = chainIds[0];
            uint256 bestYield = yields[0];
            
            for (uint256 i = 1; i < chainIds.length; i++) {
                if (yields[i] > bestYield && chainIds[i] != block.chainid) {
                    bestChain = chainIds[i];
                    bestYield = yields[i];
                }
            }
            
            request.destinationChain = bestChain;
            request.expectedYield = bestYield;
            
            emit YieldDataReceived(requestId, chainIds, yields);
        }
        
        request.isProcessed = true;
        
        emit TransferCompleted(
            requestId,
            request.user,
            request.amount,
            request.sourceChain,
            request.destinationChain,
            request.expectedYield
        );
    }

    /**
     * @dev Parse yield data from comma-separated string
     * @param yieldData Comma-separated yield values
     * @return chainIds Array of chain IDs
     * @return yields Array of yield values
     */
    function _parseYieldData(string memory yieldData) 
        internal 
        view 
        returns (uint256[] memory chainIds, uint256[] memory yields) 
    {
        bytes memory data = bytes(yieldData);
        uint256 commaCount = 0;
        
        // Count commas to determine array size
        for (uint256 i = 0; i < data.length; i++) {
            if (data[i] == ',') {
                commaCount++;
            }
        }
        
        uint256 arraySize = commaCount + 1;
        chainIds = new uint256[](arraySize);
        yields = new uint256[](arraySize);
        
        // Copy from activeChainIds
        for (uint256 i = 0; i < arraySize && i < activeChainIds.length; i++) {
            chainIds[i] = activeChainIds[i];
        }
        
        // Parse yields
        uint256 start = 0;
        uint256 index = 0;
        
        for (uint256 i = 0; i <= data.length; i++) {
            if (i == data.length || data[i] == ',') {
                yields[index] = _parseUint(data, start, i);
                start = i + 1;
                index++;
            }
        }
    }

    /**
     * @dev Parse uint from bytes array
     * @param data Bytes array
     * @param start Start index
     * @param end End index
     * @return Parsed uint value
     */
    function _parseUint(bytes memory data, uint256 start, uint256 end) 
        internal 
        pure 
        returns (uint256) 
    {
        uint256 result = 0;
        for (uint256 i = start; i < end; i++) {
            uint8 digit = uint8(data[i]) - 48; // ASCII '0' is 48
            if (digit <= 9) {
                result = result * 10 + digit;
            }
        }
        return result;
    }

    /**
     * @dev Convert uint256 to string
     * @param _i Uint256 value
     * @return String representation
     */
    function _uint256ToString(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    // View functions
    function getTransferRequest(bytes32 requestId) 
        external 
        view 
        returns (TransferRequest memory) 
    {
        return transferRequests[requestId];
    }
    
    function getActiveChains() external view returns (uint256[] memory) {
        return activeChainIds;
    }
    
    function getPendingRequestsCount() external view returns (uint256) {
        return pendingRequests.length;
    }
    
    function getChainYield(uint256 chainId) external view returns (uint256) {
        return chainYields[chainId];
    }

    // Admin functions
    function updateSubscriptionId(uint64 _subscriptionId) external onlyOwner {
        subscriptionId = _subscriptionId;
    }
    
    function updateCallbackGasLimit(uint32 _callbackGasLimit) external onlyOwner {
        callbackGasLimit = _callbackGasLimit;
    }
    
    function updateDonId(bytes32 _donId) external onlyOwner {
        donId = _donId;
    }
}
