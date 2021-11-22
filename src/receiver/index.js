const debug = require("../utils").debug("receiver");
const deploy = require("./deploy");
const deployed = require("./deployed");

function listen() {
  debug("Starting");

  deploy.listen();
  deployed.listen();

  debug("Started");
}

module.exports = { listen };
