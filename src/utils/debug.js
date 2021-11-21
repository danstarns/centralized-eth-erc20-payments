const debug = require("debug");

const prefix = "centralized-eth-erc20-payments: ";

function createComponent(namespace) {
  return debug(`${prefix}${namespace}`);
}

module.exports = createComponent;
