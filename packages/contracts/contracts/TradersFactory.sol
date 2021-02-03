// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;
pragma abicoder v2;

import "@openzeppelin/contracts/math/SafeMath.sol";

import "./interfaces/ITradersFactory.sol";
import "./interfaces/ITradingStrategy.sol";
import "./interfaces/ICopyTrader.sol";
import "./interfaces/ICopyTraderManager.sol";

import "./proxy/ProxyFactory.sol";

// import "hardhat/console.sol";

contract TradersFactory is ITradersFactory, ProxyFactory {
    using SafeMath for uint256;

    /**
     * @dev stores proxy implementation bytecode.
     */
    address private proxyLogic;

    constructor(address proxyLogic_) {
        proxyLogic = proxyLogic_;
    }

    function createNew(
        address observe_,
        uint256 relaySinceNonce_,
        ITradingStrategy strategy_
    ) external returns (address) {
        address trader_ = createClone(proxyLogic);

        ICopyTraderManager(trader_).setManager(msg.sender);
        ICopyTrader(trader_).init(observe_, relaySinceNonce_, strategy_);

        emit TraderCreated(
            msg.sender,
            address(trader_),
            address(strategy_),
            observe_,
            relaySinceNonce_
        );
        return trader_;
    }
}
