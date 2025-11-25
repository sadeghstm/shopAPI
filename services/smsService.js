
const Kavenegar = require('kavenegar')
const {otpStore} = require('../globalStore')
require('dotenv').config();



const SMS = Kavenegar.KavenegarApi({apikey:'4C6E694541636F4C584E33747253396B586542485A4854502B7A49777631754749536633387135662B79383D',
})

const sendOTP = (phone)=>{
    const otp = Math.floor(Math.random()*10000)
    SMS.Send({message:` فروشگاه آنلاین صادق \n کدتایید:${otp}`,receptor:phone,sender:"2000660110"},
        (res,status)=>{
        console.log(res);
        console.log(status); 
    })
    return otp.toString()
}
const sendSuccessfulAuthSMS = (phone,name)=>{
    SMS.Send({message:` سلام ${name}:) به پروژه فروشگاه آنلاین صادق خوش آمدید`,receptor:phone,sender:"2000660110"},
        (res,status)=>{
        console.log(res);
        console.log(status); 
    })
}
module.exports={
    sendOTP,
    sendSuccessfulAuthSMS

}
