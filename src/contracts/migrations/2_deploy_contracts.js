const Bank = artifacts.require("Bank");
const Receiver = artifacts.require("Receiver");
const TestERC20 = artifacts.require("TestERC20");

module.exports = function (deployer, environment) {
  deployer.deploy(Bank);
  deployer.deploy(Receiver);

  if (environment === "test") {
    deployer.deploy(TestERC20);
  }
};
