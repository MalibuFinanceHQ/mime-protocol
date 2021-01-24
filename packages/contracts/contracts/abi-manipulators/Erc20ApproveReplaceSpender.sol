pragma solidity 0.7.5;

import "../interfaces/IABIManipulator.sol";
import "../utils/BytesLib.sol";

contract ERC20IncreaseAllowanceReplaceSpenderABIManipulator is IABIManipulator {
    using BytesLib for bytes;

    /**
     * @dev replaces ERC20.approve/increaseAllowance/decreaseAllowance spender field with ctx address.
     * @return tx.data with replaces spender field.
     */
    function manipulate(bytes calldata rawTxData, address ctx)
        external
        pure
        override
        returns (bytes memory)
    {
        bytes memory methodIdentifier = rawTxData.slice(0, 4);
        bytes memory value = rawTxData.slice(36, 32);
        return methodIdentifier.concat(abi.encode(ctx)).concat(value);
    }
}
