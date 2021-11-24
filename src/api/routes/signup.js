const { User } = require("../../models");
const { deploy } = require("../../receiver");

async function signup(req, res) {
  const { email, password } = req.body;

  const hashedPassword = password; // TODO - hash

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

  res.json(user);
}

module.exports = signup;
