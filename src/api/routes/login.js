const { User } = require("../../models");
const comparePassword = require("../../utils/compare-password");
const createJwt = require("../../utils/create-jwt");

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password || (!email && !password)) {
    return res.status(400).end();
  }

  const [user] = await User.find({
    where: { email },
    selectionSet: `
        {
          id
          password
        }
    `,
  });

  if (!user) {
    return res.status(404).end();
  }

  try {
    const result = await comparePassword(password, user.password);
    if (!result) {
      throw new Error("");
    }
  } catch (error) {
    return res.status(401).end();
  }

  const jwt = await createJwt({ sub: user.id });

  return res.json({ jwt });
}

module.exports = login;
