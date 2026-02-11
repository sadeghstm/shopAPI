
const express = require('express')
const operationsRouter = express.Router()

const operationsController = require('../controllers/operations')
const { authMiddleware } = require('../middlewares/auth')

operationsRouter.use(authMiddleware)

operationsRouter.post('/purchase',operationsController.purchase)
operationsRouter.post('/refund',operationsController.refund)
operationsRouter.get('/transactions',operationsController.getTransactions)



module.exports = operationsRouter
