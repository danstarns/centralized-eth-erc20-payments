const { User } = require("../models");
const { queues } = require("../redis");

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

  await queues.Forwarder.add({ user }, { attempts: 100, backoff: 5000 });

  res.json(user);
}

module.exports = signup;
