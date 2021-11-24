const { web3 } = require("../connections");
const path = require("path");
const solc = require("solc");
const fs = require("fs");
const findSolImports = require("./find-sol-imports");
const contractsFolder = path.join(__dirname, "../", "contracts", "contracts");
const { Transaction } = require("ethereumjs-tx");

const ERC20Content = fs.readFileSync(
  path.resolve(contractsFolder, "TestERC20.sol"),
  "utf-8"
);

async function deployTestErc20({ signerPublicKey, signerPrivateKey }) {
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
      gas: await testERC20Tx.estimateGas(),
      nonce: nonce,
    },
    signerPrivateKey
  );

  const testERC20Receipt = await web3.client.eth.sendSignedTransaction(
    testERC20Signed.rawTransaction
  );

  const usdtContract = new web3.client.eth.Contract(
    compiled.contracts["TestERC20.sol"].TestERC20.abi,
    testERC20Receipt.contractAddress
  );

  const addBalanceToAddress = usdtContract.methods.addBalanceToAddress(
    100000000,
    signerPublicKey
  );

  const tx = new Transaction({
    nonce: web3.utils.toHex(nonce + 1),
    gasLimit: web3.utils.toHex(5000000), // TODO wtf is this dan
    gasPrice: web3.utils.toHex(100000000000), // TODO wtf is this dan
    data: addBalanceToAddress.encodeABI(),
    from: signerPublicKey,
    to: testERC20Receipt.contractAddress,
    value: "0x00", // TODO wtf is this dan
  });
  tx.sign(Buffer.from(signerPrivateKey, "hex"));

  await web3.client.eth.sendSignedTransaction(
    "0x" + tx.serialize().toString("hex")
  );

  return { receipt: testERC20Receipt, contract: usdtContract };
}

module.exports = deployTestErc20;
