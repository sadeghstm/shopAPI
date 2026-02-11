const express = require('express')

const orderRouter = express.Router()

const orderController = require('../controllers/order')
const { authMiddleware } = require('../middlewares/auth')

orderRouter.use(authMiddleware)

orderRouter.get('/:orderId',orderController.getOrderDetails)
orderRouter.get('/',orderController.getOrders)






module.exports = orderRouter