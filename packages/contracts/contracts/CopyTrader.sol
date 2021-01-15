pragma solidity 0.7.5;

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
        ITradingStrategy tradingStrategy_,
        address[] memory initialTxRelayersRewardsPoolsAssets_,
        uint256[] memory initialTxRelayersRewardsPoolsAmounts_,
        address[] memory initialRecipientsWhitelist_
    ) payable Ownable() {
        _follow(initialFollowedTrader_);

        require(
            initialTxRelayersRewardsPoolsAssets_.length ==
                initialTxRelayersRewardsPoolsAmounts_.length,
            "Invalid relay pools args"
        );

        for (
            uint256 i = 0;
            i < initialTxRelayersRewardsPoolsAmounts_.length;
            i++
        ) {
            _chargeRelayPool(
                msg.sender,
                initialTxRelayersRewardsPoolsAssets_[i],
                initialTxRelayersRewardsPoolsAmounts_[i]
            );
        }

        for (uint256 i = 0; i < initialRecipientsWhitelist_.length; i++) {
            _whitelist(initialRecipientsWhitelist_[i]);
        }

        _setTradingStrategy(tradingStrategy_);
    }

    ITradingStrategy tradingStrategy;

    /**
     * @dev address which's transactions are to be copied.
     */
    address followedTrader;

    /**
     * @dev map(protocol => interactionAllowed).
     */
    mapping(address => bool) recipientsWhitelist;

    /**
     * @dev map(poolAsset => poolSize).
     * This mapping contains the amount of some tokens locked, in order to pay the tx copping relayers.
     */
    mapping(address => uint256) relayPools;

    /// ===== EXTERNAL STATE CHANGERS ===== ///

    /// @inheritdoc ICopyTrader
    function follow(address trader_) external override onlyOwner {
        _follow(trader_);
    }

    /// @inheritdoc ICopyTrader
    function whitelist(address recipient_) external override onlyOwner {
        _whitelist(recipient_);
    }

    /// @inheritdoc ICopyTrader
    function setTradingStrategy(ITradingStrategy strategy_)
        external
        override
        onlyOwner
    {
        _setTradingStrategy(strategy_);
    }

    // TODO
    function relay(address recipient_, bytes calldata abiEncodedCall_)
        external
    {
        bytes4 methodSignature =
            ABIParserLib.extractMethodSignature(abiEncodedCall_);

        console.logBytes4(methodSignature);
    }

    /// ===== INTERNAL STATE CHANGERS ===== ///

    function _follow(address trader_) internal {
        emit Follow(followedTrader, trader_);
        followedTrader = trader_;
    }

    function _whitelist(address recipient_) internal {
        recipientsWhitelist[recipient_] = true;
        emit RecipientWhitelisted(recipient_);
    }

    function _chargeRelayPool(
        address chargedBy_,
        address pool_,
        uint256 amount_
    ) internal {
        relayPools[pool_] = relayPools[pool_].add(amount_);

        if (pool_ != address(0)) {
            require(
                IERC20(pool_).transferFrom(chargedBy_, address(this), amount_),
                "CopyTrader:_chargeRelayPool, relay pool charge failed"
            );
        } else {
            require(
                msg.value == amount_,
                "CopyTrader:_chargeRelayPool, relay pool charge failed"
            );
        }
        emit RelayPoolCharged(pool_, amount_);
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
}
