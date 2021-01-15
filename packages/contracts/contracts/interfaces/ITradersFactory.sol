pragma solidity 0.7.5;
pragma abicoder v2;

import "./ICopyTrader.sol";

interface ITradersFactory {
    event TraderCreated(
        address onContract,
        address strategy,
        address observedAddress,
        ICopyTrader.PoolCharge[] relayPoolCharges,
        ICopyTrader.PoolCharge[] operationsPoolCharges
    );
}
