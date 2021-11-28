const { User, Withdrawal } = require("../../models");
const config = require("../../config");
const withdrawer = require("../../withdrawer");

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

  const { withdrawals } = await Withdrawal.create({
    input: [
      {
        amount,
        completed: false,
        to,
        bank: { connect: { where: { node: { id: config.BANK_ID } } } },
        user: { connect: { where: { node: { id: user.id } } } },
      },
    ],
  });

  await withdrawer.withdraw.addToQueue({ withdrawal: withdrawals[0] });

  return res.sendStatus(200).end();
}

module.exports = withdraw;
