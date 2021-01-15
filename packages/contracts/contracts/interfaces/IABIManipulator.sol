pragma solidity 0.7.5;

interface IABIManipulator {
    function manipulate(bytes calldata abiEncodedCall)
        external
        pure
        returns (bytes memory);
}
