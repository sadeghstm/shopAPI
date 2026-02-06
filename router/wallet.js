
const express = require('express')
const walletRouter = express.Router()

const walletController = require('../controllers/wallet') 
const { authMiddleware } = require('../middlewares/auth')
walletRouter.use(authMiddleware)


walletRouter.get('/:userId',walletController.get)
walletRouter.post('/:userId/deposit',walletController.deposit)
walletRouter.post('/:userId/withdraw',walletController.withdraw)



module.exports = walletRouter