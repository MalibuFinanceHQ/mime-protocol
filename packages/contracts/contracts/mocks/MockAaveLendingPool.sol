// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @dev Sample lending pool mock used just to test if the deposit() signature is handled correctly.
 */
contract MockLendingPool {
    function deposit(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external {
        require(
            IERC20(asset).transferFrom(msg.sender, address(this), amount),
            "LendingPool.deposit, deposit failed"
        );
    }
}
