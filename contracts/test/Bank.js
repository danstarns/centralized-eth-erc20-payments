const Bank = artifacts.require("Bank");
const Receiver = artifacts.require("Receiver");
const TestERC20 = artifacts.require("TestERC20");
const Web3 = require("web3");

contract("Bank", (accounts) => {
  const creator = accounts[0];

  it("should throw error if non creator tries to create a receiver", async () => {
    const bankInstance = await Bank.deployed();

    try {
      await bankInstance.createReceiver("userId", {
        from: accounts[1],
      });

      throw new Error("Error");
    } catch (error) {
      assert.equal(
        error.message,
        "Returned error: VM Exception while processing transaction: revert insufficient permissions -- Reason given: insufficient permissions."
      );
    }
  });

  it("should create a receiver and get the balance of it", async () => {
    const bankInstance = await Bank.deployed();
    const erc20Instance = await TestERC20.deployed();
    const userId = "userId";
    const balance = 100;

    const receipt = await bankInstance.createReceiver(userId, {
      from: creator,
    });

    const { logs } = receipt;
    const [log] = logs;

    assert.equal(Web3.utils.soliditySha3(userId), log.args.userId);

    const receiverAddress = log.args.receiverAddress;

    await erc20Instance.addBalanceToAddress(balance, receiverAddress);

    const totalBalance = await bankInstance.getTotalBalance(
      erc20Instance.address
    );

    assert.equal(totalBalance.toNumber(), balance);
  });
});
