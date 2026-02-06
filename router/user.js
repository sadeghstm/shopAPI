const express = require('express')
const userRouter = express.Router()

const userController = require('../controllers/user')
const { authMiddleware } = require('../middlewares/auth')

userRouter.use(authMiddleware)


// user Oerations:
userRouter.post('/',userController.register )

userRouter.put('/:id',userController.edit )

userRouter.get('/:id',userController.get )

userRouter.delete('/:id',userController.remove)


module.exports = userRouter