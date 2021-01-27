// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;

import "../interfaces/IABIManipulator.sol";
import "../utils/BytesLib.sol";

import "hardhat/console.sol";

contract AaveManipulator is IABIManipulator {
    using BytesLib for bytes;

    function _deposit(bytes calldata rawTxData, address ctx)
        internal
        pure
        returns (bytes memory)
    {
        // bytes memory assetBytes = rawTxData.slice(4, 32);
        // address asset = assetBytes.toAddress(12);
        // uint256 amount = 100 * 1e18; // TODO: parse from rawTxData
        // address onBehalfOf = ctx;
        // uint16 referralCode = 0;

        // IERC20(asset).approve(address(lendingPool), amount);
        // lendingPool.deposit(asset, amount, onBehalfOf, referralCode);

        bytes memory methodID = rawTxData.slice(0, 4);
        return
            methodID.concat(abi.encode(ctx)).concat(
                rawTxData.slice(36, rawTxData.length - 1)
            );
    }

    function manipulate(bytes calldata rawTxData, address ctx)
        external
        view
        override
        returns (bytes memory)
    {
        // TODO: sanity checks
        return _deposit(rawTxData, ctx);
    }
}
