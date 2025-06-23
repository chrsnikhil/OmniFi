// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FlexibleCCIPRouter is Ownable {
    error InvalidAddress();
    error InvalidAmount();
    error TransferFailed();
    error ApproveFailed();
    
    IRouterClient public immutable ccipRouter;
    
    event TokensTransferred(
        address indexed token,
        address indexed sender,
        address indexed receiver,
        uint256 amount,
        uint64 destinationChainSelector
    );

    constructor(address _ccipRouter) Ownable(msg.sender) {
        if (_ccipRouter == address(0)) revert InvalidAddress();
        ccipRouter = IRouterClient(_ccipRouter);
    }

    /**
     * @notice Send any ERC20 token cross-chain via CCIP
     * @param token Address of the ERC20 token to send
     * @param destinationChainSelector Chain selector for the destination chain
     * @param receiver Address to receive tokens on the destination chain
     * @param amount Amount of tokens to send
     * @param feeToken Address of the token to pay CCIP fees (address(0) for native)
     */
    function sendTokensCrossChain(
        address token,
        uint64 destinationChainSelector,
        address receiver,
        uint256 amount,
        address feeToken
    ) external payable {
        if (token == address(0)) revert InvalidAddress();
        if (receiver == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();

        // Transfer tokens from sender to this contract
        bool success = IERC20(token).transferFrom(msg.sender, address(this), amount);
        if (!success) revert TransferFailed();

        // Approve CCIP router to spend tokens
        success = IERC20(token).approve(address(ccipRouter), amount);
        if (!success) revert ApproveFailed();

        // Build the CCIP message
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(receiver),
            data: "",
            tokenAmounts: new Client.EVMTokenAmount[](1),
            extraArgs: "",
            feeToken: feeToken
        });

        message.tokenAmounts[0] = Client.EVMTokenAmount({
            token: token,
            amount: amount
        });

        // Get the fee required for the CCIP transfer
        uint256 fees = ccipRouter.getFee(destinationChainSelector, message);
        if (msg.value < fees) revert("Insufficient fee");

        // Send the CCIP message
        ccipRouter.ccipSend{value: msg.value}(destinationChainSelector, message);

        emit TokensTransferred(
            token,
            msg.sender,
            receiver,
            amount,
            destinationChainSelector
        );
    }

    /**
     * @notice Get the fee for a CCIP transfer
     * @param destinationChainSelector The destination chain selector
     * @param token The token to transfer
     * @param receiver The receiver address
     * @param amount The amount to transfer
     * @param feeToken The token to pay fees in
     */
    function getCCIPFee(
        uint64 destinationChainSelector,
        address token,
        address receiver,
        uint256 amount,
        address feeToken
    ) external view returns (uint256) {
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(receiver),
            data: "",
            tokenAmounts: new Client.EVMTokenAmount[](1),
            extraArgs: "",
            feeToken: feeToken
        });

        message.tokenAmounts[0] = Client.EVMTokenAmount({
            token: token,
            amount: amount
        });

        return ccipRouter.getFee(destinationChainSelector, message);
    }

    /**
     * @notice Withdraw stuck tokens (emergency function)
     * @param token The token to withdraw
     * @param amount The amount to withdraw
     */
    function withdrawToken(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        
        bool success = IERC20(token).transfer(owner(), amount);
        if (!success) revert TransferFailed();
    }

    /**
     * @notice Withdraw stuck native tokens (emergency function)
     * @param amount The amount to withdraw
     */
    function withdrawNative(uint256 amount) external onlyOwner {
        if (amount == 0) revert InvalidAmount();
        
        (bool success, ) = owner().call{value: amount}("");
        if (!success) revert TransferFailed();
    }

    // Allow the contract to receive native token for CCIP fees
    receive() external payable {}
} 