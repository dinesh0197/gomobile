const { validationResult } = require("express-validator");
const { validation } = require("../helper/api-response");

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));
      const errors = validationResult(req);
      if (errors.isEmpty()) {
          return next();  
      }
      const errorsArr = errors.array({ onlyFirstError: true });
      res.status(400).json(validation(errorsArr));
    };
};

module.exports = validate;
