const { redisClient } = require("../redisHelper/redisConnection");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "please login first",
      });
    }

    const userId = parseInt(await redisClient.getUserByToken(token));

    if (!userId) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }
    req.user = {
      userId,
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