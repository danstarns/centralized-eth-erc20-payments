# centralized-eth-erc20-payments

Centralized Ethereum ERC20 Payment Processor

## What is it ?

Ever wondered how crypto exchanges manage deposits and withdrawals ? This project aims to demonstrate how to do user management, handle deposits and withdrawals plus keep track of each users balance in a centralized store.

## How does it work ?

> ⚠ The Payment Processor doesn't actually store 'Users Balance' however its an aggregation of the deposits, withdrawals and associated fees.

### Account Creation

When a user creates an account, a message is placed onto the [Receiver queue](), the queue listener will create a [Receiver Contract](./contracts/contracts/Receiver.sol) associated with that User. Each Receiver is designed to accept [ERC20 USDT](https://tether.to/) token and is a child of/created by the [Bank Contract](./contracts/contracts/Bank.sol).

### Deposits

When the [Receiver Contract](./contracts/contracts/Receiver.sol) is deployed the user will be able to query for there deposit address and deposit funds. The [Watcher]() watches the logs for the [ERC20 USDT](https://tether.to/) token, reconciles the sender address to an associated Receiver contract and then is able to relate a deposit to a user, thus updating the users balance.

### Withdrawals

When a user requests a withdrawal a 'Withdrawal Request' is placed on the [Withdrawer]() queue. The Withdrawer shall and shall facilitate the transaction plus append a deposit against the User.

## Services

The project consists of following Node.js services deployed independently:

1. [API]() - User facing REST, handles account creation and withdrawal requests.
2. [Receiver]() - Listens for account creation and deploys the [Receiver Contract](./contracts/contracts/Receiver.sol) and associates the deployed contract with the new User.
3. [Withdrawer]() - Listens for withdrawal requests and facilitates the transaction.
4. [Watcher]() - Watches the [USDT Transfer](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol#L75) logs and records a deposit if the 'to' address is one belonging to a User.

## Dependencies

This project uses the following:

1. [Neo4j]() - For account storage, keeping track of deposits and withdrawals and use to query and aggregate the users total balance.
2. [Redis]() - Used as a queue for handling the Deployment of each users [Forwarder]() contract and each withdrawal request.
3. [Ganache]() - Used as a development blockchain for testing

## Data Model

High level overview of whats stored in [Neo4j]():

![Data Model](./docs/images/data-model.png)

## Development

For starting services manually check each services README.md. Otherwise use Docker 🐳:

```bash
npm run docker-dev
```

## Testing

```bash
npm run docker-test
```

## License

MIT Daniel Starns danielstarns@hotmail.com
