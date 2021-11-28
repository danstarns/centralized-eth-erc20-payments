const { redis, web3 } = require("../connections");
const { User, Bank } = require("../models");
const config = require("../config");

function listener(job, done) {
  (async function () {
    try {
      const transaction = await web3.client.eth.getTransactionReceipt(
        job.data.transactionHash
      );

      if (!transaction || transaction.status === false) {
        done();

        await addToQueue(job.data);

        return;
      }

      const [user] = await User.find({ where: { id: job.data.user.id } });
      const [bank] = await Bank.find({ where: { id: config.BANK_ID } });
      const bankContract = web3.getBankContract(bank.address);

      const events = await bankContract.getPastEvents("ReceiverCreated", {
        fromBlock: transaction.blockNumber,
        toBlock: transaction.blockNumber,
      });

      const validEvent = events.find(
        (e) => e.returnValues.userId === web3.utils.soliditySha3(user.id)
      );

      if (!validEvent) {
        done();

        await addToQueue(job.data);

        return;
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
                    gasPrice: job.data.gasPrice,
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

async function addToQueue({ transactionHash, user, gasPrice }) {
  await redis.queues.Deployed.add(
    {
      transactionHash,
      user: { id: user.id },
      gasPrice,
    },
    { attempts: 10, backoff: 60000 }
  );
}

module.exports = { listen, addToQueue };
