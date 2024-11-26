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
const { authenticateUser } = require("../jwtStrategy/JwtStrategy");
const { upload } = require("../helper/multer");
const orderRouter = new express.Router();

orderRouter.get("/orders", authenticateUser, getAllOrderList);
orderRouter.get("/:id", authenticateUser, getOrderById);

orderRouter.post("/create", createNewOrder);
orderRouter.put("/update/:id", updateOrder);

orderRouter.get("/status/:id", getOrderStatus);

orderRouter.get("/specialRequest/:id", updateSpecialRequest);

orderRouter.get(
  "/shippingLabel/:id",
  upload.single("invoice"),
  updateShippingLabel
);

module.exports = orderRouter;
