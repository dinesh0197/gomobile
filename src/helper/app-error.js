class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'Failure' : 'Error';
      // Set debug mode only on local environment
      this.isOperational = process.env.ENV_NAME === 'local' ? true : false;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  module.exports = AppError;