const debug = require("../utils/debug")("withdrawer");
const withdraw = require("./withdraw");
const withdrawn = require("./withdrawn");

function listen() {
  debug("Starting");

  withdraw.listen();
  withdrawn.listen();

  debug("Started");
}

module.exports = {
  listen,
  withdraw,
};
