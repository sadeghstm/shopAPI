
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient
const smsService = require('../services/smsService')

const redisClient  = require('../redisHelper/redisConnection')


const { errorResponse, successResponse } = require('../helpers/response')
const { randomUUID } = require('crypto')

const sentPhones = []

exports.sendOTP = async (req, res) => {
    try {
        const { phone } = req.body

        const isOTPExists = await redisClient.isOTPExists(phone)

        if (isOTPExists) {
            errorResponse(res, 400, "code already sent to your number!", {})
        }

        const otp = smsService.sendOTP(phone)

        await redisClient.addKey(phone, otp)

        successResponse(res, 200, "SMS request sent to the API.", {})
    } catch (error) {
        console.error(error.message);
        res.json({ message: "message failed to send!" })
    }
}

exports.verification = async (req, res) => {
    const { phone, code } = req.body

    const cookieToken = req.cookies.token
    if (cookieToken) {
        const tokenExists = await redisClient.tokenExists(cookieToken)
        if (tokenExists) {
            return res.send({ message: "already logged in!" })
        }
    }
    const redisCode = await redisClient.getCodeByPhone(phone)

    if (code != redisCode)
        return res.status(400).json({ message: "wrong code!" })
    await redisClient.delCode(phone)

    // if (data.expireAt < Date.now())
    //     return res.status(400).json({ message: "code has been expired." })
    // if (data.code != code)
    //     return res.status(400).json("Invalid Code!")

    const foundUser = await prisma.user.findFirst({
        where: { phone },
        select: { username: true, id: true }
    })

    if (foundUser) {
        const token = await redisClient.setToken(foundUser.id)
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        })
        // smsService.sendSuccessfulAuthSMS(phone, foundUser.username)
        console.log(foundUser.username);
        return res.json({ message: "login successful :)" })
    }
    errorResponse(res, 500, "verification failed!", {})
    // res.json({ message: "Verification Successful!" })
}

exports.verificationUserPass = async (req, res) => {

    const { username, password } = req.body

    // const cookieHeader = req.header
    const cookieToken = req.cookies.token
    console.log(cookieToken);

    if (cookieToken) {
        const tokenExists = await redisClient.tokenExists(cookieToken)
        if (tokenExists) {
            return res.send({ message: "already logged in!" })
        }
    }

    const user = await prisma.user.findFirst({
        where: {
            password,
            username
        }
    })

    if (user) {
        const token = await redisClient.setToken(user.id)
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        })
        return res.json({ message: "login successful :)" })
    }
    res.send({ message: "username/password is incorrect" }).status(403)
}


exports.logOut = async (req, res) => {

    try {
        const token = req.cookies?.token
        await redisClient.delToken(token)


        res.cookie("token", "", {
            httpOnly: true,
            maxAge: 0,
            path: '/'
        })
        return successResponse(res, 200, "logout successful :)", {})
    } catch (error) {
        return errorResponse(res, 500, "couldn\'t log out!", {})
    }

}