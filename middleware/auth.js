const verifyToken = require("../utils/jwt");
const asyncHandler = require("./async");
const User = require("../models/User");

const protect = asyncHandler(async (req, res, next) => {
  const authorization = req.headers["authorization"];
  if (!(authorization && authorization.toLowerCase().startsWith("bearer"))) {
    return res.status(401).send({
      status: "Error",
      message: "Not authorized",
    });
  }
  const token = authorization.split(" ")[1];

  const decodeToken = verifyToken(token, process.env.JWT_SECRET);

  req.user = await User.findById(decodeToken._id);

  next();
});

const permission = (role) => (req, res, next) => {
  // if (role !== req.user.role)
  //     401,
  //     `User role ${req.user.role} is not allowed to access this resource`
  //   );

  next();
};
module.exports = { protect, permission };
