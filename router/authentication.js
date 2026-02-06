const express = require('express')
const authenticationRouter = express.Router()

const authController = require('../controllers/authentication')

authenticationRouter.post('/send-otp',authController.sendOTP )
authenticationRouter.post('/verify',authController.verification )
authenticationRouter.post('/loginWithUserPass',authController.verificationUserPass )
authenticationRouter.post('/logout',authController.logOut )

module.exports = authenticationRouter