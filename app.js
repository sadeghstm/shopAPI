const express = require('express');
const { PrismaClient } = require('@prisma/client');
const app = express();
const prisma = new PrismaClient();

app.use(express.json());


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

app.listen(3000, () => console.log('Server running on Port:3000'));
