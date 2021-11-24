require("dotenv").config();
const deployBank = require("../utils/deploy-bank");
const deployTestErc20 = require("../utils/deploy-test-erc20");
const neo4j = require("../connections/neo4j");
const web3 = require("../connections/web3");
const { Bank } = require("../models");
const {
  TRANSACTION_SIGNER_PRIVATE_KEY,
  TRANSACTION_SIGNER_PUBLIC_KEY,
} = require("../config");

async function main() {
  await neo4j.connect();
  await web3.connect();

  const bankTransaction = await deployBank({
    signerPrivateKey: TRANSACTION_SIGNER_PRIVATE_KEY,
    signerPublicKey: TRANSACTION_SIGNER_PUBLIC_KEY,
  });

  const { banks } = await Bank.create({
    input: [
      {
        address: bankTransaction.receipt.contractAddress,
        transaction: {
          create: {
            node: {
              transactionHash: bankTransaction.receipt.transactionHash,
              transactionIndex: bankTransaction.receipt.transactionIndex,
              blockHash: bankTransaction.receipt.blockHash,
              blockNumber: bankTransaction.receipt.blockNumber,
              gasUsed: bankTransaction.receipt.gasUsed,
              cumulativeGasUsed: bankTransaction.receipt.cumulativeGasUsed,
            },
          },
        },
      },
    ],
  });

  const usdtTransaction = await deployTestErc20({
    signerPrivateKey: TRANSACTION_SIGNER_PRIVATE_KEY,
    signerPublicKey: TRANSACTION_SIGNER_PUBLIC_KEY,
  });

  console.log(`Bank Created: \n ${JSON.stringify(banks[0], null, 2)}`);
  console.log(
    `Bank Transaction: \n ${JSON.stringify(bankTransaction.receipt, null, 2)}`
  );
  console.log(
    `USDT Deployed: \n ${JSON.stringify(usdtTransaction.receipt, null, 2)}`
  );

  process.exit(0);
}

main();
