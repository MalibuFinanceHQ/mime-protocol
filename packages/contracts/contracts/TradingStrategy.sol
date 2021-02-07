// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ITradingStrategy.sol";

contract TradingStrategy is ITradingStrategy, Ownable {
    constructor() Ownable() {}

    // Contract/Protocol/CopyTrader.recipient => method id/function selector => abi manipulation handler.
    mapping(address => mapping(bytes4 => address)) public override manipulators;

    function setManipulator(
        address protocol_,
        bytes4 identifier_,
        address manipulator_
    ) external override onlyOwner {
        manipulators[protocol_][identifier_] = manipulator_;
    }
}
