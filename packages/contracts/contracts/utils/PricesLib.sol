// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;

import "@openzeppelin/contracts/math/SafeMath.sol";

import "../interfaces/uniswap/IUniswapV2Factory.sol";
import "../interfaces/uniswap/IUniswapV2Pair.sol";

library PricesLib {
    using SafeMath for uint256;

    IUniswapV2Factory public constant UNISWAP_V2_FACTORY =
        IUniswapV2Factory(0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f);

    address public constant WETH_TOKEN =
        0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    function tokenAmountFromWei(address token, uint256 weiToConvert)
        public
        view
        returns (uint256 tokenAmount)
    {
        if (token == WETH_TOKEN || token == address(0)) {
            return weiToConvert;
        }
        require(weiToConvert > 0, "PricesLib: INSUFFICIENT_AMOUNT");
        IUniswapV2Pair pair =
            IUniswapV2Pair(UNISWAP_V2_FACTORY.getPair(token, WETH_TOKEN));
        require(address(pair) != address(0), "PricesLib: INVALID_PAIR");
        (uint112 reserve0, uint112 reserve1, ) = pair.getReserves();

        // solhint-disable-next-line
        require(
            reserve0 > 0 && reserve1 > 0,
            "PricesLib: INSUFFICIENT_LIQUIDITY"
        );
        uint256 wethPriceInToken = uint256(reserve0).div(uint256(reserve1));
        tokenAmount = weiToConvert.mul(wethPriceInToken);
    }
}
