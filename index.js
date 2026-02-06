const express = require('express');
const app = express();

const cookieParser = require('cookie-parser')
app.use(cookieParser())


const userRouter = require('./router/user')
const productRouter = require('./router/product')
const cartRouter = require('./router/cart')
const authenticationRouter = require('./router/authentication')
const walletRouter = require('./router/wallet')
const operationsRouter = require('./router/operations')

require('dotenv').config();

app.use(express.json());

app.use('/api/user',userRouter)
app.use('/api/product',productRouter)
app.use('/api/cart',cartRouter)
app.use('/api/auth',authenticationRouter)
app.use('/api/wallet',walletRouter)
app.use('/api/operations',operationsRouter)

app.listen(process.env.PORT, () => console.log('Server running on Port:', process.env.PORT));
