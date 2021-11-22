const debug = require("../utils").debug("watcher");
const { WATCHER_INTERVAL_MILLISECONDS, BANK_ID } = require("../config");
const { Bank, User } = require("../models");
const { web3 } = require("../connections");

async function watcher() {
  try {
    const bank = await Bank.find({ where: { id: BANK_ID } });
    const usdtContract = web3.getUSDTContract();

    const options = {
      fromBlock: undefined,
      toBlock: undefined,
    };

    if (!bank.uptoDateWithBlockNumber) {
      options.fromBlock = "latest";
    } else {
      options.fromBlock = bank.uptoDateWithBlockNumber;
      options.toBlock = bank.uptoDateWithBlockNumber + 1; // We only do one block at a time
    }

    const events = await usdtContract.getPastEvents("Transfer", options);
    const block = await web3.client.eth.getBlock(
      options.fromBlock === "latest" ? "latest" : options.toBlock
    );

    if (
      bank.uptoDateWithBlockNumber &&
      bank.uptoDateWithBlockNumber === block.number
    ) {
      return;
    }

    if (!events.length) {
      if (block.transactions.length) {
        await Bank.update({
          where: { id: BANK_ID },
          update: { uptoDateWithBlockNumber: block.number },
        });
      }

      return;
    }

    await Promise.all(
      events.map(async (event) => {
        const [foundUser] = await User.find({
          where: { receiver: { address: event.returnValues.to } },
        });

        if (!foundUser) {
          return false;
        }

        const transaction = await web3.client.eth.getTransactionReceipt(
          event.transactionHash
        );

        await User.update({
          where: {
            id: foundUser.id,
          },
          create: {
            deposits: [
              {
                node: {
                  amount: Number(event.returnValues.value),
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
                  receiver: {
                    connect: {
                      where: { node: { address: event.returnValues.to } },
                    },
                  },
                },
              },
            ],
          },
        });
      })
    );

    await Bank.update({
      where: { id: BANK_ID },
      update: { uptoDateWithBlockNumber: block.number },
    });
  } catch (error) {
    debug("Error in watcher");
    console.error(error);
    return;
  }
}

function watch() {
  debug(`Starting to watch with ${WATCHER_INTERVAL_MILLISECONDS} milliseconds`);

  setInterval(watcher, WATCHER_INTERVAL_MILLISECONDS);

  debug("Watching");
}

module.exports = {
  watch,
};
