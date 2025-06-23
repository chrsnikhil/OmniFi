// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";

contract CCIPTokenRebalancer is Ownable {
    using SafeERC20 for IERC20;

    error InvalidAddress();
    error InvalidAmount();
    error InsufficientFee();
    error TransferFailed();
    error UnsupportedChain();
    
    IRouterClient public immutable ccipRouter;
    
    // Supported destination chains
    mapping(uint64 => bool) public supportedChains;
    
    // Events
    event TokensRebalanced(
        address indexed token,
        address indexed sender,
        address indexed receiver,
        uint256 amount,
        uint64 destinationChainSelector,
        bytes32 messageId
    );

    event ChainSupportUpdated(uint64 chainSelector, bool supported);

    constructor(address _ccipRouter) Ownable(msg.sender) {
        if (_ccipRouter == address(0)) revert InvalidAddress();
        ccipRouter = IRouterClient(_ccipRouter);
        
        // Initialize with common testnet chains
        _updateChainSupport(14767482510784806043, true); // Base Sepolia
        _updateChainSupport(16015286601757825753, true); // Sepolia
        _updateChainSupport(12532609583862916517, true); // Polygon Mumbai
    }

    /**
     * @notice Rebalance tokens to another chain via CCIP
     * @param token Address of the ERC20 token to rebalance
     * @param destinationChainSelector Chain selector for the destination chain
     * @param receiver Address to receive tokens on the destination chain
     * @param amount Amount of tokens to rebalance
     * @param gasLimit Gas limit for the destination chain execution
     */
    function rebalanceTokens(
        address token,
        uint64 destinationChainSelector,
        address receiver,
        uint256 amount,
        uint256 gasLimit
    ) external payable returns (bytes32 messageId) {
        if (token == address(0)) revert InvalidAddress();
        if (receiver == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        if (!supportedChains[destinationChainSelector]) revert UnsupportedChain();

        // Transfer tokens from sender to this contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        // Approve CCIP router to spend tokens
        IERC20(token).approve(address(ccipRouter), amount);

        // Build the CCIP message with proper gas limit
        Client.EVM2AnyMessage memory message = _buildCCIPMessage(
            receiver,
            token,
            amount,
            gasLimit
        );

        // Get the fee required for the CCIP transfer
        uint256 fees = ccipRouter.getFee(destinationChainSelector, message);
        if (msg.value < fees) revert InsufficientFee();

        // Send the CCIP message
        messageId = ccipRouter.ccipSend{value: fees}(destinationChainSelector, message);

        // Refund excess ETH
        if (msg.value > fees) {
            (bool success, ) = msg.sender.call{value: msg.value - fees}("");
            if (!success) revert TransferFailed();
        }

        emit TokensRebalanced(
            token,
            msg.sender,
            receiver,
            amount,
            destinationChainSelector,
            messageId
        );

        return messageId;
    }

    /**
     * @notice Get the fee for a CCIP transfer
     * @param destinationChainSelector The destination chain selector
     * @param token The token to transfer
     * @param receiver The receiver address
     * @param amount The amount to transfer
     * @param gasLimit Gas limit for execution
     */
    function getRebalanceFee(
        uint64 destinationChainSelector,
        address token,
        address receiver,
        uint256 amount,
        uint256 gasLimit
    ) external view returns (uint256) {
        Client.EVM2AnyMessage memory message = _buildCCIPMessage(
            receiver,
            token,
            amount,
            gasLimit
        );

        return ccipRouter.getFee(destinationChainSelector, message);
    }

    /**
     * @notice Build CCIP message with proper configuration
     */
    function _buildCCIPMessage(
        address receiver,
        address token,
        uint256 amount,
        uint256 gasLimit
    ) internal pure returns (Client.EVM2AnyMessage memory) {
        // Set up token amounts array
        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: token,
            amount: amount
        });

        // Build extra args with gas limit
        bytes memory extraArgs = Client._argsToBytes(
            Client.EVMExtraArgsV1({gasLimit: gasLimit, strict: false})
        );

        return Client.EVM2AnyMessage({
            receiver: abi.encode(receiver),
            data: "", // No additional data needed for simple token transfer
            tokenAmounts: tokenAmounts,
            extraArgs: extraArgs,
            feeToken: address(0) // Pay fees in native token
        });
    }

    /**
     * @notice Update supported chains (only owner)
     * @param chainSelector The chain selector to update
     * @param supported Whether the chain is supported
     */
    function updateChainSupport(uint64 chainSelector, bool supported) external onlyOwner {
        _updateChainSupport(chainSelector, supported);
    }

    function _updateChainSupport(uint64 chainSelector, bool supported) internal {
        supportedChains[chainSelector] = supported;
        emit ChainSupportUpdated(chainSelector, supported);
    }

    /**
     * @notice Batch rebalance multiple tokens
     * @param tokens Array of token addresses
     * @param destinationChainSelector Destination chain
     * @param receivers Array of receiver addresses
     * @param amounts Array of amounts
     * @param gasLimit Gas limit for each transfer
     */
    function batchRebalanceTokens(
        address[] calldata tokens,
        uint64 destinationChainSelector,
        address[] calldata receivers,
        uint256[] calldata amounts,
        uint256 gasLimit
    ) external payable returns (bytes32[] memory messageIds) {
        if (tokens.length != receivers.length || tokens.length != amounts.length) {
            revert InvalidAmount();
        }

        messageIds = new bytes32[](tokens.length);
        uint256 totalFees = 0;

        // Calculate total fees first
        for (uint256 i = 0; i < tokens.length; i++) {
            Client.EVM2AnyMessage memory message = _buildCCIPMessage(
                receivers[i],
                tokens[i],
                amounts[i],
                gasLimit
            );
            totalFees += ccipRouter.getFee(destinationChainSelector, message);
        }

        if (msg.value < totalFees) revert InsufficientFee();

        // Execute transfers
        uint256 usedFees = 0;
        for (uint256 i = 0; i < tokens.length; i++) {
            IERC20(tokens[i]).safeTransferFrom(msg.sender, address(this), amounts[i]);
            IERC20(tokens[i]).approve(address(ccipRouter), amounts[i]);

            Client.EVM2AnyMessage memory message = _buildCCIPMessage(
                receivers[i],
                tokens[i],
                amounts[i],
                gasLimit
            );

            uint256 fees = ccipRouter.getFee(destinationChainSelector, message);
            messageIds[i] = ccipRouter.ccipSend{value: fees}(destinationChainSelector, message);
            usedFees += fees;

            emit TokensRebalanced(
                tokens[i],
                msg.sender,
                receivers[i],
                amounts[i],
                destinationChainSelector,
                messageIds[i]
            );
        }

        // Refund excess ETH
        if (msg.value > usedFees) {
            (bool success, ) = msg.sender.call{value: msg.value - usedFees}("");
            if (!success) revert TransferFailed();
        }

        return messageIds;
    }

    /**
     * @notice Emergency withdraw function for stuck tokens
     * @param token The token to withdraw (address(0) for native)
     * @param amount The amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (amount == 0) revert InvalidAmount();
        
        if (token == address(0)) {
            // Withdraw native token
            (bool success, ) = owner().call{value: amount}("");
            if (!success) revert TransferFailed();
        } else {
            // Withdraw ERC20 token
            IERC20(token).safeTransfer(owner(), amount);
        }
    }

    /**
     * @notice Get contract balance for a specific token
     * @param token Token address (address(0) for native)
     */
    function getBalance(address token) external view returns (uint256) {
        if (token == address(0)) {
            return address(this).balance;
        } else {
            return IERC20(token).balanceOf(address(this));
        }
    }

    // Allow the contract to receive native tokens for CCIP fees
    receive() external payable {}
} 