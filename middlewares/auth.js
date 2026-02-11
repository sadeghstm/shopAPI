const  redisClient  = require("../redisHelper/redisConnection");

const authMiddleware = async (req, res, next) => {
  
  console.log(1);
  
  try {
    const token = req.cookies?.token;
    console.log(token);
    
    if (!token) {
      return res.status(401).json({
        message: "please login first",
      });
    }
    console.log(2);
    

    const id = await redisClient.getUserByToken(token);
    console.log(id);
    
    if (!id) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }
    req.user = {
      id,
      token,
    };
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = { authMiddleware };