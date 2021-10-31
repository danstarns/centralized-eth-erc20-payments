# centralized-eth-payments

Centralized Ethereum Payment Processor

## What is it ?

Ever wondered how crypto exchanges manage deposits and withdrawals ? This project aims to demonstrate how to do user management, handle deposits and withdrawals plus keep track of each users balance in a centralized store.

## Services

The project consists of three Node.js services deployed independently:

1. [API]() - User facing, handles account creation and withdrawal requests.
2. [Deployer]() - Listens for account creation and deploys the [Forwarder]() contract and associates the deployed contract with the new User.
3. [Withdrawer]() - Listens for withdrawal requests and facilitates the transaction.

## Dependencies

This project uses the following:

1. [Neo4j]() - For account storage, keeping track of deposits and withdrawals and use to query and aggregate the users total balance.
2. [Redis]() - Used as a queue for handling the Deployment of each users [Forwarder]() contract and each withdrawal request.
