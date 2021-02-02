// SPDX-License-Identifier: MIT

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

    function _chargeRelayPool(PoolCharge memory charge_) internal {
        relayPools[charge_.asset] = relayPools[charge_.asset].add(
            charge_.value
        );

        emit PoolCharged(charge_, Pool.RELAY);
    }

    function _chargeOperationsPool(PoolCharge memory charge_) internal {
        emit PoolCharged(charge_, Pool.OPERATIONS);
    }

    function _withdrawFromRelayPool(PoolCharge memory withdrawal_) internal {
        _decreaseRelayPool(withdrawal_.asset, withdrawal_.value);
        if (withdrawal_.asset == address(0)) {
            msg.sender.transfer(withdrawal_.value);
        } else {
            require(
                IERC20(withdrawal_.asset).transfer(
                    msg.sender,
                    withdrawal_.value
                )
            );
        }
    }

    function _withdrawFromOperationPool(PoolCharge memory withdrawal_)
        internal
    {
        require(
            this.poolSize(Pool.OPERATIONS, withdrawal_.asset) >=
                withdrawal_.value
        );

        if (withdrawal_.asset == address(0)) {
            // TODO investigate for reentrancy.
            msg.sender.transfer(withdrawal_.value);
        } else {
            require(
                IERC20(withdrawal_.asset).transfer(
                    msg.sender,
                    withdrawal_.value
                )
            );
        }
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

    function _decreaseRelayPool(address pool_, uint256 amount_) internal {
        relayPools[pool_] = relayPools[pool_].sub(amount_);
    }

    function _balanceOf(address asset_) internal view returns (uint256) {
        if (asset_ == address(0)) {
            return address(this).balance;
        }
        return IERC20(asset_).balanceOf(asset_);
    }

    function poolSize(Pool pool_, address asset_)
        external
        view
        override
        returns (uint256)
    {
        return
            pool_ == Pool.RELAY
                ? relayPools[asset_]
                : _balanceOf(asset_).sub(relayPools[asset_]);
    }
}
