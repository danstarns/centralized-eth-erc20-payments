const { OGM } = require("@neo4j/graphql-ogm");
const { neo4j } = require("../connections");

const typeDefs = `
    type User {
      id: ID! @id(autogenerate: true)
      email: String!
      password: String!
      createdAt: DateTime @timestamp
      receiver: Receiver @relationship(type: "HAS_RECEIVER", direction: OUT)
      deposits: [Deposit] @relationship(type: "HAS_DEPOSIT", direction: OUT)
      withdrawals: [Withdrawal] @relationship(type: "HAS_WITHDRAWAL", direction: OUT)
      balance: Int @cypher(statement: """
        CALL {
          WITH this
          MATCH (this)-[:HAS_DEPOSIT]->(d:Deposit)
          WITH sum(d.amount) AS totalDeposit
          RETURN totalDeposit AS totalDeposit
        }
        CALL {
          WITH this
          MATCH (this)-[:HAS_WITHDRAWAL]->(w:Withdrawal)
          WHERE w.completed = true
          WITH sum(w.amount) AS totalWithdrawal
          RETURN totalWithdrawal AS totalWithdrawal
        }

        RETURN totalDeposit - totalWithdrawal
      """)
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
      uptoDateWithBlockNumber: Int
      transaction: Transaction! @relationship(type: "HAS_TRANSACTION", direction: OUT)
      receivers: [Receiver] @relationship(type: "HAS_RECEIVER", direction: OUT)
    }

    type Deposit {
      id: ID! @id(autogenerate: true)
      amount: Int!
      transaction: Transaction! @relationship(type: "HAS_TRANSACTION", direction: OUT)
      receiver: Receiver! @relationship(type: "HAS_DEPOSIT", direction: IN)
    }

    type Withdrawal {
      id: ID! @id(autogenerate: true)
      amount: Int!
      to: String!
      completed: Boolean
      transaction: Transaction @relationship(type: "HAS_TRANSACTION", direction: OUT)
      user: User! @relationship(type: "HAS_WITHDRAWAL", direction: IN)
      bank: Bank! @relationship(type: "HAS_WITHDRAWAL", direction: IN)
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
const Withdrawal = ogm.model("Withdrawal");

module.exports = {
  User,
  Receiver,
  Transaction,
  Bank,
  Withdrawal,
};
