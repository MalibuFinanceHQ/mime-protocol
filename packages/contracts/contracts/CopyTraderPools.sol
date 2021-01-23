pragma solidity 0.7.5;
pragma abicoder v2;

import "./interfaces/ICopyTrader.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

abstract contract CopyTraderPools is ICopyTrader {
    using SafeMath for uint256;

    /**
     * @dev map(poolAsset => poolSize).
     * This mapping contains the amount of some tokens locked, in order to pay the tx copping relayers.
     */
    mapping(address => uint256) public relayPools;

    /**
     * @dev map(poolAsset => poolSize).
     * This mapping contains the amount of some tokens locked, in order to execute txns.
     */
    mapping(address => uint256) public operationsPools;

    function _chargeRelayPool(PoolCharge memory charge_) internal {
        relayPools[charge_.asset] = relayPools[charge_.asset].add(
            charge_.value
        );

        emit PoolCharged(charge_, Pool.RELAY);
    }

    function _chargeOperationsPool(PoolCharge memory charge_) internal {
        operationsPools[charge_.asset] = operationsPools[charge_.asset].add(
            charge_.value
        );

        emit PoolCharged(charge_, Pool.OPERATIONS);
    }

    function _handleMultipleCharges(
        PoolCharge[] memory charges_,
        Pool[] memory chargedPools_
    ) internal {
        require(charges_.length == chargedPools_.length);
        uint256 chargedEther;
        for (uint256 i = 0; i < charges_.length; i++) {
            if (charges_[i].asset == address(0)) {
                require(msg.value >= chargedEther.add(charges_[i].value));
            } else {
                require(
                    IERC20(charges_[i].asset).transferFrom(
                        msg.sender,
                        address(this),
                        charges_[i].value
                    )
                );
            }

            chargedPools_[i] == Pool.RELAY
                ? _chargeRelayPool(charges_[i])
                : _chargeOperationsPool(charges_[i]);
        }
    }
}
