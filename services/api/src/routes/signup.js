const { User } = require("../models");

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

  res.json(users[0]);
}

module.exports = signup;
