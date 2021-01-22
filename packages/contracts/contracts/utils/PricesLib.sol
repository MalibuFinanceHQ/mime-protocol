// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;

import "@openzeppelin/contracts/math/SafeMath.sol";

// Uniswap integration
// import '@uniswap/v2-periphery/contracts/libraries/UniswapV2Library.sol';
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";

// address public immutable uniswapFactory;

library PricesLib {
    using SafeMath for uint256;

    function getLastPrice(address liquidityPool)
        internal
        view
        returns (uint256)
    {
        IUniswapV2Pair pair = IUniswapV2Pair(liquidityPool);
        require(address(pair) != address(0), "Invalid Uniswap pair");
        (uint112 reserve0, uint112 reserve1, ) = pair.getReserves();
        uint256 token0Balance = uint256(reserve0);
        uint256 token1Balance = uint256(reserve1);
        uint256 price = token0Balance.div(token1Balance);
        return price;
    }
}
