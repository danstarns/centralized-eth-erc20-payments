const debug = require("debug");

const prefix = "API: ";

function createComponent(namespace) {
  return debug(`${prefix}${namespace}`);
}

module.exports = createComponent;
