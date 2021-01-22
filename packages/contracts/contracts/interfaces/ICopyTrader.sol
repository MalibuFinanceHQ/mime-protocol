// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;
pragma abicoder v2;

import "./ITradingStrategy.sol";

interface ICopyTrader {
    enum Pool {RELAY, OPERATIONS}
    /**
     * @dev emitted when followed trader changes.
     */
    event Follow(address indexed previouslyFollowed, address indexed newFollow);

    /**
     * @dev emitted when a certain pool is top up.
     */
    event PoolCharged(PoolCharge charge, Pool pool);

    /**
     * @dev emmited when a relayed tx recipient is whitelisted.
     */
    event RecipientWhitelisted(address recipient);

    event TradingStrategyChange(
        address indexed previousStrategy,
        address indexed newStrategy
    );

    /**
     * @dev used as arg when a certain pool is charged,
     * instead of passing address[] and uint[] an array of PoolCharge[] will be used to simplify.
     */
    struct PoolCharge {
        address asset;
        uint256 value;
    }

    /**
     * @dev allows to change the followed address.
     * @notice must be called only by the contract owner.
     */
    function follow(address trader) external;

    /**
     * @dev sets trading, ABI manipulation strategy.
     * @notice must be called only by the contract owner.
     */
    function setTradingStrategy(ITradingStrategy strategy) external;

    /// ===== GETTERS ===== ///

    /**
     * @dev returns the amount of tokens allocated in a pool
     */
    function poolSize(Pool pool_, address asset_)
        external
        view
        returns (uint256);

    /**
     * @dev allows a relayer to update the asset to use for refunds.
     * @notice the implementation must require the call
     * to be made only by a relayer.
     */
    function setFeesPaymentsAsset(address asset_) external;

    function fetchLastPrice() external view returns (uint256);
}
