const { error } = require("../helper/api-response");

module.exports = (err, req, res, next) => {
  console.log({ err });
  err.statusCode = err?.statusCode || 500;
  err.status = err?.status || "Error";
  res.status(err?.statusCode || 500).json(error(err.message, err.status));
};
