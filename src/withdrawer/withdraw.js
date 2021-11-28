const debug = require("../utils/debug")("withdrawer/withdraw");
const { redis, web3 } = require("../connections");
const { Withdrawal } = require("../models");
const config = require("../config");
const withdrawn = require("./withdrawn");

function listener(job, done) {
  (async () => {
    try {
      const [withdrawal] = await Withdrawal.find({
        where: { id: job.data.withdrawal.id },
        selectionSet: `
          {
            id
            completed
            amount
            to
            user {
              id
              balance
            }
            bank {
              address
            }
          }
        `,
      });

      if (!withdrawal || withdrawal?.completed === true) {
        done();
        return;
      }

      if (withdrawal.amount > withdrawal.user.balance) {
        await Withdrawal.delete({ where: { id: withdrawal.id } });

        done();

        return;
      }

      const erc20Instance = web3.getUSDTContract();

      const balanceOfBank = await erc20Instance.methods
        .balanceOf(withdrawal.bank.address)
        .call();

      if (balanceOfBank < withdrawal.amount) {
        done();

        debug("Bank balance empty");

        await addToQueue({ withdrawal });

        return;
      }

      const transfer = erc20Instance.methods.transfer(
        withdrawal.to,
        withdrawal.amount
      );

      const transferSigned = await web3.client.eth.accounts.signTransaction(
        {
          to: erc20Instance.options.address,
          data: transfer.encodeABI(),
          gas: 1400000, // TODO
        },
        config.TRANSACTION_SIGNER_PRIVATE_KEY
      );

      const transferReceipt = await web3.client.eth.sendSignedTransaction(
        transferSigned.rawTransaction
      );

      await withdrawn.addToQueue({
        withdrawal,
        transactionHash: transferReceipt.transactionHash,
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
  redis.queues.Withdraw.process(listener);
}

async function addToQueue({ withdrawal }) {
  await redis.queues.Withdraw.add(
    {
      withdrawal: { id: withdrawal.id },
    },
    { attempts: 10, backoff: 60000 }
  );
}

module.exports = { listen, addToQueue };
