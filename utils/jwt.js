const jwt = require("jsonwebtoken");

const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    if (error.name === "TokenExpiredError")
      return res.status(401).send({
        status: "Error",
        message: "Token is expired. Please Login",
      });

    throw error;
  }
};

module.exports = verifyToken;
