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
} = require("../controller/order-controller");
const { authenticateUser } = require("../jwtStrategy/JwtStrategy");

const orderRouter = new express.Router();

orderRouter.get("/orders", authenticateUser, getAllOrderList);
orderRouter.get("/:id", authenticateUser, getOrderById);

orderRouter.post("/create", createNewOrder);
orderRouter.put("/update/:id", updateOrder);

module.exports = orderRouter;
