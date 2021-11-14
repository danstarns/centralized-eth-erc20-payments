const { queues } = require("../redis");
const { User } = require("../models");
const web3 = require("../web3");
const { Transaction } = require("ethereumjs-tx");
const {
  TRANSACTION_SIGNER_PRIVATE_KEY,
  TRANSACTION_SIGNER_PUBLIC_KEY,
  BANK_CONTRACT_ADDRESS,
} = require("../config");

function listener(job, done) {
  (async function () {
    try {
      const [user] = await User.find({ where: { id: job.data.user.id } });

      const createReceiver = web3.contracts.bank.methods.createReceiver(
        user.id
      );

      const txCount = await web3.client.eth.getTransactionCount(
        TRANSACTION_SIGNER_PUBLIC_KEY
      );

      const tx = new Transaction({
        nonce: web3.utils.toHex(txCount),
        gasLimit: web3.utils.toHex(5000000), // TODO wtf is this dan
        gasPrice: web3.utils.toHex(100000000000), // TODO wtf is this dan
        data: createReceiver.encodeABI(),
        from: TRANSACTION_SIGNER_PUBLIC_KEY,
        to: BANK_CONTRACT_ADDRESS,
        value: "0x00", // TODO wtf is this dan
      });
      tx.sign(Buffer.from(TRANSACTION_SIGNER_PRIVATE_KEY, "hex"));

      const receipt = await web3.client.eth.sendSignedTransaction(
        "0x" + tx.serialize().toString("hex")
      );

      await queues.Deployed.add(
        {
          transactionHash: receipt.transactionHash,
          user: { id: user.id },
        },
        { attempts: 100, backoff: 60000 }
      );

      done();
    } catch (error) {
      console.error(error);
      done(error);
    }
  })();
}

function listen() {
  queues.Deploy.process(listener);
}

module.exports = { listen };
