require("dotenv").config();
const neo4j = require("../connections/neo4j");
const web3 = require("../connections/web3");
const { Bank } = require("../models");
const {
  TRANSACTION_SIGNER_PRIVATE_KEY,
  TRANSACTION_SIGNER_PUBLIC_KEY,
} = require("../config");
const path = require("path");
const solc = require("solc");
const fs = require("fs");
const { Transaction } = require("ethereumjs-tx");

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
      .readFileSync(path.join(__dirname, "../", "../", "node_modules", _path))
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
  await neo4j.connect();
  await web3.connect();

  const bankInstance = new web3.client.eth.Contract(
    compiled.contracts["Bank.sol"].Bank.abi
  );
  const testERC20instance = new web3.client.eth.Contract(
    compiled.contracts["TestERC20.sol"].TestERC20.abi
  );

  const bankTx = bankInstance.deploy({
    data: compiled.contracts["Bank.sol"].Bank.evm.bytecode.object,
  });

  const testERC20Tx = testERC20instance.deploy({
    data: compiled.contracts["TestERC20.sol"].TestERC20.evm.bytecode.object,
  });

  const nonce = await web3.client.eth.getTransactionCount(
    TRANSACTION_SIGNER_PUBLIC_KEY
  );

  const bankTxSinged = await web3.client.eth.accounts.signTransaction(
    {
      data: bankTx.encodeABI(),
      gas: await bankTx.estimateGas(),
      nonce,
    },
    TRANSACTION_SIGNER_PRIVATE_KEY
  );

  const testERC20Signed = await web3.client.eth.accounts.signTransaction(
    {
      data: testERC20Tx.encodeABI(),
      gas: await testERC20Tx.estimateGas(),
      nonce: nonce + 1,
    },
    TRANSACTION_SIGNER_PRIVATE_KEY
  );

  const bankReceipt = await web3.client.eth.sendSignedTransaction(
    bankTxSinged.rawTransaction
  );

  const { banks } = await Bank.create({
    input: [
      {
        address: bankReceipt.contractAddress,
        transaction: {
          create: {
            node: {
              transactionHash: bankReceipt.transactionHash,
              transactionIndex: bankReceipt.transactionIndex,
              blockHash: bankReceipt.blockHash,
              blockNumber: bankReceipt.blockNumber,
              gasUsed: bankReceipt.gasUsed,
              cumulativeGasUsed: bankReceipt.cumulativeGasUsed,
            },
          },
        },
      },
    ],
  });

  const testERC20Receipt = await web3.client.eth.sendSignedTransaction(
    testERC20Signed.rawTransaction
  );

  console.log(
    `Bank.sol deployed at address: ${bankReceipt.contractAddress}, stored in neo4j as ${banks[0].id}`
  );

  console.log(
    `TestERC20.sol deployed at address: ${testERC20Receipt.contractAddress}`
  );

  const usdtContract = new web3.client.eth.Contract(
    compiled.contracts["TestERC20.sol"].TestERC20.abi,
    testERC20Receipt.contractAddress
  );

  const addBalanceToAddress = usdtContract.methods.addBalanceToAddress(
    10000,
    TRANSACTION_SIGNER_PUBLIC_KEY
  );

  const txCount = await web3.client.eth.getTransactionCount(
    TRANSACTION_SIGNER_PUBLIC_KEY
  );

  const tx = new Transaction({
    nonce: web3.utils.toHex(txCount),
    gasLimit: web3.utils.toHex(5000000), // TODO wtf is this dan
    gasPrice: web3.utils.toHex(100000000000), // TODO wtf is this dan
    data: addBalanceToAddress.encodeABI(),
    from: TRANSACTION_SIGNER_PUBLIC_KEY,
    to: testERC20Receipt.contractAddress,
    value: "0x00", // TODO wtf is this dan
  });
  tx.sign(Buffer.from(TRANSACTION_SIGNER_PRIVATE_KEY, "hex"));

  await web3.client.eth.sendSignedTransaction(
    "0x" + tx.serialize().toString("hex")
  );

  process.exit(0);
}

main();
