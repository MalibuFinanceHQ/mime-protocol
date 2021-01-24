// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;

interface IABIManipulator {
    function manipulate(bytes calldata rawTxData, address ctx)
        external
        pure
        returns (bytes memory);
}
