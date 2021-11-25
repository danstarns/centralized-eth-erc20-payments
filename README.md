# centralized-eth-erc20-payments

Centralized Ethereum ERC20 Payment Processor

## What is it ?

Ever wondered how crypto exchanges manage deposits and withdrawals ? This project aims to demonstrate how to do user management, handle deposits and withdrawals plus keep track of each users balance in a centralized store.

~~This project is part of a case study, you can read the case study [here](https://medium.com/@danstarns/handling-ethereum-erc20-deposits-and-withdrawals-like-an-exchange-a-case-study-256fe6602a7a).~~ - Work in progress 🏗

## Why centralized ?

This is a great question! The movement of blockchain is all about decentralization, transparency and accountability and thus putting the term 'centralized' in here seems to negate the incentives. However, there are many use cases to centrally keep track of a 'Users Balance' and the first, for example, is an exchange - Users deposit funds and then use the funds to buy and sell, this is of course talking about a centralized exchange. Then you have centralized investment accounts such as; [Nexo](https://nexo.io) & [Celsius](https://celsius.network/). Another example is if you were to make a game and accept a deposit of crypto to 'Top Up' a users virtual balance. Finally, you might be [Tesla](https://www.tesla.com/en_gb) and wanting to accept crypto payments.

Other examples are:

1. Paying mortgage
2. Paying Taxes
3. Topping up gambling account
4. Paying for goods in a store

With the current blockchain ecosystem still lacking; adoption, age and technological adaptors, the listed reasons in the paragraph above are difficult to implement with pure decentralization. Using pure blockchain tech would mean your users will have to change their current way of interacting with your app. Right now if I wanted to deposit [USDT](https://tether.to/) into an exchange or an investment account I would be presented with an address, where I could simply send the funds however I see fit. Here are two examples of being presented with an address:

### Coinbase Pro Deposit

https://pro.coinbase.com/

![Coinbase Deposit](./docs/images/coinbase-deposit.png)

### Nexo Deposit

https://nexo.io

![Nexo Deposit](./docs/images/nexo-deposit.png)

Presenting your users with an address, like demonstrated, allows for the greatest flexibility when it comes to paying for whatever service you have to offer. Most of the common Joe, who hold crypto, will hold crypto in an exchange, and so presenting them with an address means they can simply copy the address, use their exchanges mechanism to send the funds. This process is usually a straightforward one and feels, to the user, like a normal bank payment. Without presenting your users with their own unique address to deposit, like the two above, you would only have one other option - Expect your users to interact with a decentralized application, this would require your users to use an unfamiliar tool such as metamask:

https://metamask.io/

> Note that using Metamask as an example here is not shedding any bad light on it! Metamask is a great tool and helps users interact with decentralized applications with ease. The point that's being expressed is - Its different from what most users are used to and would require users to transferer funds to their Metamask wallet before interacting with your app thus using extra gas.

![Metamask](./docs/images/metamask.png)

Finally, this way of accepting payments means you can use the code in this project to easily implement a crypto currency payment gateway into your project without moving lots of your infrastructure onto the blockchain.

## How does it work ?

> ⚠ The Payment Processor doesn't actually store 'Users Balance' however its an aggregation of the deposits, withdrawals and associated fees.

### Account Creation

When a user creates an account, a message is placed onto the [Receiver Deploy Queue](./src/receiver/deploy.js), the queue listener will deploy a [Receiver Contract](./src/contracts/contracts/Receiver.sol) associated with that user. On deployment transaction receipt another message is placed on the [Receiver Deployed Queue](./src/receiver/deployed.js) where the listener will watch and wait for the confirmation of the contract deployment. On confirmation, the deployed listener will update Neo4j associating the receiver address to the new user. Each Receiver is designed to accept [ERC20 USDT](https://tether.to/) token and is a child of/created by the [Bank Contract](./src/contracts/contracts/Bank.sol).

> This approach means that you are spending gas each time a user signs up, this is because of the `Receiver` contract deployment. You will have to at some point spend this gas to receive funds the way described in this project, however, you may want to delay the deployment of the contract until your user has passed some form of verification such as [KYC](https://www.fool.com/the-ascent/cryptocurrency/articles/what-is-kyc-and-why-do-crypto-exchanges-require-it/).

![Account Creation](./docs/diagrams/account-creation.drawio.svg)

### Deposits

When the [Receiver Contract](./src/contracts/contracts/Receiver.sol) is deployed the user will be able to query for there deposit address and deposit funds. The [Watcher]() watches the `Transfer` logs for the [ERC20 USDT](https://tether.to/) token, reconciles the sender address to an associated Receiver contract and then is able to relate a deposit to a user, thus updating the users balance.

### Withdrawals

When a user requests a withdrawal a 'Withdrawal Request' is placed on the [Withdraw Queue](./src/withdraw/withdrawn.js) queue. On withdraw transaction receipt another message is placed on the [Withdrawn Queue](./src/withdrawer/withdrawn.js) where the listener will watch and wait for the confirmation of the withdraw transaction. On transaction success, the listener shall append a deposit against the User.

## Modules

The server consists of following modules:

1. [API](./src/api) - User facing REST, handles account creation and withdrawal requests.
2. [Receiver](./src/receiver) - Listens for account creation and deploys the [Receiver Contract](./src/contracts/contracts/Receiver.sol) and associates the deployed contract with the new User.
3. [Withdrawer]() - Listens for withdrawal requests and facilitates the transaction.
4. [Watcher]() - Watches the [USDT Transfer](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol#L75) logs and records a deposit if the 'to' address is one belonging to a User.

## Dependencies

This project uses the following:

1. [Neo4j](https://neo4j.com/) - For account storage, keeping track of deposits and withdrawals and use to query and aggregate the users total balance.
2. [Redis](https://redis.com/) - Used as a queue for handling the Deployment of each users [Forwarder]() contract and each withdrawal request.
3. [Ganache](https://www.trufflesuite.com/ganache) - Used as a development blockchain for testing

## Data Model

High level overview of whats stored in [Neo4j](https://neo4j.com/):

![Data Model](./docs/images/data-model.svg)

## Development

```bash
npm run docker-dev
```

## Testing

```bash
npm run docker-test
```

## License

MIT Daniel Starns danielstarns@hotmail.com
