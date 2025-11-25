const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { Param } = require('@prisma/client/runtime/library');
const app = express();
const prisma = new PrismaClient();
const smsService = require('./services/smsService');
const { otpStore } = require('./globalStore');
const { time } = require('console');
require('dotenv').config();

app.use(express.json());



// products Operations:
app.post('/products', async (req, res) => {
  try {
    const { name, price, stock, categoryId } = req.body;
    const product = await prisma.product.create({
      data: { name, price, stock, categoryId },
    });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/products', async (req, res) => {
  const products = await prisma.product.findMany({
    include: { category: true },
  });
  res.json(products);
});

app.put('/products/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, price, stock } = req.body;
  try {
    const updated = await prisma.product.update({
      where: { id },
      data: { name, price, stock },
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/products/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});




// user Oerations:
app.post('/user', async (req, res) => {
  const { id, name, email, password, phone } = req.body
  try {
    const newUser = await prisma.user.create({
      data: {
        id, name, email, password, phone,
        cart: {
          create: {}
        }
      },
      include: {
        cart: true
      }
    });

    res.json(newUser)
  } catch (error) {
    console.error("error creating user");
    res.status(400).json({ message: error.message });
  }
}
)

app.put('/user/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { name, email, password, phone } = req.body
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { id, name, email, password, phone }
    })
    res.json({ message: 'user updated successfully!', updatedUser })
  } catch (error) {
    res.status(400).json({ message: "user failed to update!", error: error.message })
  }
})
app.get('/user/:id', async (req, res) => {
  const id = parseInt(req.params.id)
  console.log(id);

  try {
    const foundUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, password: false, phone: true, createdAt: true }
    });
    res.json(foundUser)
  } catch (error) {
    res.status(404).json({ message: "user not found!", error: error.message })
  }
})

app.delete('/user/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    await prisma.user.delete({
      where: { id },
    })
    res.json({ message: "user deleted successfully!" })
  }
  catch (error) {
    res.status(400).json({ message: "user not deleted!", error: error.message })
  }
}
)


// Cart Operations:

// app.post('/cart', async (req, res) => {
//   const { id, userID, productID } = res.body
//   try {
//     const newCart = await prisma.cart.upsert({
//       where: { userID }
//     })
//     res.json(newCart);
//   } catch (e) {
//     res.status(500).json("error on creating cart!")
//   }
// })

app.get('/cart/:userId', async (req, res) => {
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
})

// CartItem Operations:
app.post('/cart/:userId/item', async (req, res) => {
  const userId = parseInt(req.params.userId)
  const { productID, quantity } = req.body
  try {

    const cart = await prisma.cart.findUnique({
      where: { userId }
    })
    if (!cart) {
      res.send({ message: "cart doesnt exists!" })
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId: productID }
      // where:{ items:{include:{productID:productID}}}
    })

    let item;
    if (!existingItem) {
      item = await prisma.cartItem.create({
        data: {
          cart: { connect: { id: cart.id } },
          product: { connect: { id: productID } },
          quantity: 1
        }
      })
      return res.json(item)
    } else {
      item = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: { increment: 1 } }
      })
      return res.json("Item added to basket successfully!" + item)
    }
  } catch (error) {
    console.error(error.message);
  }
})

app.patch('/:userId/item/:itemId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  const itemId = parseInt(req.params.itemId);
  const { change } = req.body;

  try {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!item || item.cartId !== cart.id)
      return res.status(404).json({ error: 'Item not found in user cart' });

    const newQuantity = item.quantity + change;
    if (newQuantity < 1) {
      await prisma.cartItem.delete({ where: { id: itemId } });
      return res.json({ message: 'Item removed (quantity < 1)' });
    }

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: newQuantity },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/:userId/item/:itemId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  const itemId = parseInt(req.params.itemId);

  try {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!item || item.cartId !== cart.id)
      return res.status(404).json({ error: 'Item not found in user cart' });

    await prisma.cartItem.delete({ where: { id: itemId } });
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.post('/auth/send-otp', async (req, res) => {

  try {
    const { phone } = req.body
    const otp = smsService.sendOTP(phone)

    otpStore[phone] = {
      code: otp,
      expireAt: Date.now() + 2 * 60 * 1000
    }


    res.json({ message: "SMS request sent to the API." })
  } catch (error) {
    console.error(error.message);
    res.json({ message: "message failed to send!" })
  }
})

app.post('/auth/verify',async(req,res)=>{
  const {phone,code} = req.body
  
  const data = otpStore[phone]
  console.log(data);
  
  if(!data)
    return res.status(400).json({message:"not found!"})
  if(data.expireAt<Date.now())
    return res.status(400).json({message:"code has been expired."})
  if(data.code != code)
    return res.status(400).json("Invalid Code!")

  const foundUser =await prisma.user.findFirst({
    where:{phone},
    select:{name:true}
  })
    smsService.sendSuccessfulAuthSMS(phone,foundUser.name)
    console.log(foundUser.name);
    
    delete otpStore[phone]

    res.json({message:"Verification Successful!"})
})

app.listen(process.env.PORT, () => console.log('Server running on Port:', process.env.PORT));
