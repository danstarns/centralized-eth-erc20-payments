require("express-async-errors");
const express = require("express");
const debug = require("../utils/debug")("Server");
const routes = require("./routes");
const config = require("../config");
const authenticateRequest = require("../utils/authenticate-request");

const app = express();
app.use(express.json());
app.post("/signup", routes.signup);
app.post("/login", routes.login);
app.get("/me", authenticateRequest, routes.me);
app.post("/withdraw", authenticateRequest, routes.withdraw);
app.use((error, req, res, next) => {
  res.status(500);
  debug(error.message);
  res.send({ error: error.message });
});

async function start() {
  debug(`Starting on port: ${config.SERVER_PORT}`);

  await app.listen(config.SERVER_PORT);

  debug("Started");
}

module.exports = {
  start,
  app,
};
