

const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient

exports.add = async (req, res) => {
  try {
    const { title, price, stock, categoryId } = req.body;
    const product = await prisma.product.create({
      data: { title, price, stock, categoryId },
    });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  const products = await prisma.product.findMany({
    include: { category: true },
  });
  res.json(products);
};

exports.edit = async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, price, stock } = req.body;
  try {
    const updated = await prisma.product.update({
      where: { id },
      data: { title, price, stock },
    });
    res.json(updated);
  } catch (err) {
    if(err.message.includes("No record was found")){
      return res.status(400).json({ message:  "No record was found" });
    }
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    if(err.message.includes("No record was found")){
      return res.status(400).json({ message:  "No record was found" });
    }
    res.status(400).json({ error: err.message });
  }
};
