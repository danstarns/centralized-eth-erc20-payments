const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, "../.env.ganache.test") });
const solc = require("solc");
const fs = require("fs");
const Web3 = require("web3");

const endpoint = "http://localhost:8545";
const web3 = new Web3(new Web3.providers.HttpProvider(endpoint));

const BankContent = fs.readFileSync(
  path.resolve(__dirname, "contracts", "Bank.sol"),
  "utf-8"
);

const ReceiverContent = fs.readFileSync(
  path.resolve(__dirname, "contracts", "Receiver.sol"),
  "utf-8"
);

const ERC20Content = fs.readFileSync(
  path.resolve(__dirname, "contracts", "TestERC20.sol"),
  "utf-8"
);

function findImports(_path) {
  if (_path[0] === ".") {
    return {
      contents: fs.readFileSync(path.join(directoryPath, _path)).toString(),
    };
  }

  return {
    contents: fs
      .readFileSync(path.join(__dirname, "node_modules", _path))
      .toString(),
  };
}

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
    { import: findImports }
  )
);

async function main() {
  const bankInstance = new web3.eth.Contract(
    compiled.contracts["Bank.sol"].Bank.abi
  );
  const testERC20instance = new web3.eth.Contract(
    compiled.contracts["TestERC20.sol"].TestERC20.abi
  );

  const bankTx = bankInstance.deploy({
    data: compiled.contracts["Bank.sol"].Bank.evm.bytecode.object,
  });

  const testERC20Tx = testERC20instance.deploy({
    data: compiled.contracts["TestERC20.sol"].TestERC20.evm.bytecode.object,
  });

  const nonce = await web3.eth.getTransactionCount(
    process.env.ACCOUNT_ONE_PUBLIC_KEY
  );

  const bankTxSinged = await web3.eth.accounts.signTransaction(
    {
      data: bankTx.encodeABI(),
      gas: await bankTx.estimateGas(),
      nonce,
    },
    process.env.ACCOUNT_ONE_PRIVATE_KEY
  );

  const testERC20Signed = await web3.eth.accounts.signTransaction(
    {
      data: testERC20Tx.encodeABI(),
      gas: await testERC20Tx.estimateGas(),
      nonce: nonce + 1,
    },
    process.env.ACCOUNT_ONE_PRIVATE_KEY
  );

  const bankReceipt = await web3.eth.sendSignedTransaction(
    bankTxSinged.rawTransaction
  );

  const testERC20Receipt = await web3.eth.sendSignedTransaction(
    testERC20Signed.rawTransaction
  );

  console.log(`Bank.sol deployed at address: ${bankReceipt.contractAddress}`);

  console.log(
    `TestERC20.sol deployed at address: ${testERC20Receipt.contractAddress}`
  );
}

main();
