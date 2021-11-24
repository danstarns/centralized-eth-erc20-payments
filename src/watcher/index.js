const debug = require("../utils/debug")("watcher");
const config = require("../config");
const { Bank, User } = require("../models");
const { web3 } = require("../connections");
const util = require("util");
const sleep = util.promisify(setTimeout);

async function watcher() {
  try {
    const [bank] = await Bank.find({ where: { id: config.BANK_ID } });
    const usdtContract = web3.getUSDTContract();

    const options = {
      fromBlock: undefined,
      toBlock: undefined,
    };

    if (!bank.uptoDateWithBlockNumber && bank.uptoDateWithBlockNumber !== 0) {
      options.fromBlock = "latest";
      options.toBlock = "latest";
    } else {
      // We only do one block at a time
      const newBlockNumber = bank.uptoDateWithBlockNumber + 1;
      options.fromBlock = newBlockNumber;
      options.toBlock = newBlockNumber;
    }

    const events = await usdtContract.getPastEvents("Transfer", options);
    const block = await web3.client.eth.getBlock(options.toBlock);

    if (!block) {
      return;
    }

    if (
      bank.uptoDateWithBlockNumber &&
      bank.uptoDateWithBlockNumber === block.number
    ) {
      return;
    }

    if (!events.length) {
      if (block.transactions.length) {
        await Bank.update({
          where: { id: config.BANK_ID },
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
      where: { id: config.BANK_ID },
      update: { uptoDateWithBlockNumber: block.number },
    });
  } catch (error) {
    debug("Error in watcher");
    console.error(error);
    return;
  }
}

function watch() {
  debug(
    `Starting to watch with ${config.WATCHER_INTERVAL_MILLISECONDS} milliseconds`
  );

  /*
    This is a forever running generator :O
    Designed to always yield so that we can use the async functionally of 'for await'
    This will ensure that we sequentially call the 'watcher' function and wait WATCHER_INTERVAL_MILLISECONDS after each call
    This will not block the event loop.
  */
  (async () => {
    for await (const _ of (function* generator() {
      while (true) {
        yield true;
      }
    })()) {
      await watcher();
      await sleep(config.WATCHER_INTERVAL_MILLISECONDS);
    }
  })();

  debug("Watching");
}

module.exports = {
  watch,
};
