const { OGM } = require("@neo4j/graphql-ogm");
const { neo4j } = require("../connections");

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
      bank: Bank! @relationship(type: "HAS_RECEIVER", direction: IN)
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

    type Bank {
      id: ID! @id(autogenerate: true)
      address: String!
      transaction: Transaction! @relationship(type: "HAS_TRANSACTION", direction: OUT)
      receivers: [Receiver] @relationship(type: "HAS_RECEIVER", direction: OUT)
    }
`;

const ogm = new OGM({
  typeDefs,
  driver: neo4j.driver,
});

const User = ogm.model("User");
const Receiver = ogm.model("Receiver");
const Transaction = ogm.model("Transaction");
const Bank = ogm.model("Bank");

module.exports = {
  User,
  Receiver,
  Transaction,
  Bank,
};
