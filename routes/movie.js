const {
  create,
  getAll,
  getById,
  editMovie,
  deleteMovie,
} = require("../controller/movie");
const router = require("express").Router();
const advanceResults = require("../middleware/advanceResults");
const Movie = require("../models/Movie");

router.route("/").post(create).get(advanceResults(Movie), getAll);
router.route("/:id").get(getById).put(editMovie).delete(deleteMovie);
module.exports = router;
