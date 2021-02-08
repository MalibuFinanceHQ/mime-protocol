// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;

import "../../utils/BytesLib.sol";
import "../../interfaces/IABIManipulator.sol";

import "hardhat/console.sol";

contract UniswapRouterV2Manipulator is IABIManipulator {
    using BytesLib for bytes;

    uint256 constant methodSignatureLength = 4;

    function manipulate(bytes calldata rawTxData, address ctx)
        external
        view
        override
        returns (bytes memory)
    {
        console.log(rawTxData.length);

        bytes memory begin = rawTxData.slice(0, 4 + 2 * 32);
        bytes memory to = rawTxData.slice(4 + 2 * 32, 32);
        bytes memory end = rawTxData.slice(100, rawTxData.length - 100);

        console.log(begin.length);
        console.log(to.length);
        console.log(end.length);

        bytes memory manipulated = begin.concat(abi.encode(ctx)).concat(end);

        console.log(manipulated.length);
        return manipulated;
    }
}
