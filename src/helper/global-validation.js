const { body } = require("express-validator");
const validate = require("../validators/validate");
const mongoose = require("mongoose");

exports.getListValidation = validate([
  body("page")
    .notEmpty()
    .withMessage("Page number is required")
    .escape()
    .trim()
    .isNumeric()
    .withMessage("Page number is invalid"),
  body("limit")
    .notEmpty()
    .withMessage("Limit field is required")
    .escape()
    .trim()
    .isNumeric()
    .withMessage("Limit field is invalid"),
]);

exports.emailValidation = (value) => {
  const checkSpecialValue = /[ `!#$%^&*()_\=\[\]{};':"\\|,<>\/?~]/;
  const firstAndLastPosition = /[ `+.-]/;
  const position = value.indexOf("@");
  if (
    checkSpecialValue.test(value.substring(0, position)) ||
    firstAndLastPosition.test(value.substring(position, position - 1)) ||
    firstAndLastPosition.test(value.substring(0, 1))
  )
    return Promise.reject("Enter the valid email address");
  return true;
};

exports.isValidUrl = (url) => {
  var urlPattern = new RegExp(
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi
  ); // validate fragment locator
  return !urlPattern.test(url);
};

exports.objectIdValidation = async (modal, id) => {
  let response = {
    status : false,
    message: 'notFound',
    data: null
  };
  if (!mongoose.Types.ObjectId.isValid(id)) {
    response.message = 'invalid';
    return response;
  }

  const modalObject = await modal.findOne({ _id: id });
  if (modalObject) {
    response.status = true;
    response.message = 'Success';
    response.data = modalObject;
  }

  return response;
};
