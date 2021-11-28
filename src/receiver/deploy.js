const { redis, web3 } = require("../connections");
const { User, Bank } = require("../models");
const config = require("../config");
const deployed = require("./deployed");

function listener(job, done) {
  (async function () {
    try {
      const [user] = await User.find({ where: { id: job.data.user.id } });
      const [bank] = await Bank.find({ where: { id: config.BANK_ID } });

      const bankContract = web3.getBankContract(bank.address);
      const createReceiver = bankContract.methods.createReceiver(user.id);

      const nonce = await web3.client.eth.getTransactionCount(
        config.TRANSACTION_SIGNER_PUBLIC_KEY
      );

      const createReceiverSigned =
        await web3.client.eth.accounts.signTransaction(
          {
            to: bank.address,
            data: createReceiver.encodeABI(),
            gas: config.RECEIVER_DEPLOY_GAS,
            nonce,
          },
          config.TRANSACTION_SIGNER_PRIVATE_KEY
        );

      const receipt = await web3.client.eth.sendSignedTransaction(
        createReceiverSigned.rawTransaction
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
