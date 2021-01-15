pragma solidity 0.7.5;
pragma abicoder v2;

import "openzeppelin-solidity/contracts/access/Ownable.sol";

import "./interfaces/ITradersFactory.sol";
import "./interfaces/ITradingStrategy.sol";
import "./interfaces/ICopyTrader.sol";

import "./CopyTrader.sol";

contract TradersFactory is ITradersFactory {
    function createNew(
        address observe_,
        ITradingStrategy strategy_,
        ICopyTrader.PoolCharge[] calldata operationsPoolCharges_,
        ICopyTrader.PoolCharge[] calldata relayPoolCharges_
    ) external payable {
        ICopyTrader trader_ =
            new CopyTrader(
                observe_,
                strategy_,
                operationsPoolCharges_,
                relayPoolCharges_
            );

        Ownable(address(trader_)).transferOwnership(msg.sender);

        emit TraderCreated(
            msg.sender,
            address(strategy_),
            observe_,
            relayPoolCharges_,
            operationsPoolCharges_
        );
    }
}
