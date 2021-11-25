const { User } = require("../../models");

async function me(req, res) {
  const [found] = await User.find({
    where: { id: req.user.id },
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

  return res.json(found);
}

module.exports = me;
