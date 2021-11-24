const { redis, web3 } = require("../connections");
const { User, Bank } = require("../models");
const { Transaction } = require("ethereumjs-tx");
const config = require("../config");
const deployed = require("./deployed");

function listener(job, done) {
  (async function () {
    try {
      const [user] = await User.find({ where: { id: job.data.user.id } });
      const [bank] = await Bank.find({ where: { id: config.BANK_ID } });

      const bankContract = web3.getBankContract(bank.address);

      const createReceiver = bankContract.methods.createReceiver(user.id);

      const txCount = await web3.client.eth.getTransactionCount(
        config.TRANSACTION_SIGNER_PUBLIC_KEY
      );

      const tx = new Transaction({
        nonce: web3.utils.toHex(txCount),
        gasLimit: web3.utils.toHex(5000000), // TODO wtf is this dan
        gasPrice: web3.utils.toHex(100000000000), // TODO wtf is this dan
        data: createReceiver.encodeABI(),
        from: config.TRANSACTION_SIGNER_PUBLIC_KEY,
        to: bank.address,
        value: "0x00", // TODO wtf is this dan
      });
      tx.sign(Buffer.from(config.TRANSACTION_SIGNER_PRIVATE_KEY, "hex"));

      const receipt = await web3.client.eth.sendSignedTransaction(
        "0x" + tx.serialize().toString("hex")
      );

      await deployed.addToQueue({
        transactionHash: receipt.transactionHash,
        user,
      });
      done();
    } catch (error) {
      console.error(error);
      done(error);
    }
  })();
}

function listen() {
  redis.queues.Deploy.process(listener);
}

async function addToQueue({ user }) {
  await redis.queues.Deploy.add(
    {
      user: { id: user.id },
    },
    { attempts: 100, backoff: 5000 }
  );
}

module.exports = { listen, addToQueue };
