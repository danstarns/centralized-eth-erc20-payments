require("dotenv").config();
const debug = require("./utils/debug")("main");
const connections = require("./connections");
const receiver = require("./receiver");
const withdrawer = require("./withdrawer");
const watcher = require("./watcher");
const api = require("./api");

async function main() {
  debug("Starting");

  await connections.connect();

  receiver.listen();

  withdrawer.listen();

  watcher.watch();

  await api.start();

  debug("Started");
}

main();
