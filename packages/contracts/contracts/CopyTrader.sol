// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "./CopyTraderManager.sol";
import "./CopyTraderRelaysHandler.sol";

import "./interfaces/ICopyTrader.sol";
import "./interfaces/ITradingStrategy.sol";

import "./utils/PricesLib.sol";

import "hardhat/console.sol";

contract CopyTrader is ICopyTrader, CopyTraderManager, CopyTraderRelaysHandler {
    using SafeMath for uint256;

    /**
     * @dev followed trading strategy.
     */
    ITradingStrategy public tradingStrategy;

    /**
     * @dev proxy managament helper.
     */
    bool private proxyInitialized;

    /**
     * @dev address which's transactions are to be copied.
     */
    address public followedTrader;

    /**
     * @dev map(poolAsset => poolSize).
     * This mapping contains the amount of some tokens locked, in order to pay the tx copping relayers.
     */
    mapping(address => uint256) public relayPools;

    /**
     * @dev asset used to refund the relayer's fees.
     */
    address public feesPaymentsAsset;

    /// ===== EXTERNAL STATE CHANGERS ===== ///

    /// Proxy initializer
    /// @inheritdoc ICopyTrader
    function init(
        address initialFollowedTrader_,
        ITradingStrategy tradingStrategy_
    ) external override {
        // Require proxy is not initialized.
        require(!proxyInitialized, "CopyTrader:init, proxy initialized");
        _follow(initialFollowedTrader_);
        _setTradingStrategy(tradingStrategy_);
    }

    /// @inheritdoc ICopyTrader
    function follow(address trader_) external override onlyManager {
        require(trader_ != msg.sender, "You cannot follow yourself");
        require(
            trader_ != address(this),
            "This contract instance cannot follow itself"
        );
        require(
            trader_ != followedTrader,
            "You are already following this address"
        );

        _follow(trader_);
    }

    /// @inheritdoc ICopyTrader
    function setTradingStrategy(ITradingStrategy strategy_)
        external
        override
        onlyManager
    {
        _setTradingStrategy(strategy_);
    }

    function chargePools(
        PoolCharge[] calldata charges_,
        Pool[] calldata chargedPools_
    ) external payable {
        _handleMultipleCharges(charges_, chargedPools_);
    }

    function setRelayerFee(uint256 fee_) external onlyManager() {
        _setRelayerFee(fee_);
    }

    /// ===== INTERNAL STATE CHANGERS ===== ///

    function _follow(address trader_) internal {
        emit Follow(followedTrader, trader_);

        followedTrader = trader_;
    }

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

    function _setTradingStrategy(ITradingStrategy strategy_) internal {
        emit TradingStrategyChange(
            address(tradingStrategy),
            address(strategy_)
        );
        tradingStrategy = strategy_;
    }

    function setFeesPaymentsAsset(address asset_) external override {
        feesPaymentsAsset = asset_;
    }

    /// ===== GETTERS ===== ///

    function tokenAmountFromWei(address token, uint256 weiToConvert)
        external
        view
        override
        returns (uint256 tokenAmount)
    {
        return PricesLib.tokenAmountFromWei(token, weiToConvert);
    }

    function poolSize(Pool pool_, address asset_)
        external
        view
        override
        returns (uint256)
    {
        return
            pool_ == Pool.RELAY ? relayPools[asset_] : operationsPools[asset_];
    }

    function isRLPSignatureCorrect(
        bytes calldata transaction_,
        uint8 v_,
        bytes32 r_,
        bytes32 s_
    ) external view returns (bool, bytes32) {
        return _isRLPSignatureCorrect(transaction_, v_, r_, s_, followedTrader);
    }
}
