require("dotenv").config();
const redis = require("./redis");
const neo4j = require("./neo4j");
const debug = require("./debug")("index");
const queues = require("./queues");

async function main() {
  debug("Starting");

  await neo4j.connect();

  await redis.connect();

  await queues.listen();

  debug("Started");
}

main();
