// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;

import "./BytesLib.sol";

library ABIParserLib {
    using BytesLib for bytes;

    function extractMethodSignature(bytes memory abiEncodedCall)
        internal
        pure
        returns (bytes4 signature)
    {
        bytes memory dataSliced = abiEncodedCall.slice(0, 4);

        assembly {
            signature := mload(add(dataSliced, 32))
        }
    }
}
