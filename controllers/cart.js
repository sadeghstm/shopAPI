
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()


exports.getCart = async (req, res) => {
  const userID = parseInt(req.params.userId)
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: userID },
      include: {
        items:
        {
          include: { product: true }
        }
      }
    })

    if (!cart) return res.status(404).json({ error: 'Cart not found' })
    res.json(cart.items)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// CartItem Operations:
exports.addItem = async (req, res) => {
  const userId = req.user.userId
  const { productId, quantity } = req.body

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId }
    })
    const product = await prisma.product.findUnique({
      where: { id:productId }
    })
    if (!cart) {
      res.send({ message: "cart doesnt exists!" })
    }
    if (!product) {
      res.send({ message: "product doesnt exists!" })
    }
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId: productId }
      // where:{ items:{include:{productId:productId}}}
    })

    let item;
    if (!existingItem) {
      item = await prisma.cartItem.create({
        data: {
          cart: { connect: { id: cart.id } },
          product: { connect: { id: productId } },
          quantity: 1
        }
      })
      return res.json({message:"item added to cart."})
    } else {
      item = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: { increment: quantity } }
      })  
      return res.json({message:"Item added to basket successfully!",quantity: item.quantity})
    }
  } catch (error) {
    console.error(error.message);
  }
}

//change amount of an item in basket
exports.changeAmount = async (req, res) => {

  const {userId,productId} = {
    userId:parseInt(req.params.userId),
    productId:parseInt(req.params.productId)
  }
  
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId }
    })
    if (!cart) {
      res.send({ message: "cart doesnt exists!" })
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id,productId:productId }
      // where:{ items:{include:{productId:productId}}}
    })
    

    let item;
    if (!existingItem) {
      return res.json("item doesnt exists!")
    } else {
      const newQuantity = existingItem.quantity - 1;
      if (newQuantity < 1) {
        await prisma.cartItem.delete({ where: { id: existingItem.id } });
        return res.json({ message: 'Item removed (quantity < 1)' });
      }

      const updated = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });

      res.json({ message: 'Item decreased successfuly',quantity:newQuantity });
    }
  } catch (error) {
    console.error(error.message);
  }

  // const userId = parseInt(req.params.userId);
  // // const itemId = parseInt(req.params.itemId);
  // const { change } = req.body;

  // try {
  //   const cart = await prisma.cart.findUnique({ where: { userId } });
  //   if (!cart) return res.status(404).json({ error: 'Cart not found' });

  //   const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
  //   if (!item || item.cartId !== cart.id)
  //     return res.status(404).json({ error: 'Item not found in user cart' });

  //   const newQuantity = item.quantity + change;
  //   if (newQuantity < 1) {
  //     await prisma.cartItem.delete({ where: { id: itemId } });
  //     return res.json({ message: 'Item removed (quantity < 1)' });
  //   }

  //   const updated = await prisma.cartItem.update({
  //     where: { id: itemId },
  //     data: { quantity: newQuantity },
  //   });

  //   res.json(updated);
  // } catch (err) {
  //   res.status(500).json({ error: err.message });
  // }
};

exports.deleteItem = async (req, res) => {
  const userId = parseInt(req.params.userId);
  const productId = parseInt(req.params.productId)

  try {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const item = await prisma.cartItem.findFirst({ where: { cartId:cart.id,productId:productId } });
    if (!item || item.cartId !== cart.id){
      return res.status(404).json({ error: 'Item not found in user cart' });
    }

    await prisma.cartItem.delete({ where: { id: item.id } });
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// Cart Operations:

// app.post('/cart', async (req, res) => {
//   const { id, userID, productId } = res.body
//   try {
//     const newCart = await prisma.cart.upsert({
//       where: { userID }
//     })
//     res.json(newCart);
//   } catch (e) {
//     res.status(500).json("error on creating cart!")
//   }
// })
