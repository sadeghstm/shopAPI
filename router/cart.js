const express = require('express')

const cartRouter = express.Router()

const cartController = require('../controllers/cart')
const { authMiddleware } = require('../middlewares/auth')

cartRouter.use(authMiddleware)

cartRouter.get('/',cartController.getCart)
cartRouter.post('/',cartController.addItem)
cartRouter.patch('/:productId',cartController.changeAmount)
cartRouter.delete('/:productId',cartController.deleteItem)





module.exports = cartRouter