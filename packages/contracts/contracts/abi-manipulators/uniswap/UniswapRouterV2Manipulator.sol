// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;

import "../../utils/BytesLib.sol";
import "../../interfaces/IABIManipulator.sol";

contract UniswapRouterV2Manipulator is IABIManipulator {
    using BytesLib for bytes;

    function manipulate(bytes calldata rawTxData, address ctx)
        external
        view
        override
        returns (bytes memory)
    {
        bytes memory beforeTo = rawTxData.slice(0, 4 + (3 * 32));
        bytes memory to = rawTxData.slice(4 + (3 * 32), 32);
        bytes memory afterTo =
            rawTxData.slice(4 + (3 * 32) + 32, rawTxData.length - 132);
        return beforeTo.concat(abi.encode(ctx)).concat(afterTo);
    }
}
