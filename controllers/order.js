const {PrismaClient} = require('@prisma/client')

const prisma = new PrismaClient()


exports.getOrderDetails = async (req, res) => {
  const userId = req.user.id
  const orderId = req.params.orderId
  try {
    const order = await prisma.order.findUnique({
      where: { id:orderId },
    })

    if (!order) return res.status(404).json({ error: 'order not found...' })
    res.json(order)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
exports.getOrders = async (req, res) => {
  const userId = req.user.id
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
    })

    if (!orders) return res.status(404).json({ error: 'no submitted orders found...' })
    res.json(orders)
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ error: error.message })
  }
}
