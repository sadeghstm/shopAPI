
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient

exports.purchase = async (req, res) => {
  const userId = parseInt(req.user.userId);
  const { amount } = req.body;

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet || wallet.balance < amount)
    return res.status(400).json({ error: "Insufficient balance" });

  const cart = await prisma.cart.findUnique({
    where: { userId },
    select: { id: true, items: { select: { productId: true, quantity: true } } }
  });

  if (!cart || cart.items.length === 0)
    return res.status(400).json({ error: "Cart is empty" });

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.wallet.update({
      where: { userId },
      data: { balance: { decrement: amount } }
    });

    const order = await tx.order.create({
      data: {
        userId,
        total: amount,
        status: "paid",

        items: {
          create: cart.items.map((ci) => ({
            productId: ci.productId,
            quantity: ci.quantity
          }))
        }
      },
      include: { items: true }
    });

    await tx.walletTx.create({
      data: {
        walletId: updated.id,
        amount: -amount,
        type: "PURCHASE",
        description: `Order #${order.id}`
      }
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return { wallet: updated, order };
  });

  res.json(result);
};
// exports.purchase = async (req, res) => {
//   const userId = parseInt(req.user.userId);
//   const { amount } = req.body;

//   const wallet = await prisma.wallet.findUnique({ where: { userId } });
//   if (!wallet || wallet.balance < amount)
//     return res.status(400).json({ error: "Insufficient balance" });

//   const cart =await prisma.cart.findUnique({
//     where:{userId},
//     select:{items:true}
//   })
//   const result = await prisma.$transaction(async (tx) => {
//     const updated = await tx.wallet.update({
//       where: { userId },
//       data: { balance: { decrement: amount } }
//     });
//     const order = await prisma.order.create({
//       data:{
//         userId:userId,
//         total:amount,
//         status:"paid",
//         items:cart.items,
//       }
//     })

//     await tx.walletTx.create({
//       data: {
//         walletId: updated.id,
//         amount: -amount,
//         type: "PURCHASE",
//         description: `Order #${order.id}`
//       }
//     });

//     return updated;
//   });

//   res.json(result);
// };

// @ts-ignore
exports.refund = async (req, res) => {
  const userId = parseInt(req.user.userId);
  const { amount, orderId, reason } = req.body;

  const refundAmount = Math.abs(amount);

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.wallet.upsert({
      where: { userId },
      create: { userId, balance: refundAmount },
      update: { balance: { increment: refundAmount } }
    });
    
    await tx.walletTx.create({
      data: {
        walletId: updated.id,
        amount: refundAmount,
        type: "REFUND",
        description: `Refund for order #${orderId}: ${reason}`
      }
    });

    return updated;
  });

  res.json(result);
};

exports.getTransactions = async (req, res) => {
  const userId = parseInt(req.user.userId);

  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    include: { txs: { orderBy: { createdAt: 'desc' } } }
  });

  if (!wallet)
    return res.json({ txs: [] });

  res.json(wallet.txs);
};