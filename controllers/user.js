
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient({})



exports.register = async (req, res) => {
  const { id, username, email, password, phone } = req.body
  try {
    const newUser = await prisma.user.create({
      data: {
        id, username, email, password, phone,
        cart: {
          create: {}
        }
      },
      include: {
        cart: true
      }
    });
    await prisma.wallet.create({
      data: { userId: id }
    })


    res.json(newUser)
  } catch (error) {
    console.log(error.message);
    

    if(error.message.includes("Unique constraint failed on the fields: (`id`)")){
      return res.status(400).json({message:"id already exists!"})
    }
    if(error.message.includes("Unique constraint failed on the fields: (`username`)")){
      return res.status(400).json({message:"username already exists!"})
    }
    if(error.message.includes("Unique constraint failed on the fields: (`email`)")){
      return res.status(400).json({message:"email already exists!"})
    }
    console.error("error creating user");
    res.status(400).json({ message: error.message });
  }
}

exports.edit = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { username, email, password, phone } = req.body
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { id, username, email, password, phone }
    })
    res.json({ message: 'user edited successfully!', updatedUser })
  } catch (error) {
    res.status(400).json({ message: "user failed to update!", error: error.message })
  }
}
exports.get = async (req, res) => {
  const id = parseInt(req.params.id)
  console.log(id);

  try {
    const foundUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, email: true, password: false, phone: true, createdAt: true }
    });
    res.json(foundUser)
  } catch (error) {
    res.status(404).json({ message: "user not found!", error: error.message })
  }
}

exports.remove =  async (req, res) => {
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
