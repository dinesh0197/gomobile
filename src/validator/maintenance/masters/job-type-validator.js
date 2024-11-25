const { body } = require("express-validator");
const validate = require("../../validate");


module.exports.validateJobType = validate([
    body("job_type_name")
        .isString()
        .not()
        .isEmpty()
        .trim()
        .withMessage("JOb type name is required")    
]);