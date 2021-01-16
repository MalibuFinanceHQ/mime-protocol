// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;
pragma abicoder v2;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

import "./interfaces/ICopyTrader.sol";
import "./interfaces/ITradingStrategy.sol";
import "./interfaces/IABIManipulator.sol";

import "./utils/ABIParserLib.sol";

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
     * @dev map(protocol => interactionAllowed).
     */
    mapping(address => bool) recipientsWhitelist;

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

    function relay(address recipient_, bytes calldata abiEncodedCall_)
        external
    {
        bytes4 methodSignature =
            ABIParserLib.extractMethodSignature(abiEncodedCall_);
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

        emit RelayPoolCharged(charge_);
    }

    function _chargeOperationsPool(PoolCharge memory charge_) internal {
        operationsPools[charge_.asset] = operationsPools[charge_.asset].add(
            charge_.value
        );

        emit OperationsPoolCharged(charge_);
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

    function _relay(
        uint256 gasLimit_,
        address recipient_,
        uint256 value_,
        uint256 dataLength_,
        bytes calldata abiEncodedCall_,
        bytes calldata signature_
    ) internal {
        bytes4 methodSignature =
            ABIParserLib.extractMethodSignature(abiEncodedCall_);

        // TODO verify that relayed transaction is signed by _followedTrader

        require(
            recipientsWhitelist[recipient_],
            "CopyTrader:_relay, recipient not whitelisted"
        );

        bytes memory abiManipulated =
            IABIManipulator(
                tradingStrategy.manipulatorOf(recipient_, methodSignature)
            )
                .manipulate(abiEncodedCall_);

        bool result;

        assembly {
            let x := mload(0x40)
            let d := add(abiManipulated, 32)
            result := call(gasLimit_, recipient_, value_, d, dataLength_, x, 0)
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
