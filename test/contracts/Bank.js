const Bank = artifacts.require("Bank");
const TestERC20 = artifacts.require("TestERC20");
const Web3 = require("web3");
const faker = require("faker");
const { expect } = require("chai");

contract("Bank", (accounts) => {
  const creator = accounts[0];

  describe("onlyOwner", () => {
    it("createReceiver", async () => {
      const bankInstance = await Bank.new();

      try {
        await bankInstance.createReceiver("userId", {
          from: accounts[1],
        });

        throw new Error("Error");
      } catch (error) {
        expect(error.message).to.equal(
          "Returned error: VM Exception while processing transaction: revert insufficient permissions -- Reason given: insufficient permissions."
        );
      }
    });

    it("getTotalBalance", async () => {
      const bankInstance = await Bank.new();

      try {
        const fakeAddress = bankInstance.address;

        await bankInstance.getTotalBalance(fakeAddress, {
          from: accounts[1],
        });

        throw new Error("Error");
      } catch (error) {
        expect(error.message).to.equal(
          "Returned error: VM Exception while processing transaction: revert insufficient permissions"
        );
      }
    });

    it("withdrawReceiverTo", async () => {
      const bankInstance = await Bank.new();

      try {
        const fakeAddress = bankInstance.address;

        await bankInstance.withdrawReceiverTo(
          fakeAddress,
          fakeAddress,
          fakeAddress,
          {
            from: accounts[1],
          }
        );

        throw new Error("Error");
      } catch (error) {
        expect(error.message).to.equal(
          "Returned error: VM Exception while processing transaction: revert insufficient permissions -- Reason given: insufficient permissions."
        );
      }
    });

    it("getBalanceOfReceiver", async () => {
      const bankInstance = await Bank.new();

      try {
        const fakeAddress = bankInstance.address;

        await bankInstance.getBalanceOfReceiver(fakeAddress, fakeAddress, {
          from: accounts[1],
        });

        throw new Error("Error");
      } catch (error) {
        expect(error.message).to.equal(
          "Returned error: VM Exception while processing transaction: revert insufficient permissions"
        );
      }
    });

    it("withdrawAllReceiversTo", async () => {
      const bankInstance = await Bank.new();

      try {
        const fakeAddress = bankInstance.address;

        await bankInstance.withdrawAllReceiversTo(fakeAddress, fakeAddress, {
          from: accounts[1],
        });

        throw new Error("Error");
      } catch (error) {
        expect(error.message).to.equal(
          "Returned error: VM Exception while processing transaction: revert insufficient permissions -- Reason given: insufficient permissions."
        );
      }
    });
  });

  it("should create a receiver and get the balance of it", async () => {
    const bankInstance = await Bank.new();
    const erc20Instance = await TestERC20.new();
    const userId = faker.datatype.uuid();
    const balance = 100;

    const receipt = await bankInstance.createReceiver(userId, {
      from: creator,
    });

    const log = receipt.logs[0];

    expect(Web3.utils.soliditySha3(userId)).to.equal(log.args.userId);

    const receiverAddress = log.args.receiverAddress;

    await erc20Instance.addBalanceToAddress(balance, receiverAddress);

    const totalBalance = await bankInstance.getTotalBalance(
      erc20Instance.address
    );

    expect(totalBalance.toNumber()).to.equal(balance);
  });

  it("should create a receiver, deposit funds into it and withdraw to another address", async () => {
    const withdrawTo = accounts[1];
    const bankInstance = await Bank.new();
    const erc20Instance = await TestERC20.new();
    const userId = faker.datatype.uuid();
    const balance = 100;

    const receipt = await bankInstance.createReceiver(userId, {
      from: creator,
    });

    const log = receipt.logs[0];

    expect(Web3.utils.soliditySha3(userId)).to.equal(log.args.userId);

    const receiverAddress = log.args.receiverAddress;

    await erc20Instance.addBalanceToAddress(balance, receiverAddress);

    const totalBalance = await bankInstance.getTotalBalance(
      erc20Instance.address
    );

    expect(totalBalance.toNumber()).to.equal(balance);

    await bankInstance.withdrawReceiverTo(
      erc20Instance.address,
      receiverAddress,
      withdrawTo
    );

    const withdrawnBalance = await erc20Instance.balanceOf(withdrawTo);

    expect(withdrawnBalance.toNumber()).to.equal(balance);

    const newTotalBalance = await bankInstance.getTotalBalance(
      erc20Instance.address
    );

    expect(newTotalBalance.toNumber()).to.equal(0);
  });

  it("should create two receivers, deposit funds into both and withdraw both to another address", async () => {
    const withdrawTo = accounts[1];
    const bankInstance = await Bank.new();
    const erc20Instance = await TestERC20.new();

    const users = [
      { id: faker.datatype.uuid(), balance: faker.datatype.number() },
      { id: faker.datatype.uuid(), balance: faker.datatype.number() },
    ];

    const totalUserBalance = users.reduce((r, u) => r + u.balance, 0);

    for await (const user of users) {
      const receipt = await bankInstance.createReceiver(user.id, {
        from: creator,
      });

      const receiverAddress = receipt.logs[0].args.receiverAddress;
      const loggedId = receipt.logs[0].args.userId;

      expect(Web3.utils.soliditySha3(user.id)).to.equal(loggedId);

      await erc20Instance.addBalanceToAddress(user.balance, receiverAddress);
    }

    const totalBalance = await bankInstance.getTotalBalance(
      erc20Instance.address
    );
    expect(totalBalance.toNumber()).to.equal(totalUserBalance);

    await bankInstance.withdrawAllReceiversTo(
      erc20Instance.address,
      withdrawTo
    );

    expect(
      (await bankInstance.getTotalBalance(erc20Instance.address)).toNumber()
    ).to.equal(0);

    expect((await erc20Instance.balanceOf(withdrawTo)).toNumber()).to.equal(
      totalUserBalance
    );
  });
});
