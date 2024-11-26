const express = require("express");
const {
  validateCreateUser,
  validateUpdateUser,
  validateVerifyOTPEmail,
  validateResetPasswordRequest,
  validateLoginRequest,
  validateForgotPassword,
} = require("../validator/auth-validator");
const {
  getAllUsers,
  getUserById,
  createRequest,
  updateUser,
  verifyOTPwithToEmail,
  resetPasswordRequest,
  getLoginRequest,
  sendOTPwithToEmail,
} = require("../controller/auth-controller");
const {
  authenticateUser,
  authenticateUserConditional,
} = require("../jwtStrategy/JwtStrategy");

const authRouter = new express.Router();
// authRouter.use(authenticateUser);

authRouter.get("/users", authenticateUserConditional, getAllUsers);
authRouter.get("/profile", authenticateUserConditional, getUserProfile);
authRouter.get("/user/:id", authenticateUserConditional, getUserById);
authRouter.post("/create-user", createRequest);
// authRouter.post('/create-user', validateCreateUser, createRequest);
// authRouter.put('/update-user/:id', validateUpdateUser, updateUser);
authRouter.put("/update-user/:id", updateUser);

authRouter.post("/login", validateLoginRequest, getLoginRequest);
authRouter.post("/forgotPassword", validateForgotPassword, sendOTPwithToEmail);
authRouter.post(
  "/verify-otp/email",
  validateVerifyOTPEmail,
  verifyOTPwithToEmail
);
authRouter.post(
  "/reset-password",
  validateResetPasswordRequest,
  resetPasswordRequest
);

module.exports = authRouter;
