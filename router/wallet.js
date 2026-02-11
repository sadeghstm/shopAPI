
const express = require('express')
const walletRouter = express.Router()

const walletController = require('../controllers/wallet') 
const { authMiddleware } = require('../middlewares/auth')
walletRouter.use(authMiddleware)


walletRouter.get('/',walletController.get)
walletRouter.post('/deposit',walletController.deposit)
walletRouter.post('/withdraw',walletController.withdraw)



module.exports = walletRouter