const { User } = require("../../models");
const { deploy } = require("../../receiver");
const hashPassword = require("../../utils/hash-password");
const createJwt = require("../../utils/create-jwt");

async function signup(req, res) {
  const { email, password } = req.body;

  if (!email || !password || (!email && !password)) {
    return res.status(400).end();
  }

  const existing = await User.find({ where: { email } });
  if (existing.length) {
    return res.status(400).send("User with email already exists");
  }

  const hashedPassword = await hashPassword(password);

  const { users } = await User.create({
    input: [{ email, password: hashedPassword }],
    selectionSet: `
        {
            users {
                id
                email
            }
        }
    `,
  });

  const user = users[0];

  await deploy.addToQueue({ user });

  const jwt = await createJwt({ sub: user.id });

  return res.json({ jwt });
}

module.exports = signup;
