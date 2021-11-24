const debug = require("../utils/debug")("connections");
const neo4j = require("./neo4j");
const redis = require("./redis");
const web3 = require("./web3");

async function connect() {
  debug("Connecting");

  await neo4j.connect();

  await redis.connect();

  await web3.connect();

  debug("Connected");
}

module.exports = {
  connect,
  neo4j,
  redis,
  web3,
};
