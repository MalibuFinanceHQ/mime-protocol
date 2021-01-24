pragma solidity 0.7.5;

import "../interfaces/IABIManipulator.sol";
import "../utils/BytesLib.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

contract CheckERC20ApproveSpenderManipulator is IABIManipulator, Ownable {
    using BytesLib for bytes;

    mapping(address => bool) public whitelistedSpenders;

    constructor() Ownable() {}

    function whitelist(address spender) external onlyOwner {
        whitelistedSpenders[spender] = true;
    }

    /**
     * @dev checks if spender is whitelisted, if not throws, if yes returns same data.
     * @return tx.data.
     */
    function manipulate(bytes calldata rawTxData, address ctx)
        external
        view
        override
        returns (bytes memory)
    {
        bytes memory spenderBytes = rawTxData.slice(4, 32);
        address properSpender = spenderBytes.toAddress(12);
        require(whitelistedSpenders[properSpender]);
        return rawTxData;
    }
}
