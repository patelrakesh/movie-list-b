const mongoose = require("mongoose");

const MovieSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  title:{
    type: String,
    required: [true, "Movie name is required"],
    trim: true,
  },
  poster: {
    type: String,
    required: [true, "Poster is required"],
  },
  publishYear: {
    type: Number,
    required: [true, "Publish year is required"],
  },
});

module.exports = mongoose.model("Movie", MovieSchema);
