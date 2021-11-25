const decodeJWT = require("./decode-jwt");
const { User } = require("../models");

async function authenticateRequest(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).end();
  }

  const [, token] = authHeader.split("Bearer ");

  if (!token) {
    return res.status(401).end();
  }

  let data;
  try {
    data = await decodeJWT(token);
  } catch (error) {
    return res.status(403).end();
  }

  const [found] = await User.find({ where: { id: data.sub } });
  if (!found) {
    return res.status(403).end();
  }

  req.user = found;

  next();
}

module.exports = authenticateRequest;
