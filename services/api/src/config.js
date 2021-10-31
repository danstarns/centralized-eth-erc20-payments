const envGQL = require("env.gql");

const typeDefs = `
    input Config {
        SERVER_PORT: Int!
        NEO4J_URL: String!
        NEO4J_USER: String!
        NEO4J_PASSWORD: String!
        REDIS_HOST: String!
        REDIS_PORT: Int!
        FORWARDER_QUEUE: String!
        FORWARDER_DB: Int!
        WITHDRAWER_QUEUE: String!
        WITHDRAWER_DB: Int!
    }
`;

const {
  SERVER_PORT,
  NEO4J_URL,
  NEO4J_USER,
  NEO4J_PASSWORD,
  REDIS_HOST,
  REDIS_PORT,
  FORWARDER_QUEUE,
  FORWARDER_DB,
  WITHDRAWER_QUEUE,
  WITHDRAWER_DB,
} = envGQL({ typeDefs });

module.exports = {
  SERVER_PORT,
  NEO4J_URL,
  NEO4J_USER,
  NEO4J_PASSWORD,
  REDIS_HOST,
  REDIS_PORT,
  FORWARDER_QUEUE,
  FORWARDER_DB,
  WITHDRAWER_QUEUE,
  WITHDRAWER_DB,
};
