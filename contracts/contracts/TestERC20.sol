// SPDX-License-Identifier: MIT
pragma solidity >=0.4.20;

contract TestERC20 {
    mapping(address => uint256) internal balances;

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    constructor() {}

    function addBalanceToAddress(uint256 balance, address to) public {
        if (balances[to] > 0) {
            balances[to] = balances[to] + balance;
        } else {
            balances[to] = balance;
        }
    }

    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool) {
        require(balances[sender] > 0, "sender not found");

        require(balances[sender] >= amount, "no funds avaliable");

        balances[sender] = balances[sender] - amount;
        addBalanceToAddress(amount, recipient);

        return true;
    }

    function totalSupply() external view returns (uint256) {
        return 1000;
    }

    function transfer(address recipient, uint256 amount)
        external
        returns (bool)
    {
        return true;
    }

    function allowance(address owner, address spender)
        external
        view
        returns (uint256)
    {
        return 10000;
    }
}
