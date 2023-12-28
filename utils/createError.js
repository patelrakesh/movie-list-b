module.exports = (res, status, error) => {
  const errors = Object.values(error.errors).map(
    (error) => error.message
  );
  return res.status(status || 400).send({
    status: "Error",
    message: errors.join(", "),
  });
};
