const express = require("express");
const { error, success } = require("../helper/api-response");
const User = require("../model/user-model");
const {
  getViewUser,
  getAllUSerLists,
  deleteUser,
  updateUser,
  getRoleBasedUserLists,
  dashBoardDetail,
  userDetails,
  userUpdatePassword,
  changePasswordRequest,
} = require("../controller/user-controller");
const {
  validateCreateUser,
  validatePasswordUpdate,
  validatePassword,
  validateChangePasswordRequest,
} = require("../validator/auth-validator");
const { authenticateUser } = require("../jwtStrategy/JwtStrategy");

const userRouter = new express.Router();
userRouter.use(authenticateUser);

userRouter.get("/user", userDetails);
userRouter.get("/dashboard", dashBoardDetail);
userRouter.param("id", async function (req, res, next) {
  const { id } = req.params;
  const user = await User.findOne({ where: { id: id } });
  if (user) {
    req.user = user;
    next();
  } else {
    return res.status(404).json(error("No user found", res.statusCode));
  }
});
userRouter.get("/:id", getViewUser);
userRouter.post("/getUser", getAllUSerLists);
userRouter.delete("/:id", deleteUser);
userRouter.put("/:id", validateCreateUser, updateUser);
userRouter.post("/roleUsers", getRoleBasedUserLists);
userRouter.post(
  "/userUpdatePassword",
  validatePasswordUpdate,
  userUpdatePassword
);
userRouter.post(
  "/changePassword",
  validateChangePasswordRequest,
  changePasswordRequest
);

module.exports = userRouter;
