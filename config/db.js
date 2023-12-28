const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log(
    `Mongo database connected on ${process.env.MONGO_URI}`.cyan.underline.bold
  );
};

module.exports = connectDB;
