const deployBank = require("../../src/utils/deploy-bank");
const deployTestErc20 = require("../../src/utils/deploy-test-erc20");
const { connect, web3 } = require("../../src/connections");
const { app } = require("../../src/api");
const request = require("supertest");
const util = require("util");
const sleep = util.promisify(setTimeout);
const config = require("../../src/config");
const {
  TRANSACTION_SIGNER_PRIVATE_KEY,
  TRANSACTION_SIGNER_PUBLIC_KEY,
  WATCHER_INTERVAL_MILLISECONDS,
} = config;
const faker = require("faker");
const { expect } = require("chai");
const { Bank, User } = require("../../src/models");
const { Transaction } = require("ethereumjs-tx");

describe("deposit end to end test", () => {
  test("should sign up user, create a receiver and deposit into", async () => {
    let user;

    await connect();

    const bankTransaction = await deployBank({
      signerPrivateKey: TRANSACTION_SIGNER_PRIVATE_KEY,
      signerPublicKey: TRANSACTION_SIGNER_PUBLIC_KEY,
    });

    const { banks } = await Bank.create({
      input: [
        {
          address: bankTransaction.receipt.contractAddress,
          transaction: {
            create: {
              node: {
                transactionHash: bankTransaction.receipt.transactionHash,
                transactionIndex: bankTransaction.receipt.transactionIndex,
                blockHash: bankTransaction.receipt.blockHash,
                blockNumber: bankTransaction.receipt.blockNumber,
                gasUsed: bankTransaction.receipt.gasUsed,
                cumulativeGasUsed: bankTransaction.receipt.cumulativeGasUsed,
              },
            },
          },
        },
      ],
    });

    const usdtTransaction = await deployTestErc20({
      signerPrivateKey: TRANSACTION_SIGNER_PRIVATE_KEY,
      signerPublicKey: TRANSACTION_SIGNER_PUBLIC_KEY,
    });

    config.BANK_ID = banks[0].id;
    config.USDT_ADDRESS = usdtTransaction.receipt.contractAddress;
    require("../../src/receiver").listen();
    require("../../src/watcher").watch();

    const email = faker.internet.email();
    const password = faker.internet.password();

    await request(app).post("/signup").send({
      email,
      password,
    });

    // Wait for receiver to be deployed
    await sleep(5000);

    [user] = await User.find({
      where: { email },
      selectionSet: `
        {
          balance
          receiver {
            address
          }
        }
      `,
    });

    expect(user.balance).to.equal(0);

    const receiverAddress = user.receiver.address;
    expect(receiverAddress).to.not.equal(null);
    expect(receiverAddress).to.not.equal(undefined);

    const transfer = usdtTransaction.contract.methods.transfer(
      receiverAddress,
      100
    );

    const txCount = await web3.client.eth.getTransactionCount(
      TRANSACTION_SIGNER_PUBLIC_KEY
    );

    const transferTx = new Transaction({
      nonce: web3.utils.toHex(txCount),
      gasLimit: web3.utils.toHex(5000000), // TODO wtf is this dan
      gasPrice: web3.utils.toHex(100000000000), // TODO wtf is this dan
      data: transfer.encodeABI(),
      from: TRANSACTION_SIGNER_PUBLIC_KEY,
      to: usdtTransaction.receipt.contractAddress,
      value: "0x00", // TODO wtf is this dan
    });
    transferTx.sign(Buffer.from(TRANSACTION_SIGNER_PRIVATE_KEY, "hex"));

    const depositReceipt = await web3.client.eth.sendSignedTransaction(
      "0x" + transferTx.serialize().toString("hex")
    );

    await sleep(WATCHER_INTERVAL_MILLISECONDS * 3);

    [user] = await User.find({
      where: { email },
      selectionSet: `
        {
          balance
          deposits {
            amount
            transaction {
              transactionHash
            }
            receiver {
              address
              bank {
                id
              }
            }
          }
        }
      `,
    });

    expect(user.balance).to.equal(100);
    expect(user.deposits[0].amount).to.equal(100);
    expect(user.deposits.length).to.equal(1);
    expect(user.deposits[0].transaction.transactionHash).to.equal(
      depositReceipt.transactionHash
    );
    expect(user.deposits[0].receiver.address).to.equal(receiverAddress);
    expect(user.deposits[0].receiver.bank.id).to.equal(banks[0].id);
  });
});
