const debug = require("../utils/debug")("deploy-test-erc20");
const { web3 } = require("../connections");
const path = require("path");
const solc = require("solc");
const fs = require("fs");
const findSolImports = require("./find-sol-imports");
const contractsFolder = path.join(__dirname, "../", "contracts", "contracts");

const ERC20Content = fs.readFileSync(
  path.resolve(contractsFolder, "TestERC20.sol"),
  "utf-8"
);

async function deployTestErc20({ signerPublicKey, signerPrivateKey }) {
  debug("Deploying");

  const compiled = JSON.parse(
    solc.compile(
      JSON.stringify({
        language: "Solidity",
        sources: {
          "TestERC20.sol": {
            content: ERC20Content,
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

  const testERC20instance = new web3.client.eth.Contract(
    compiled.contracts["TestERC20.sol"].TestERC20.abi
  );

  const testERC20Tx = testERC20instance.deploy({
    data: compiled.contracts["TestERC20.sol"].TestERC20.evm.bytecode.object,
  });

  const nonce = await web3.client.eth.getTransactionCount(signerPublicKey);

  const testERC20Signed = await web3.client.eth.accounts.signTransaction(
    {
      data: testERC20Tx.encodeABI(),
      gas: 600000,
      nonce: nonce,
    },
    signerPrivateKey
  );

  const testERC20Receipt = await web3.client.eth.sendSignedTransaction(
    testERC20Signed.rawTransaction
  );

  debug("Deployment receipt ", testERC20Receipt);

  const usdtContract = new web3.client.eth.Contract(
    compiled.contracts["TestERC20.sol"].TestERC20.abi,
    testERC20Receipt.contractAddress
  );

  debug("Completed");

  return { receipt: testERC20Receipt, contract: usdtContract };
}

module.exports = deployTestErc20;
