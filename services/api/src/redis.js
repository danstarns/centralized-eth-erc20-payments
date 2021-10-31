const Queue = require("bull");
const debug = require("./debug")("Redis");
const {
  REDIS_HOST,
  FORWARDER_QUEUE,
  FORWARDER_DB,
  WITHDRAWER_QUEUE,
  WITHDRAWER_DB,
  REDIS_PORT,
} = require("./config");

const queues = {
  Forwarder: new Queue(FORWARDER_QUEUE, {
    redis: { host: REDIS_HOST, port: REDIS_PORT, db: FORWARDER_DB },
  }),
  Withdrawer: new Queue(WITHDRAWER_QUEUE, {
    redis: { host: REDIS_HOST, port: REDIS_PORT, db: WITHDRAWER_DB },
  }),
};

async function connect() {
  debug(`Connecting to: ${REDIS_HOST}:${REDIS_PORT}`);

  await queues.Forwarder.isReady();
  await queues.Withdrawer.isReady();

  debug("Connected");
}

module.exports = {
  connect,
  queues,
};
