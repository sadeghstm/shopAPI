
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient



//Wallet:
exports.get =  async (req, res) => {
  const userId = req.user.id;
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  res.json(wallet);
};

exports.deposit = async (req, res) => {
  const { amount, type, description } = req.body;
  const userId = req.user.id;

  const wallet = await prisma.wallet.findUnique({ where: { userId } });

  const result = await prisma.$transaction(async (tx) => {
    await tx.walletTx.create({
      data: {
        walletId: wallet.id,
        amount: Number(amount),
        type: type || 'refund',
        description
      }
    });

    return await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: wallet.balance + Number(amount) }
    });
  });

  res.json(result);
};

exports.withdraw =  async (req, res) => {
  const userId = req.user.id;
  const { amount } = req.body;

  const wallet = await prisma.wallet.findUnique({ where: { userId }});

  if (wallet.balance < amount)
    return res.status(400).json({ error: 'Insufficient balance' });

  const result = await prisma.$transaction(async (tx) => {
    await tx.walletTx.create({
      data: {
        walletId: wallet.id,
        amount: -Number(amount),
        type: 'purchase',
      }
    });

    return await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: wallet.balance - Number(amount) }
    });
  });

  res.json(result);
};