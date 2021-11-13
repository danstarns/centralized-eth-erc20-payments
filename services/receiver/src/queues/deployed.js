const { queues } = require("../redis");

function listener() {
  // Get tx.id from job
  // Query for tx on blockchain & see if its completed
  //    if not completed requeue the job
  // Query logs to find the receiver address
  // connect the receiver address to User in Neo4j
}

function listen() {
  queues.Deployed.process(listener);
}

module.exports = { listen };
