const createError = require("../utils/createError");
const asyncHandler = require("../middleware/async");
const Movie = require("../models/Movie");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Specify the directory where images will be stored locally
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedFormats = ["jpg", "jpeg", "png", "webm", "svg"];
    const extname = path.extname(file.originalname).toLowerCase();
    if (allowedFormats.includes(extname.substring(1))) {
      cb(null, true);
    } else {
      cb(createError(400, "Invalid file format"));
    }
  },
}).fields([
  { name: "poster", maxCount: 1 },
  { name: "title" },
  { name: "publishYear" },
]);

const handleLocalFileUpload = (file) => {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const imagePath = `uploads/${file.fieldname}-${uniqueSuffix}${path.extname(
    file.originalname
  )}`;
  // You might want to move the file or perform additional operations here
  const destination = path.join(__dirname, "..", imagePath); // Adjust the destination path as needed
  fs.renameSync(file.path, destination); // Move the file to the destination
  return imagePath;
};

const create = asyncHandler(async (req, res, next) => {
  try {
    upload(req, res, async function (err) {
      if (err) {
        return next(createError(err.status || 400, err.message));
      }

      // Check if no photo is uploaded
      if (!req.files || !req.files.poster) {
        return res.status(400).send({
          status: "Error",
          message: "Please add a photo",
        });
      }

      const { title, publishYear } = req.body;
      const file = req.files.poster[0];

      // Assuming you have a synchronous function to handle file uploads locally
      const imagePath = handleLocalFileUpload(file);

      const movie = await Movie.create({
        title,
        publishYear,
        poster: imagePath,
      });
      res.status(200).send({
        status: "Success",
        message: "Movie added successfully",
        data: movie,
      });
    });
  } catch (error) {
    next(error);
  }
});

const getAll = asyncHandler(async (req, res, next) => {
  res.status(200).send({ status: "success", data: res.data });
});

const getById = asyncHandler(async (req, res, next) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie)
    throw createError(404, `Movie is not found with id of ${req.params.id}`);

  res.status(200).send({ status: "success", data: movie });
});

const editMovie = asyncHandler(async (req, res, next) => {
  try {
    upload(req, res, async function (err) {
      if (err) {
        return next(createError(err.status || 400, err.message));
      }

      const { title, publishYear } = req.body;

      const movieId = req.params.id; // Assuming you have the movie ID in the request params

      const movie = await Movie.findById(movieId);

      if (!movie) {
        throw createError(404, "Movie not found");
      }

      let posterPath = movie.poster;

      if (req.file) {
        const file = req.file;
        posterPath = handleLocalFileUpload(file);
      }

      movie.title = title || movie.title;
      movie.publishYear = publishYear || movie.publishYear;
      movie.poster = posterPath;

      await movie.save();

      res.status(200).json({
        status: "Success",
        message: "Movie updated successfully",
        data: movie,
      });
    });
  } catch (error) {
    next(error);
  }
});

const deleteMovie = asyncHandler(async (req, res, next) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie)
    throw createError(404, `Movie is not found with id of ${req.params.id}`);

  await movie.deleteOne();
  res
    .status(200)
    .send({ status: "success", message: "Movie Deleted Successfully" });
});

module.exports = {
  create,
  getAll,
  getById,
  editMovie,
  deleteMovie,
};
