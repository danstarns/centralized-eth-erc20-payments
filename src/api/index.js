require("express-async-errors");
const express = require("express");
const debug = require("../utils").debug("Server");
const routes = require("./routes");
const { SERVER_PORT } = require("../config");

const app = express();
app.use(express.json());
app.post("/signup", routes.signup);
app.get("/me", routes.me);
app.use((error, req, res, next) => {
  res.status(500);
  debug(error.message);
  res.send({ error: error.message });
});

async function start() {
  debug(`Starting on port: ${SERVER_PORT}`);

  await app.listen(SERVER_PORT);

  debug("Started");
}

module.exports = {
  start,
  app,
};
