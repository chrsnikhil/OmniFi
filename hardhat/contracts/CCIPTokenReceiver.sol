// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ICustomERC20 {
    function mint(address to, uint256 amount) external;
}

contract CCIPTokenReceiver is CCIPReceiver, Ownable {
    address public trustedSender;
    uint64 public trustedSourceChainSelector;
    ICustomERC20 public token;

    event TokensMinted(address indexed to, uint256 amount, bytes32 messageId);

    constructor(
        address _router,
        address _token,
        address _trustedSender,
        uint64 _trustedSourceChainSelector
    ) CCIPReceiver(_router) Ownable(msg.sender) {
        token = ICustomERC20(_token);
        trustedSender = _trustedSender;
        trustedSourceChainSelector = _trustedSourceChainSelector;
    }

    function _ccipReceive(Client.Any2EVMMessage memory message) internal override {
        require(message.sourceChainSelector == trustedSourceChainSelector, "Invalid source chain");
        require(abi.decode(message.sender, (address)) == trustedSender, "Invalid sender");

        // Decode the receiver and amount from the message data
        (address receiver, uint256 amount) = abi.decode(message.data, (address, uint256));

        // Mint tokens to the receiver
        token.mint(receiver, amount);

        emit TokensMinted(receiver, amount, message.messageId);
    }

    // Admin functions to update trusted sender or chain if needed
    function setTrustedSender(address _trustedSender) external onlyOwner {
        trustedSender = _trustedSender;
    }

    function setTrustedSourceChainSelector(uint64 _selector) external onlyOwner {
        trustedSourceChainSelector = _selector;
    }
} 