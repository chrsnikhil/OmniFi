// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract CustomERC20 is ERC20, ERC20Burnable, Ownable {
    constructor(
        string memory name, 
        string memory symbol, 
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
    }

    /**
     * @dev Mint new tokens to a specific address
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint (in wei, 18 decimals)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Public mint function for demo purposes (Hackathon only)
     * @param amount Amount of tokens to mint (in wei, 18 decimals)
     */
    function publicMint(uint256 amount) external {
        require(amount <= 1000 * 10**18, "Cannot mint more than 1000 tokens at once");
        _mint(msg.sender, amount);
    }

    /**
     * @dev Burn tokens from a specific address (for cross-chain transfers)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn (in wei, 18 decimals)
     */
    function burnFrom(address from, uint256 amount) public override {
        require(from == msg.sender || allowance(from, msg.sender) >= amount, "ERC20: insufficient allowance");
        super.burnFrom(from, amount);
    }

    /**
     * @dev Public burn function for cross-chain transfers
     * @param amount Amount of tokens to burn (in wei, 18 decimals)
     */
    function burn(uint256 amount) public override {
        super.burn(amount);
    }
}
