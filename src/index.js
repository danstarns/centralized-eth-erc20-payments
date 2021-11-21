require("dotenv").config();
const debug = require("./utils").debug("main");
const connections = require("./connections");
const receiver = require("./receiver");
const api = require("./api");

async function main() {
  debug("Starting");

  await connections.connect();

  await receiver.listen();

  await api.start();

  debug("Started");
}

main();
