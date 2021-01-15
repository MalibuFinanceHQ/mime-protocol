pragma solidity 0.7.5;

interface ITradingStrategy {
    function setManipulator(
        address copiedTradesRecipient,
        bytes4 identifier,
        address manipulator
    ) external;

    function manipulatorOf(address destination, bytes4 identifier)
        external
        view
        returns (address);
}
