const debug = require("../utils/debug")("withdrawer/withdrawn");
const { redis, web3 } = require("../connections");
const { Withdrawal } = require("../models");

function listener(job, done) {
  (async () => {
    try {
      const [withdrawal] = await Withdrawal.find({
        where: { id: job.data.withdrawal.id },
        selectionSet: `
          {
            id
            completed
          }
        `,
      });

      if (!withdrawal || withdrawal?.completed === true) {
        done();

        return;
      }

      const transaction = await web3.client.eth.getTransactionReceipt(
        job.data.transactionHash
      );

      if (!transaction || transaction?.status === false) {
        done();

        await addToQueue(job.data);

        return;
      }

      await Withdrawal.update({
        where: { id: withdrawal.id },
        update: {
          completed: true,
        },
        create: {
          transaction: {
            node: {
              transactionHash: transaction.transactionHash,
              transactionIndex: transaction.transactionIndex,
              blockHash: transaction.blockHash,
              blockNumber: transaction.blockNumber,
              gasUsed: transaction.gasUsed,
              cumulativeGasUsed: transaction.cumulativeGasUsed,
              gasPrice: job.data.gasPrice,
            },
          },
        },
      });

      done();
    } catch (error) {
      debug("Error");
      console.error(error);
      done(error);
    }
  })();
}

function listen() {
  redis.queues.Withdrawn.process(listener);
}

async function addToQueue({ withdrawal, transactionHash, gasPrice }) {
  await redis.queues.Withdrawn.add(
    {
      withdrawal: { id: withdrawal.id },
      transactionHash,
      gasPrice,
    },
    { attempts: 10, backoff: 60000 }
  );
}

module.exports = { listen, addToQueue };
