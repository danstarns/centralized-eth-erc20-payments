const deployBank = require("../../src/utils/deploy-bank");
const deployTestErc20 = require("../../src/utils/deploy-test-erc20");
const { connect, web3 } = require("../../src/connections");
const { app } = require("../../src/api");
const request = require("supertest");
const util = require("util");
const sleep = util.promisify(setTimeout);
const config = require("../../src/config");
const { TRANSACTION_SIGNER_PRIVATE_KEY, TRANSACTION_SIGNER_PUBLIC_KEY } =
  config;
const faker = require("faker");
const { expect } = require("chai");
const { Bank, User } = require("../../src/models");

const TRANSACTION_WAIT_TIME = 10000;

describe("deposit and withdraw end to end test", () => {
  test("should sign up user, create a receiver and deposit into and then withdraw out of it", async () => {
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
    require("../../src/withdrawer").listen();

    const email = faker.internet.email();
    const password = faker.internet.password();

    const signupResponse = await request(app).post("/signup").send({
      email,
      password,
    });
    expect(signupResponse.statusCode).to.equal(200);

    // Wait for receiver to be deployed
    await sleep(TRANSACTION_WAIT_TIME);

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

    const transferToReceiver = usdtTransaction.contract.methods.transfer(
      receiverAddress,
      100
    );

    const transferToReceiverSigned =
      await web3.client.eth.accounts.signTransaction(
        {
          to: usdtTransaction.receipt.contractAddress,
          data: transferToReceiver.encodeABI(),
          gas: 1400000,
        },
        config.TRANSACTION_SIGNER_PRIVATE_KEY
      );

    const transferToReceiverReceipt =
      await web3.client.eth.sendSignedTransaction(
        transferToReceiverSigned.rawTransaction
      );

    const transferToBank = usdtTransaction.contract.methods.transfer(
      banks[0].address,
      100
    );

    const transferToBankSigned = await web3.client.eth.accounts.signTransaction(
      {
        to: usdtTransaction.receipt.contractAddress,
        data: transferToBank.encodeABI(),
        gas: 1400000,
      },
      config.TRANSACTION_SIGNER_PRIVATE_KEY
    );

    await web3.client.eth.sendSignedTransaction(
      transferToBankSigned.rawTransaction
    );

    await sleep(TRANSACTION_WAIT_TIME);

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
      transferToReceiverReceipt.transactionHash
    );
    expect(user.deposits[0].receiver.address).to.equal(receiverAddress);
    expect(user.deposits[0].receiver.bank.id).to.equal(banks[0].id);

    const withdrawalTo = faker.finance.ethereumAddress();

    // Withdrawal
    const withdrawalResponse = await request(app)
      .post("/withdraw")
      .send({
        email,
        password,
      })
      .set({ authorization: `Bearer ${signupResponse.body.jwt}` })
      .send({
        amount: user.deposits[0].amount,
        to: withdrawalTo,
      });
    expect(withdrawalResponse.statusCode).to.equal(200);

    // Wait for transaction to happen
    await sleep(TRANSACTION_WAIT_TIME * 2);

    [user] = await User.find({
      where: { email },
      selectionSet: `
        {
          balance
          withdrawals {
            to
            amount
            bank {
              id
            }
          }
        }
      `,
    });

    expect(user.balance).to.equal(0);
    expect(user.withdrawals.length).to.equal(1);
    expect(user.withdrawals[0].amount).to.equal(100);
    expect(user.withdrawals[0].bank.id).to.equal(banks[0].id);

    expect(
      Number(
        await usdtTransaction.contract.methods.balanceOf(withdrawalTo).call()
      )
    ).to.equal(user.withdrawals[0].amount);
  });
});
