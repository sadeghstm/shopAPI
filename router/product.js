const express = require('express')
const productRouter = express.Router()

const productController = require('../controllers/product')
const { authMiddleware } = require('../middlewares/auth')

productRouter.post('/',productController.add).use(authMiddleware)
productRouter.get('/',productController.get)
productRouter.get('/:id',productController.getOne)
productRouter.put('/:id',productController.edit).use(authMiddleware)
productRouter.delete('/:id',productController.delete).use(authMiddleware)


module.exports = productRouter