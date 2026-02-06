const express = require('express')

const cartRouter = express.Router()

const cartController = require('../controllers/cart')
const { authMiddleware } = require('../middlewares/auth')

cartRouter.use(authMiddleware)

cartRouter.get('/:userId',cartController.getCart)
cartRouter.post('/:userId/item',cartController.addItem)
cartRouter.patch('/:userId/item/:productId',cartController.changeAmount)
cartRouter.delete('/:userId/item/:productId',cartController.deleteItem)





module.exports = cartRouter