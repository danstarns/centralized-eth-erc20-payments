const express = require("express");
const debug = require("./debug")("Server");
const { SERVER_PORT } = require("./config");

const app = express();

async function start() {
  debug(`Starting on port: ${SERVER_PORT}`);

  await app.listen(SERVER_PORT);

  debug("Started");
}

module.exports = {
  start,
};
