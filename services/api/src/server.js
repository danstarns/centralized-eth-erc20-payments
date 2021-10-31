const express = require("express");
const bodyParser = require("body-parser");
const debug = require("./debug")("Server");
const routes = require("./routes");
const { SERVER_PORT } = require("./config");

const app = express();
app.use(express.json());
app.post("/signup", routes.signup);

async function start() {
  debug(`Starting on port: ${SERVER_PORT}`);

  await app.listen(SERVER_PORT);

  debug("Started");
}

module.exports = {
  start,
  app,
};
