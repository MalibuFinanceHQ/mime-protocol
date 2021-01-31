pragma solidity 0.7.5;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockUniswapV2Router {
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts) {
        require(
            IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn),
            "MockUniswapV2Router.swapExactTokensForTokens: transfer failed"
        );
        return new uint256[](0);
    }

    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts) {
        return new uint256[](0);
    }

    function swapExactTokensForETH(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts) {
        require(
            IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn),
            "MockUniswapV2Router.swapExactTokensForETH: transfer failed"
        );
        return new uint256[](0);
    }
}
