// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "./CopyTraderManager.sol";
import "./CopyTraderRelaysHandler.sol";
import "./CopyTraderPools.sol";

import "./interfaces/ICopyTrader.sol";
import "./interfaces/ITradingStrategy.sol";

import "./utils/PricesLib.sol";

contract CopyTrader is
    ICopyTrader,
    CopyTraderManager,
    CopyTraderRelaysHandler,
    CopyTraderPools
{
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
     * @dev asset used to refund the relayer's fees.
     */
    address public feesPaymentsAsset;

    /// ===== EXTERNAL STATE CHANGERS ===== ///

    /// Proxy initializer
    /// @inheritdoc ICopyTrader
    function init(
        address initialFollowedTrader_,
        uint256 relaySinceNonce_,
        ITradingStrategy tradingStrategy_
    ) external override {
        // Require proxy is not initialized.
        require(!proxyInitialized, "CopyTrader:init, proxy initialized");
        _follow(initialFollowedTrader_);
        _setTradingStrategy(tradingStrategy_);
        _setRelaySinceNonce(relaySinceNonce_);
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

    function withdrawFromOperationPool(PoolCharge calldata withdrawal_)
        external
        override
        onlyManager
    {
        _withdrawFromOperationPool(withdrawal_);
    }

    function withdrawFromRelayPool(PoolCharge calldata withdrawal_)
        external
        override
        onlyManager
    {
        _withdrawFromRelayPool(withdrawal_);
    }

    function setRelayerFee(uint256 fee_) external onlyManager() {
        _setRelayerFee(fee_);
    }

    function relay(
        address refundAsset_,
        bytes calldata transaction_,
        uint8 v_,
        bytes32 r_,
        bytes32 s_
    ) external {
        uint256 gasUsed =
            (_relay(transaction_, followedTrader, tradingStrategy, v_, r_, s_))
                .add(
                refundAsset_ == address(0)
                    ? AFTER_RELAY_ETH_TRANSFER_GAS_USAGE_APPROXIMATION
                    : AFTER_RELAY_ERC20_TRANSFER_GAS_USAGE_APPROXIMATION
            )
                .add(AFTER_RELAY_FETCH_GAS_USAGE_APPROXIMATION);

        uint256 weiSpent = gasUsed.mul(tx.gasprice);
        uint256 weiToBeRefunded =
            weiSpent.add(weiSpent.div(RELAYER_FEE_BASE).mul(relayerFee));
        uint256 refundAmount =
            PricesLib.tokenAmountFromWei(refundAsset_, weiToBeRefunded);

        if (refundAsset_ == address(0)) {
            msg.sender.transfer(refundAmount);
        } else {
            require(
                IERC20(refundAsset_).transfer(msg.sender, refundAmount),
                "CopyTrader:relay, ERC20 transfer failed"
            );
        }

        _decreaseRelayPool(refundAsset_, refundAmount);
    }

    /// ===== INTERNAL STATE CHANGERS ===== ///

    function _follow(address trader_) internal {
        emit Follow(followedTrader, trader_);

        followedTrader = trader_;
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

    // TODO remove this debugging function.
    function isRLPSignatureCorrect(
        bytes calldata transaction_,
        uint8 v_,
        bytes32 r_,
        bytes32 s_
    ) external view returns (bool, bytes32) {
        return _isRLPSignatureCorrect(transaction_, v_, r_, s_, followedTrader);
    }
}
