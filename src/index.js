require("dotenv").config();
const debug = require("./utils/debug")("main");
const connections = require("./connections");
const receiver = require("./receiver");
const watcher = require("./watcher");
const api = require("./api");

async function main() {
  debug("Starting");

  await connections.connect();

  receiver.listen();

  watcher.watch();

  await api.start();

  debug("Started");
}

main();
