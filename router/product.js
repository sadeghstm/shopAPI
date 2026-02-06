const express = require('express')
const productRouter = express.Router()

const productController = require('../controllers/product')

productRouter.post('/',productController.add)
productRouter.get('/',productController.get)
productRouter.put('/:id',productController.edit)
productRouter.delete('/:id',productController.delete)


module.exports = productRouter