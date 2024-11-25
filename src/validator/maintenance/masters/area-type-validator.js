const { body } = require("express-validator");
const validate = require("../../validate");


module.exports.validateAreaType = validate([
    body("area_name")
        .isString()
        .not()
        .isEmpty()
        .trim()
        .withMessage("Area Name is required")    
]);