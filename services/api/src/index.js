require("dotenv").config();
const server = require("./server");
const redis = require("./redis");
const neo4j = require("./neo4j");
const debug = require("./debug")("index");

async function main() {
  debug("Starting");

  await neo4j.connect();

  await redis.connect();

  await server.start();

  debug("Started");
}

main();
