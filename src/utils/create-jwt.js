const jwt = require("jsonwebtoken");
const config = require("../config");

function createJWT(input) {
  return new Promise((resolve, reject) => {
    jwt.sign(input, config.JWT_SECRET, (err, output) => {
      if (err) {
        return reject(err);
      }

      return resolve(output);
    });
  });
}

module.exports = createJWT;
