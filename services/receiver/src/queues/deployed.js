const { queues } = require("../redis");
const { User } = require("../models");
const web3 = require("../web3");

function listener(job, done) {
  (async function () {
    try {
      const [user] = await User.find({ where: { id: job.data.user.id } });

      const transaction = await web3.client.eth.getTransactionReceipt(
        job.data.transactionHash
      );

      if (!transaction || transaction.status === false) {
        // Queue will retry this job
        throw new Error("Transaction not completed");
      }

      const blockNumber = transaction.blockNumber;

      const events = await web3.contracts.bank.getPastEvents(
        "ReceiverCreated",
        { fromBlock: blockNumber, toBlock: blockNumber }
      );

      const validEvent = events.find(
        (e) => e.returnValues.userId === web3.utils.soliditySha3(user.id)
      );

      if (!validEvent) {
        // Queue will retry this job
        throw new Error("Transaction not completed");
      }

      const receiverAddress = validEvent.returnValues.receiverAddress;

      await User.update({
        where: { id: user.id },
        create: {
          receiver: {
            node: {
              address: receiverAddress,
              transaction: {
                create: {
                  node: {
                    transactionHash: transaction.transactionHash,
                    transactionIndex: transaction.transactionIndex,
                    blockHash: transaction.blockHash,
                    blockNumber: transaction.blockNumber,
                    gasUsed: transaction.gasUsed,
                    cumulativeGasUsed: transaction.cumulativeGasUsed,
                  },
                },
              },
            },
          },
        },
      });

      done();
    } catch (error) {
      console.error(error);
      done(error);
    }
  })();
}

function listen() {
  queues.Deployed.process(listener);
}

module.exports = { listen };
