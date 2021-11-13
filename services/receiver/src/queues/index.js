const deploy = require("./deploy");
const deployed = require("./deployed");

function listen() {
  deploy.listen();
  deployed.listen();
}

module.exports = { listen };
