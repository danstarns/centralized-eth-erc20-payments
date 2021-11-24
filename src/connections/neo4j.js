const neo4j = require("neo4j-driver");
const debug = require("../utils/debug")("Neo4j");
const { NEO4J_URL, NEO4J_USER, NEO4J_PASSWORD } = require("../config");

const driver = neo4j.driver(
  NEO4J_URL,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
);

async function connect() {
  debug(`Connecting to: ${NEO4J_URL}`);

  await driver.verifyConnectivity();

  debug("Connected");
}

module.exports = {
  connect,
  driver,
};
