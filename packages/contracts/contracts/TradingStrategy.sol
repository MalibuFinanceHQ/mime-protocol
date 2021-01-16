// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;

import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "./interfaces/ITradingStrategy.sol";

contract TradingStrategy is ITradingStrategy, Ownable {
    constructor() Ownable() {}

    // Contract/Protocol/CopyTrader.recipient => method id/function selector => abi manipulation handler.
    mapping(address => mapping(bytes4 => address)) _manipulators;

    function setManipulator(
        address copiedTradesRecipient,
        bytes4 identifier,
        address manipulator
    ) external override onlyOwner {
        _manipulators[copiedTradesRecipient][identifier] = manipulator;
    }

    function manipulatorOf(address destination, bytes4 identifier)
        external
        view
        override
        returns (address)
    {
        return _manipulators[destination][identifier];
    }
}
