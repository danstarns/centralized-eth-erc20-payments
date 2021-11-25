const jwt = require("jsonwebtoken");
const config = require("../config");

function decodeJWT(input) {
  return new Promise((resolve, reject) => {
    jwt.verify(input, config.JWT_SECRET, (err, output) => {
      if (err) {
        reject(err);
      }

      resolve(output);
    });
  });
}

module.exports = decodeJWT;
