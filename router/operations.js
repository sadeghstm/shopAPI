
const express = require('express')
const operationsRouter = express.Router()

const operationsController = require('../controllers/operations')
const { authMiddleware } = require('../middlewares/auth')

operationsRouter.use(authMiddleware)

operationsRouter.post('/:userId/purchase',operationsController.purchase)
operationsRouter.post('/:userId/refund',operationsController.refund)
operationsRouter.get('/:userId/transactions',operationsController.getTransactions)



module.exports = operationsRouter
