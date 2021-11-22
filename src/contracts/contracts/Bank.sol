// SPDX-License-Identifier: MIT
pragma solidity >=0.4.20;

import "./Receiver.sol";

contract Bank {
    event ReceiverCreated(address receiverAddress, string indexed userId);

    struct User {
        string id;
    }

    address public owner;
    mapping(address => User) internal receiversMap;
    address[] internal receiversArray;

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "insufficient permissions");
        _;
    }

    function createReceiver(string memory userId) public onlyOwner {
        address receiverAddress = address(new Receiver());
        receiversMap[receiverAddress] = User({id: userId});
        receiversArray.push(receiverAddress);
        emit ReceiverCreated(receiverAddress, userId);
    }

    function withdrawReceiverTo(
        address tokenAddress,
        address receiverAddress,
        address toAddress
    ) public onlyOwner {
        Receiver receiver = Receiver(receiverAddress);
        receiver.withdrawTokensTo(tokenAddress, toAddress);
    }

    function getTotalBalance(address tokenAddress)
        public
        view
        onlyOwner
        returns (uint256)
    {
        uint256 balance = 0;

        for (uint256 i = 0; i < receiversArray.length; i++) {
            Receiver receiver = Receiver(receiversArray[i]);
            balance += receiver.getBalance(tokenAddress);
        }

        return balance;
    }

    function getBalanceOfReceiver(address tokenAddress, address receiverAddress)
        public
        view
        onlyOwner
        returns (uint256)
    {
        Receiver receiver = Receiver(receiverAddress);
        return receiver.getBalance(tokenAddress);
    }

    function withdrawAllReceiversTo(address tokenAddress, address toAddress) 
        public 
        onlyOwner 
        returns (bool) 
    {
        for (uint256 i = 0; i < receiversArray.length; i++) {
            withdrawReceiverTo(tokenAddress, receiversArray[i], toAddress);
        }

        return true;
    }
}
