const express = require('express')
const userRouter = express.Router()

const userController = require('../controllers/user')
const { authMiddleware } = require('../middlewares/auth')




// user Oerations:
userRouter.post('/',userController.register )

userRouter.put('/',userController.edit ).use(authMiddleware)

userRouter.get('/',userController.get ).use(authMiddleware)

userRouter.delete('/',userController.remove).use(authMiddleware)


module.exports = userRouter