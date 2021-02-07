// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;

import "../interfaces/IABIManipulator.sol";
import "../utils/BytesLib.sol";

contract AaveManipulator is IABIManipulator {
    using BytesLib for bytes;

    /**
        @dev _deposit manipulates rawTxData and returns
        a manipulated bytes memory with a modified "onBehalfOf" field
     */
    function _deposit(bytes calldata rawTxData, address ctx)
        internal
        pure
        returns (bytes memory)
    {
        bytes memory methodID = rawTxData.slice(0, 4);
        bytes memory asset = rawTxData.slice(4, 32);
        bytes memory amount = rawTxData.slice(4 + 32, 32);
        bytes memory referralCode = rawTxData.slice(4 + 32 + 32 + 32, 32);
        return
            methodID
                .concat(asset)
                .concat(amount)
                .concat(abi.encode(ctx))
                .concat(referralCode);
    }

    function manipulate(bytes calldata rawTxData, address ctx)
        external
        view
        override
        returns (bytes memory)
    {
        // TODO: sanity checks and function selection
        return _deposit(rawTxData, ctx);
    }
}
