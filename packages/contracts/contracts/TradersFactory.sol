// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;
pragma abicoder v2;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./interfaces/ITradersFactory.sol";
import "./interfaces/ITradingStrategy.sol";
import "./interfaces/ICopyTrader.sol";

import "./CopyTrader.sol";

import "hardhat/console.sol";

contract TradersFactory is ITradersFactory {
    using SafeMath for uint256;

    function createNew(address observe_, ITradingStrategy strategy_)
        external
        returns (address)
    {
        ICopyTrader trader_ = new CopyTrader(observe_, strategy_);

        Ownable(address(trader_)).transferOwnership(msg.sender);

        emit TraderCreated(address(trader_), address(strategy_), observe_);
        return address(trader_);
    }
}
