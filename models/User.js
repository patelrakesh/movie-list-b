const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please add an email"],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
    unique: true,
  },
  password: {
    type: String,
    minlength: [8, "Password should be 8 character long"],
    required: [true, "Please add a password"],
    select: false,
  },
});

UserSchema.methods.genAuthToken = function () {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIREIN,
    });
  };
  

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await enteredPassword === this.password;
};

module.exports = mongoose.model("User", UserSchema);

  