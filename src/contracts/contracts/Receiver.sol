// SPDX-License-Identifier: MIT
pragma solidity >=0.4.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Receiver {
    address public owner;

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function getBalance(address tokenAddress)
        public
        view
        onlyOwner
        returns (uint256)
    {
        IERC20 token = IERC20(tokenAddress);
        return token.balanceOf(address(this));
    }

    function withdrawTokensTo(address tokenAddress, address toAddress)
        public
        onlyOwner
        returns (bool)
    {
        IERC20 token = IERC20(tokenAddress);
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "receiver balance must be greater than 0");

        token.approve(address(this), balance);
        token.transfer(toAddress, balance);

        return true;
    }
}
