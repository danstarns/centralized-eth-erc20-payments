const Queue = require("bull");
const debug = require("../utils/debug")("Redis");
const {
  REDIS_HOST,
  REDIS_PORT,
  REDIS_RECEIVER_DEPLOY_QUEUE,
  REDIS_RECEIVER_DB,
  REDIS_WITHDRAWER_WITHDRAWN_QUEUE,
  REDIS_WITHDRAWER_WITHDRAW_QUEUE,
  REDIS_RECEIVER_DEPLOYED_QUEUE,
  REDIS_WITHDRAWER_DB,
} = require("../config");

const queues = {
  Deploy: new Queue(REDIS_RECEIVER_DEPLOY_QUEUE, {
    redis: { host: REDIS_HOST, port: REDIS_PORT, db: REDIS_RECEIVER_DB },
  }),
  Deployed: new Queue(REDIS_RECEIVER_DEPLOYED_QUEUE, {
    redis: { host: REDIS_HOST, port: REDIS_PORT, db: REDIS_RECEIVER_DB },
  }),
  Withdraw: new Queue(REDIS_WITHDRAWER_WITHDRAW_QUEUE, {
    redis: { host: REDIS_HOST, port: REDIS_PORT, db: REDIS_WITHDRAWER_DB },
  }),
  Withdrawn: new Queue(REDIS_WITHDRAWER_WITHDRAWN_QUEUE, {
    redis: { host: REDIS_HOST, port: REDIS_PORT, db: REDIS_WITHDRAWER_DB },
  }),
};

async function connect() {
  debug(`Connecting to: ${REDIS_HOST}:${REDIS_PORT}`);

  await queues.Deploy.isReady();
  await queues.Deployed.isReady();
  await queues.Withdraw.isReady();
  await queues.Withdrawn.isReady();

  debug("Connected");
}

module.exports = {
  connect,
  queues,
};
