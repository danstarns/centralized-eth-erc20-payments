const debug = require("../utils").debug("web3");
const { WEB3_HTTP_PROVIDER, BANK_ID } = require("../config");
const Web3 = require("web3");
const path = require("path");

const client = new Web3(new Web3.providers.HttpProvider(WEB3_HTTP_PROVIDER));

const BankABI = require(path.resolve(
  __dirname,
  "../",
  "contracts",
  "build",
  "contracts",
  "Bank.json"
));

async function getBankContract(address) {
  const bank = new client.eth.Contract(BankABI.abi, address);

  return bank;
}

async function connect() {
  debug("Connecting");

  await client.eth.net.isListening();

  debug("Connected");
}

module.exports = {
  client,
  utils: Web3.utils,
  connect,
  getBankContract,
};
