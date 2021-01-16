// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;
pragma abicoder v2;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";

import "./interfaces/ICopyTrader.sol";
import "./interfaces/ITradingStrategy.sol";
import "./interfaces/IABIManipulator.sol";

import "./utils/AbiUtils.sol";
import "./utils/EIP155Utils.sol";

import "hardhat/console.sol";

contract CopyTrader is ICopyTrader, Ownable {
    using SafeMath for uint256;

    constructor(
        address initialFollowedTrader_,
        ITradingStrategy tradingStrategy_
    ) Ownable() {
        _follow(initialFollowedTrader_);
        _setTradingStrategy(tradingStrategy_);
    }

    ITradingStrategy public tradingStrategy;

    /**
     * @dev address which's transactions are to be copied.
     */
    address public followedTrader;

    /**
     * @dev map(poolAsset => poolSize).
     * This mapping contains the amount of some tokens locked, in order to pay the tx copping relayers.
     */
    mapping(address => uint256) relayPools;

    /**
     * @dev map(poolAsset => poolSize).
     * This mapping contains the amount of some tokens locked, in order to execute txns.
     */
    mapping(address => uint256) operationsPools;

    /// ===== EXTERNAL STATE CHANGERS ===== ///

    /// @inheritdoc ICopyTrader
    function follow(address trader_) external override onlyOwner {
        _follow(trader_);
    }

    /// @inheritdoc ICopyTrader
    function setTradingStrategy(ITradingStrategy strategy_)
        external
        override
        onlyOwner
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
        bytes calldata signature_,
        address signer_
    ) internal pure returns (bool) {
        bytes32 txHash = keccak256(transaction_);
        return signer_ == ECDSA.recover(txHash, signature_);
    }

    function _relay(bytes calldata transaction_, bytes calldata signature_)
        internal
    {
        // TODO replay protection
        require(
            _isRLPSignatureCorrect(transaction_, signature_, followedTrader)
        );

        EIP155Utils.EIP155Transaction memory eip155tx =
            EIP155Utils.decodeEIP155Transaction(transaction_);

        bytes4 methodSignature = AbiUtils.extractMethodSignature(eip155tx.data);

        require(
            tradingStrategy.manipulatorOf(eip155tx.to, methodSignature) !=
                address(0),
            "CopyTrader:_relay, method not defined in strategy"
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

        require(result, "CopyTrader:_relay, execution failed ");
    }

    /// ===== GETTERS ===== ///

    function poolSize(Pool pool_, address asset_)
        external
        view
        override
        returns (uint256)
    {
        return
            pool_ == Pool.RELAY ? relayPools[asset_] : operationsPools[asset_];
    }
}
