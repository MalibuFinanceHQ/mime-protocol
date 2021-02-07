// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;
pragma abicoder v2;

import "./ICopyTrader.sol";

// TODO consider to make some params indexed.
interface ITradersFactory {
    event TraderCreated(
        address creator,
        address onContract,
        address strategy,
        address observedAddress,
        uint256 relaySinceNonce
    );
}
