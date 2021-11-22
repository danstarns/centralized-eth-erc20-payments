# Development

## Local Run

1. Copy `./.env.example` => `./.env`

First you will need to run a Neo4j, Redis and Ganache instances, once you have then running you can update the following values inside the `./.env` file you just copied.

```
NEO4J_URL=neo4j://localhost:7687
NEO4J_USER=admin
NEO4J_PASSWORD=password
REDIS_HOST=localhost
REDIS_PORT=6379
WEB3_HTTP_PROVIDER=http://localhost:8545 ## Ganache
```

Now you will need to run the npm script `npm run dev-deploy`, this will deploy a `Bank` contract for you and a fake `USDT` contract, once you run the script you will be given the output in logs:

```
Bank.sol deployed at address: 0xa592c29029386627142b1a3a6eC3EF188CE34707, stored in neo4j as c286a153-2253-462a-bbf4-89d17f0548b1
TestERC20.sol deployed at address: 0x53fa244148480634b8FeBaA4871e287C6CCe6A27
```

You will need to take the bank id 'stored in neo4j as ...' and the TestERC20 'deployed at address' and append them into your `./.env` file:

```
BANK_ID=c286a153-2253-462a-bbf4-89d17f0548b1
USDT_ADDRESS=0x53fa244148480634b8FeBaA4871e287C6CCe6A27
```

Now you can run `npm run start` and the application should start.
