const { body } = require("express-validator");
const validate = require("./validate");


module.exports.validateCreateUser = validate([
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
    body('phoneNumber').optional().notEmpty().withMessage('Phone number cannot be empty'),
  ]);
  module.exports.validateUpdateUser = validate([
    body('firstName').optional().notEmpty().withMessage('First name is required if provided'),
    body('lastName').optional().notEmpty().withMessage('Last name is required if provided'),
    body('mobileNo').optional().notEmpty().withMessage('Mobile number is required if provided'),
    body('email').optional().isEmail().withMessage('A valid email is required if provided'),
]);
  module.exports.validateVerifyToken = validate([
    body("token")
    .isString()
    .not()
    .isEmpty()
    .trim()
    .withMessage("Token is required"),
  ]);  
  
  module.exports.validateUpdatePasswordRequest = validate([
    body("token")
      .isString()
      .not()
      .isEmpty()
      .trim()
      .withMessage("Token is required"),
    body("password")
      .isString()
      .not()
      .isEmpty()
      .trim()
      .withMessage("Password is required")
      .isLength({ min: 8, max: 20 })
      .withMessage(
        "Password should contain atleast 8 and less than 20 Characters"
      )
      .matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$/)
      .withMessage(
        "Password should contain atleast one lowercase, one uppercase, one numeric and one special character only"
      ),
    body("confirmPassword")
      .isString()
      .not()
      .isEmpty()
      .trim()
      .withMessage("Confirm password is required")
      .custom((value, { req }) => {
        if (req.body.password !== "") {
          if (value !== req.body.password)
            throw new Error("Password and confirm password are not matched");
        }
  
        return true;
      }),
  ]);

  module.exports.validateLoginRequest = validate([
    body("email")
      .isString()
      .not()
      .isEmpty()
      .trim()
      .withMessage("Email is required"),
    body("password")
      .isString()
      .not()
      .isEmpty()
      .trim()
      .withMessage("Password is required"),
  ]);
  module.exports.validatePasswordUpdate = validate([
    body("password")
      .isString()
      .not()
      .isEmpty()
      .trim()
      .withMessage("Password is required"),
  ]);

  module.exports.validatePassword = validate([
    body("email")
      .isString()
      .not()
      .isEmpty()
      .trim()
      .withMessage("Email is required"),
    body("token")
      .isString()
      .not()
      .isEmpty()
      .trim()
      .withMessage("Token is required"),
    body("password")
      .isString()
      .not()
      .isEmpty()
      .trim()
      .withMessage("Password is required"),
  ]);

  module.exports.validateForgotPassword = validate([
    body("email")
      .isString()
      .not()
      .isEmpty()
      .trim()
      .withMessage("Email is required"),    
  ]);
  module.exports.validateVerifyOTPEmail = validate([
    body("email")
      .isString()
      .not()
      .isEmpty()
      .trim()
      .withMessage("Email is required"),
    body("otp")
      .isString()
      .not()
      .isEmpty()
      .trim()
      .withMessage("OTP is required"),
  ]);

  module.exports.validateResetPasswordRequest = validate([
    body("token")
      .isString()
      .not()
      .isEmpty()
      .trim()
      .withMessage("Token is required"),
    body("password")
      .isString()
      .not()
      .isEmpty()
      .trim()
      .withMessage("Password is required")
      .isLength({ min: 8, max: 20 })
      .withMessage(
        "Password should contain atleast 8 and less than 20 Characters"
      )
      .matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$/)
      .withMessage(
        "Password should contain atleast one lowercase, one uppercase, one numeric and one special character only"
      )
  ]);

  module.exports.validateChangePasswordRequest = validate([    
    body("password")
      .isString()
      .not()
      .isEmpty()
      .trim()
      .withMessage("Password is required")
      .isLength({ min: 8, max: 20 })
      .withMessage(
        "Password should contain atleast 8 and less than 20 Characters"
      )
      .matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$/)
      .withMessage(
        "Password should contain atleast one lowercase, one uppercase, one numeric and one special character only"
      ),
    body("confirmPassword")
      .isString()
      .not()
      .isEmpty()
      .trim()
      .withMessage("Confirm password is required")
      .custom((value, { req }) => {
        if (req.body.password !== "") {
          if (value !== req.body.password)
            throw new Error("Password and confirm password are not matched");
        }
  
        return true;
      }),
  ]);
