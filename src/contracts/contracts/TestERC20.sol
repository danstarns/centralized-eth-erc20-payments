// SPDX-License-Identifier: MIT
pragma solidity >=0.4.20;

contract TestERC20 {
    mapping(address => uint256) internal balances;

    event Transfer(address indexed from, address indexed to, uint256 value);

    // Not used in testing
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    constructor() public {
        address sender = msg.sender;
        balances[sender] = 10000;
    }

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

    // Not used in testing
    function approve(address spender, uint256 amount) external returns (bool) {
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool) {
        return true;
    }

    // Not used in testing
    function totalSupply() external view returns (uint256) {
        return 1000;
    }

    function transfer(address recipient, uint256 amount)
        external
        returns (bool)
    {
        address from = msg.sender;
        require(balances[from] > 0, "no balance");

        balances[from] = balances[from] - amount;

        addBalanceToAddress(amount, recipient);

        emit Transfer(from, recipient, amount);

        return true;
    }

    // Not used in testing
    function allowance(address owner, address spender)
        external
        view
        returns (uint256)
    {
        return 10000;
    }
}
