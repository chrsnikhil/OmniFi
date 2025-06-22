// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/**
 * @title MockPriceFeed
 * @dev Mock price feed for testing purposes
 */
contract MockPriceFeed is AggregatorV3Interface {
    int256 private price;
    uint256 private timestamp;
    uint80 private round;
    
    constructor(int256 _initialPrice) {
        price = _initialPrice;
        timestamp = block.timestamp;
        round = 1;
    }
    
    function decimals() external pure override returns (uint8) {
        return 8;
    }
    
    function description() external pure override returns (string memory) {
        return "Mock ETH/USD Price Feed";
    }
    
    function version() external pure override returns (uint256) {
        return 1;
    }
    
    function getRoundData(uint80 /* _roundId */)
        external
        view
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (round, price, timestamp, timestamp, round);
    }
    
    function latestRoundData()
        external
        view
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (round, price, timestamp, timestamp, round);
    }
    
    // Helper function for testing - update the price
    function updatePrice(int256 _newPrice) external {
        price = _newPrice;
        timestamp = block.timestamp;
        round++;
    }
}
