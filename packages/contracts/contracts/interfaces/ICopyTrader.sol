pragma solidity 0.7.5;

import "./ITradingStrategy.sol";

interface ICopyTrader {
    /**
     * @dev emitted when followed trader changes.
     */
    event Follow(address indexed previouslyFollowed, address indexed newFollow);

    /**
     * @dev emitted when a certain transaction relay pool is top up
     * and in consequence some funds are taken in disposition to refund transaction relayers.
     */
    event RelayPoolCharged(address indexed pool, uint256 amount);

    /**
     * @dev emmited when a relayed tx recipient is whitelisted.
     */
    event RecipientWhitelisted(address recipient);

    event TradingStrategyChange(
        address indexed previousStrategy,
        address indexed newStrategy
    );

    /**
     * @dev allows to change the followed address.
     * @notice must be called only by the contract owner.
     */
    function follow(address trader) external;

    /**
     * @dev allows the transaction relayers to relay transaction in direction to a certain address.
     * @notice must be called only by the contract owner.
     */
    function whitelist(address recipient) external;

    /**
     * @dev sets trading, ABI manipulation strategy.
     * @notice must be called only by the contract owner.
     */
    function setTradingStrategy(ITradingStrategy strategy) external;
}
