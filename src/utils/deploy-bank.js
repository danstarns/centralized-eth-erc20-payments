const debug = require("../utils/debug")("deploy-bank");
const { web3 } = require("../connections");
const path = require("path");
const solc = require("solc");
const fs = require("fs");
const findSolImports = require("./find-sol-imports");
const contractsFolder = path.join(__dirname, "../", "contracts", "contracts");

const BankContent = fs.readFileSync(
  path.resolve(contractsFolder, "Bank.sol"),
  "utf-8"
);

const ReceiverContent = fs.readFileSync(
  path.resolve(contractsFolder, "Receiver.sol"),
  "utf-8"
);

async function deployBank({ signerPublicKey, signerPrivateKey }) {
  debug("Deploying");

  const compiled = JSON.parse(
    solc.compile(
      JSON.stringify({
        language: "Solidity",
        sources: {
          "Bank.sol": {
            content: BankContent,
          },
          "Receiver.sol": {
            content: ReceiverContent,
          },
        },
        settings: {
          outputSelection: {
            "*": {
              "*": ["*"],
            },
          },
        },
      }),
      { import: findSolImports }
    )
  );

  const bankInstance = new web3.client.eth.Contract(
    compiled.contracts["Bank.sol"].Bank.abi
  );

  const bankTx = bankInstance.deploy({
    data: compiled.contracts["Bank.sol"].Bank.evm.bytecode.object,
  });

  const nonce = await web3.client.eth.getTransactionCount(signerPublicKey);

  const bankTxSinged = await web3.client.eth.accounts.signTransaction(
    {
      data: bankTx.encodeABI(),
      gas: 1400000,
      nonce,
    },
    signerPrivateKey
  );

  const bankReceipt = await web3.client.eth.sendSignedTransaction(
    bankTxSinged.rawTransaction
  );

  debug("Deployment receipt ", bankReceipt);

  debug("Completed");

  return { receipt: bankReceipt, contract: bankInstance };
}

module.exports = deployBank;
