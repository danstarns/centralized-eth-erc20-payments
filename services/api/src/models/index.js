const { OGM } = require("@neo4j/graphql-ogm");
const { driver } = require("../neo4j");

const typeDefs = `
    type User {
      id: ID! @id(autogenerate: true)
      email: String!
      password: String!
      createdAt: DateTime @timestamp
      receiver: Receiver @relationship(type: "HAS_RECEIVER", direction: OUT)
    }

    type Receiver {
      id: ID! @id(autogenerate: true)
      address: String!
      transaction: Transaction! @relationship(type: "HAS_TRANSACTION", direction: OUT)
    }

    type Transaction {
      id: ID! @id(autogenerate: true)
      transactionHash: String!
      transactionIndex: Int!
      blockHash: String!
      blockNumber: Int!
      gasUsed: Int!
      cumulativeGasUsed: Int!
    }
`;
const ogm = new OGM({
  typeDefs,
  driver,
});

const User = ogm.model("User");

module.exports = {
  User,
};
