const createError = require("../utils/createError");
const asyncHandler = require("../middleware/async");
const Movie = require("../models/Movie");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "posters",
    allowed_formats: ["jpg", "png", "webm", "svg", "webp"],
  },
});

const upload = multer({ storage }).fields([
  { name: "poster", maxCount: 1 },
  { name: "title" },
  { name: "publishYear" },
]);

// const create = asyncHandler(async (req, res, next) => {
//   try {
//     upload(req, res, async function (err) {
//       if (err) {
//         return next(createError(err.status || 400, err.message));
//       }

//       // Check if no photo is uploaded
//       if (!req.files || !req.files.poster) {
//         return res.status(400).send({
//           status: "Error",
//           message: "Please add a photo",
//         });
//       }

//       const { title, publishYear } = req.body;
//       const file = req.files.poster[0];

//       // Assuming you have a synchronous function to handle file uploads locally
//       const imagePath = handleLocalFileUpload(file);

//       const movie = await Movie.create({
//         title,
//         publishYear,
//         poster: imagePath,
//       });
//       res.status(200).send({
//         status: "Success",
//         message: "Movie added successfully",
//         data: movie,
//       });
//     });
//   } catch (error) {
//     next(error);
//   }
// });

const create = asyncHandler(async (req, res, next) => {
  upload(req, res, async function (err) {
    if (!req.files) {
      return res.status(400).send({
        status: "Validation Error",
        message: "Please add a photo",
      });
    }

    const { title, publishYear } = req.body;
    const file = req.files.poster[0];

    cloudinary.uploader.upload(
      file.path,
      { use_filename: true, folder: "posters" },
      async function (error, result) {
        if (error) {
          return res.status(409).send({
            status: "Error",
            message: "Failed to create movie",
          });
        }
        try {
          const movie = await Movie.create({
            title,
            publishYear,
            poster: result.url,
          });
          res.status(200).send({
            status: "Success",
            message: "Movie created successfully",
            data: movie,
          });
        } catch (validationError) {
          return createError(res, 400, validationError);
        }
      }
    );
  });
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
  upload(req, res, async function (err) {
    if (err) {
      return res.status(err.status || 400).send({
        status: "Error",
        message: err.message,
      });
    }
    const { title, publishYear } = req.body;
    const movieId = req.params.id;
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(400).send({
        status: "Error",
        message: "Movie not found",
      });
    }
    let posterUrl = movie.poster;
    if (req.files && req.files.poster) {
      const file = req.files.poster[0];
      cloudinary.uploader.upload(
        file.path,
        { use_filename: true, folder: "posters" },
        async function (error, result) {
          if (error) throw createError(409, `Failed to update movie`);
          posterUrl = result.url;
          movie.title = title || movie.title;
          movie.publishYear = publishYear || movie.publishYear;
          movie.poster = posterUrl;
          await movie.save();
          res.status(200).json({
            status: "Success",
            message: "Movie updated successfully",
            data: movie,
          });
        }
      );
    } else {
      movie.title = title || movie.title;
      movie.publishYear = publishYear || movie.publishYear;
      await movie.save();
      res.status(200).json({
        status: "Success",
        message: "Movie details updated successfully",
        data: movie,
      });
    }
  });
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
