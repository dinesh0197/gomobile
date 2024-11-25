const { error } = require('../helper/api-response');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Error';
  res.status(err.statusCode).json(error(err.message, err.status));
};