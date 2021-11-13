const { queues } = require("../redis");
const { User } = require("../models");

function listener(job, done) {
  (async function () {
    try {
      const [user] = await User.find({ where: { id: job.data.user.id } });
      console.log(user);

      // Query for existing user via BankContract.getReceiverByUserId()
      // If Existing receiver throw error

      // Create a transaction and call BankContract.createReceiver(userId);
      // Get the tx.id from the creation and add it to the deployed queue
      done();
    } catch (error) {
      done(error);
    }
  })();
}

function listen() {
  queues.Deploy.process(listener);
}

module.exports = { listen };
