const { User } = require("../../models");

async function withdraw(req, res) {
  const { amount, to } = req.body;

  if (!amount || !to || (!amount && !to)) {
    return res.status(400).end();
  }

  const [user] = await User.find({
    where: { id: req.user.id },
    selectionSet: `
        {
            id
            balance
        }
    `,
  });

  if (amount > user.balance) {
    return res.status(400).send("insufficient funds");
  }

  await User.update({
    where: { id: user.id },
    create: { withdrawals: [{ node: { amount, completed: false } }] },
  });

  return res.send(200).end();
}

module.exports = withdraw;
