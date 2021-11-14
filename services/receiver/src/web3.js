const { WEB3_HTTP_PROVIDER, BANK_CONTRACT_ADDRESS } = require("./config");
const Web3 = require("web3");
const path = require("path");

const client = new Web3(new Web3.providers.HttpProvider(WEB3_HTTP_PROVIDER));

const BankABI = require(path.resolve(
  __dirname,
  "../../../",
  "contracts",
  "build",
  "contracts",
  "Bank.json"
));

const bank = new client.eth.Contract(BankABI.abi, BANK_CONTRACT_ADDRESS);

module.exports = {
  client,
  utils: Web3.utils,
  contracts: {
    bank,
  },
};
