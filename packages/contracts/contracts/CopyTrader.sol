// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "./CopyTraderManager.sol";

import "./interfaces/ICopyTrader.sol";
import "./interfaces/ITradingStrategy.sol";
import "./interfaces/IABIManipulator.sol";

import "./utils/AbiUtils.sol";
import "./utils/EIP155Utils.sol";
import "./utils/ECDSA.sol";
import "./utils/PricesLib.sol";

import "hardhat/console.sol";

contract CopyTrader is ICopyTrader, CopyTraderManager {
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
     * @dev map(poolAsset => poolSize).
     * This mapping contains the amount of some tokens locked, in order to execute txns.
     */
    mapping(address => uint256) public operationsPools;

    /**
     * @dev stores the hashes of relayed txns to avoid replay protection.
     */
    mapping(bytes32 => bool) public relayedTxns;

    /**
     * @dev protection against relaying multiple different transactions within the same block.
     */
    uint256 public lastRelayBlockNumber;

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

    function _isRLPSignatureCorrect(
        bytes calldata transaction_,
        uint8 v_,
        bytes32 r_,
        bytes32 s_,
        address signer_
    ) internal pure returns (bool, bytes32) {
        bytes32 txHash = keccak256(transaction_);
        address signer = ECDSA.recover(txHash, v_, r_, s_);
        return (signer_ == signer, txHash);
    }

    function _relay(
        bytes calldata transaction_,
        uint8 txSigV_,
        bytes32 txSigR_,
        bytes32 txSigS_
    ) internal {
        require(
            lastRelayBlockNumber != block.number,
            "CopyTrader:_relay, a transaction has been relayed during current block"
        );

        (bool signatureOk, bytes32 txHash) =
            _isRLPSignatureCorrect(
                transaction_,
                txSigV_,
                txSigR_,
                txSigS_,
                followedTrader
            );

        require(signatureOk && !relayedTxns[txHash]);

        EIP155Utils.EIP155Transaction memory eip155tx =
            EIP155Utils.decodeEIP155Transaction(transaction_);

        bytes4 methodSignature = AbiUtils.extractMethodSignature(eip155tx.data);

        require(
            tradingStrategy.manipulatorOf(eip155tx.to, methodSignature) !=
                address(0),
            "CopyTrader:_relay, relayed tx.data format is not supported by strategy"
        );

        bytes memory abiManipulated =
            IABIManipulator(
                tradingStrategy.manipulatorOf(eip155tx.to, methodSignature)
            )
                .manipulate(eip155tx.data);

        uint256 dataLength = abiManipulated.length;
        uint256 gasLimit = eip155tx.gasLimit;
        uint256 value = eip155tx.value;
        address to = eip155tx.to;

        bool result;

        assembly {
            let x := mload(0x40)
            let d := add(abiManipulated, 32)
            result := call(gasLimit, to, value, d, dataLength, x, 0)
        }

        require(result, "CopyTrader:_relay, execution failed");

        relayedTxns[txHash] = true;
        lastRelayBlockNumber = block.number;

        // TODO refund the tx
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
