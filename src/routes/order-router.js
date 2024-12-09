const express = require("express");
const {
  validateCreateOrder,
  validateUpdateOrder,
} = require("../validator/order-validator");
const {
  createNewOrder,
  updateOrder,
  updateOrderStatus,
  getViewOrder,
  getAllOrderList,
  deleteOrder,
  getOrderByZipcode,
  getOrderById,
  getOrderStatus,
  updateShippingLabel,
  updateSpecialRequest,
} = require("../controller/order-controller");
const {
  authenticateUser,
  authenticateSuppliers,
} = require("../jwtStrategy/JwtStrategy");
const { upload } = require("../helper/multer");
const orderRouter = new express.Router();

orderRouter.get("/orders", authenticateUser, getAllOrderList);
orderRouter.get("/:id", authenticateUser, getOrderById);

orderRouter.post("/create", authenticateSuppliers, createNewOrder);
orderRouter.put("/update/:id", updateOrder);

orderRouter.get("/status/:id", authenticateSuppliers, getOrderStatus);

orderRouter.patch(
  "/specialRequest/:id",
  authenticateSuppliers,
  updateSpecialRequest
);

orderRouter.patch(
  "/shippingLabel/:id",
  authenticateSuppliers,
  upload.single("invoice"),
  updateShippingLabel
);

module.exports = orderRouter;
