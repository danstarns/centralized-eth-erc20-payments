const envGQL = require("env.gql");

const typeDefs = `
    input Config {
        SERVER_PORT: Int!
        NEO4J_URL: String!
        NEO4J_USER: String!
        NEO4J_PASSWORD: String!
        REDIS_HOST: String!
        REDIS_PORT: Int!
        REDIS_RECEIVER_DEPLOY_QUEUE: String!
        REDIS_RECEIVER_DEPLOYED_QUEUE: String!
        REDIS_RECEIVER_DB: Int!
        REDIS_WITHDRAWER_WITHDRAW_QUEUE: String!
        REDIS_WITHDRAWER_WITHDRAWN_QUEUE: String!
        REDIS_WITHDRAWER_DB: Int!
        WEB3_HTTP_PROVIDER: String!
        TRANSACTION_SIGNER_PRIVATE_KEY: String!
        TRANSACTION_SIGNER_PUBLIC_KEY: String!
        BANK_ID: String!
        WATCHER_INTERVAL_MILLISECONDS: Int!
        USDT_ADDRESS: String!
        JWT_SECRET: String!
        ERC20_TRANSFER_GAS: Int!
        RECEIVER_DEPLOY_GAS: Int!
        BANK_DEPLOY_GAS: Int!
        TEST_ERC20_DEPLOY_GAS: Int!
        TRANSACTION_WAIT_TIME: Int!
    }
`;

const {
  SERVER_PORT,
  NEO4J_URL,
  NEO4J_USER,
  NEO4J_PASSWORD,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_RECEIVER_DEPLOY_QUEUE,
  REDIS_RECEIVER_DEPLOYED_QUEUE,
  REDIS_RECEIVER_DB,
  REDIS_WITHDRAWER_WITHDRAW_QUEUE,
  REDIS_WITHDRAWER_WITHDRAWN_QUEUE,
  REDIS_WITHDRAWER_DB,
  WEB3_HTTP_PROVIDER,
  TRANSACTION_SIGNER_PRIVATE_KEY,
  TRANSACTION_SIGNER_PUBLIC_KEY,
  BANK_ID,
  WATCHER_INTERVAL_MILLISECONDS,
  USDT_ADDRESS,
  JWT_SECRET,
  ERC20_TRANSFER_GAS,
  RECEIVER_DEPLOY_GAS,
  BANK_DEPLOY_GAS,
  TEST_ERC20_DEPLOY_GAS,
  TRANSACTION_WAIT_TIME,
} = envGQL({ typeDefs });

module.exports = {
  SERVER_PORT,
  NEO4J_URL,
  NEO4J_USER,
  NEO4J_PASSWORD,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_RECEIVER_DEPLOY_QUEUE,
  REDIS_RECEIVER_DEPLOYED_QUEUE,
  REDIS_RECEIVER_DB,
  REDIS_WITHDRAWER_WITHDRAW_QUEUE,
  REDIS_WITHDRAWER_WITHDRAWN_QUEUE,
  REDIS_WITHDRAWER_DB,
  WEB3_HTTP_PROVIDER,
  TRANSACTION_SIGNER_PRIVATE_KEY,
  TRANSACTION_SIGNER_PUBLIC_KEY,
  BANK_ID,
  WATCHER_INTERVAL_MILLISECONDS,
  USDT_ADDRESS,
  JWT_SECRET,
  ERC20_TRANSFER_GAS,
  RECEIVER_DEPLOY_GAS,
  BANK_DEPLOY_GAS,
  TEST_ERC20_DEPLOY_GAS,
  TRANSACTION_WAIT_TIME,
};
