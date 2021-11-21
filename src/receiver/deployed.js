const { redis, web3 } = require("../connections");
const { User } = require("../models");
const { Bank } = require("../models");
const { BANK_ID } = require("../config");

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

      const [{ address }] = await Bank.find({ where: { id: BANK_ID } });
      const bankContract = await web3.getBankContract(address);

      const events = await bankContract.getPastEvents("ReceiverCreated", {
        fromBlock: blockNumber,
        toBlock: blockNumber,
      });

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
              bank: {
                connect: {
                  where: {
                    node: { address: bankContract.options.address },
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
  redis.queues.Deployed.process(listener);
}

module.exports = { listen };
