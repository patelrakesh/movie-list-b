const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
require("colors");
const { unknownEndpoints, errorHandler } = require("./middleware/error");
const connectDb = require("./config/db");
const path = require('path');
const app = express();

dotenv.config({ path: "./config/config.env" });

connectDb();

const authRouter = require("./routes/auth");
const movieRouter = require("./routes/movie");

app.use(express.json());

app.use(cors());

app.use("/api/auth", authRouter);
app.use("/api/movie", movieRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get("/", (req, res) => {
  res.send("API is running....");
});
app.use(unknownEndpoints);
app.use(errorHandler)
const PORT = process.env.PORT;

const server = app.listen(
  PORT,
  console.log(
    `Server running on port ${PORT}`.yellow.bold
  )
);

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red.bold);
  //close the server
  server.close(() => process.exit(1));
});
