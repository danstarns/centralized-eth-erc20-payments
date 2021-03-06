const debug = require("../utils/debug")("web3");
const config = require("../config");
const Web3 = require("web3");
const path = require("path");

const client = new Web3(
  new Web3.providers.HttpProvider(config.WEB3_HTTP_PROVIDER)
);

const BankABI = require(path.resolve(
  __dirname,
  "../",
  "contracts",
  "build",
  "contracts",
  "Bank.json"
));

const erc20ABI = require("@openzeppelin/contracts/build/contracts/ERC20.json");

function getBankContract(address) {
  return new client.eth.Contract(BankABI.abi, address);
}

function getUSDTContract() {
  return new client.eth.Contract(erc20ABI.abi, config.USDT_ADDRESS);
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
  getUSDTContract,
};
