const { User } = require("../../models");

async function me(req, res) {
  const { email } = req.query;

  const [found] = await User.find({
    where: { email },
    selectionSet: `
        {
            id
            email
            receiver {
              address
            }
            balance
        }
    `,
  });

  if (!found) {
    return res.status(404).end();
  }

  res.json(found);
}

module.exports = me;
