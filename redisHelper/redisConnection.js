const { randomUUID } = require("crypto");
require('dotenv').config()
const redis = require("redis")

const clientMaker = async (dbNumber, url) => {
    const client = redis.createClient({
        url: url,
    });
    await client.connect();
    await client.select(dbNumber);
    console.log(`redis client${dbNumber} created`);
    
    return client;
};
let client2 = null;
let client3 = null;


(async () => {
    client2 = await clientMaker(2, process.env.REDIS_URL)
    client3 = await clientMaker(3, process.env.REDIS_URL)
})()


const redisClient = {
    async setToken(userId) {
        try {
            const token = randomUUID()
            await client2.hSet(token, {userId})
            return token
        } catch (error) {
            console.log(error);
        }
    },
    async getUserByToken(token){
        try {
            const userId = await client2.hGet(token,"userId")
            return userId
        } catch (error) {
            console.log(error);
            return null
        }
    },
    async tokenExists(token){
        const isExists = await client2.exists(token)
        if(isExists) return true
        return false
    },
    async delToken(token){
        try {
            const isExists = await client2.del(token)
        } catch (error) {
            console.log(error);         
        }
    },
     
    async addKey(phone, OTP) {
        try {
            await client3.hSet(`phone:${phone}`, {
                OTP
            })
            await client3.expire(`phone:${phone}`, 180)
        } catch (error) {
            console.error(error)
        }
    },
    async isOTPExists(phone) {
        try {
            const result = await client3.hGet(`phone:${phone}`, "OTP")
            console.log(result);

            if (result) return true
            else return false
        } catch (error) {
            console.error(error);
        }
    },
    async getCodeByPhone(phone) {
        try {
            const result = await client3.hGet(`phone:${phone}`, "OTP")
            if (result) return result
            else return false
        } catch (error) {
            console.error(error);
        }
    },
    async delCode(phone) {
        try {
            await client3.hDel(`phone:${phone}`,"OTP")        
        } catch (error) {
            console.error(error);
        }
    }

}
module.exports= redisClient