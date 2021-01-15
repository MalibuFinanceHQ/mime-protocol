pragma solidity 0.7.5;
pragma abicoder v2;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

import "./interfaces/ITradersFactory.sol";
import "./interfaces/ITradingStrategy.sol";
import "./interfaces/ICopyTrader.sol";

import "./CopyTrader.sol";

contract TradersFactory is ITradersFactory {
    using SafeMath for uint256;

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

        uint256 _chargedEther;

        for (uint256 i = 0; i < relayPoolCharges_.length; i++) {
            _chargePool(address(trader_), _chargedEther, relayPoolCharges_[i]);
        }
        for (uint256 i = 0; i < operationsPoolCharges_.length; i++) {
            _chargePool(
                address(trader_),
                _chargedEther,
                operationsPoolCharges_[i]
            );
        }

        if (_chargedEther != 0) {
            payable(address(trader_)).transfer(_chargedEther);
        }

        Ownable(address(trader_)).transferOwnership(msg.sender);

        emit TraderCreated(
            msg.sender,
            address(strategy_),
            observe_,
            relayPoolCharges_,
            operationsPoolCharges_
        );
    }

    function _chargePool(
        address copyTraderContract_,
        uint256 alreadyChargedEther_,
        ICopyTrader.PoolCharge memory poolCharge_
    ) internal {
        if (poolCharge_.asset == address(0)) {
            require(
                msg.value == poolCharge_.value.add(alreadyChargedEther_),
                "TradersFactory:_chargePool, ether failed"
            );
            alreadyChargedEther_ = alreadyChargedEther_.add(
                alreadyChargedEther_
            );
        } else {
            require(
                IERC20(poolCharge_.asset).transferFrom(
                    msg.sender,
                    copyTraderContract_,
                    poolCharge_.value
                ),
                "TradersFactory:_chargePool, token transfer failed"
            );
        }
    }
}
