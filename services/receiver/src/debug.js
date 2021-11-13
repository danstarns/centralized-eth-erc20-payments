const debug = require("debug");

const prefix = "Receiver: ";

function createComponent(namespace) {
  return debug(`${prefix}${namespace}`);
}

module.exports = createComponent;
