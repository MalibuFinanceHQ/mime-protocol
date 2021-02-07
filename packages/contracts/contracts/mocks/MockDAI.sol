// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockDAI is ERC20 {
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply_
    ) ERC20(name_, symbol_) {
        _mint(msg.sender, initialSupply_);
    }
}
