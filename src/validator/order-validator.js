const { body } = require("express-validator");
const validate = require("./validate");

const orderValidation = [
  body("internalOrderId").notEmpty().withMessage("Internal Order ID is required"),
  body("customerOrderNumber").notEmpty().withMessage("Customer Order Number is required"),
  body("assignedFranchiseId").notEmpty().withMessage("Assigned Franchise ID is required"),
  body("orderDate").notEmpty().isDate().withMessage("Order Date must be a valid date"),
  body("orderTotal").isFloat().withMessage("Order Total should be a valid number"),
  body("status").notEmpty().withMessage("Order Status is required"),
  body("esd").optional().isDate().withMessage("Expected Shipping Date must be a valid date"),
  body("specialRequest").optional().isString().withMessage("Special Request should be a string"),
  body("requestedShippingLabel").optional().isBoolean().withMessage("Requested Shipping Label must be a boolean"),
  body("customerId").notEmpty().withMessage("Customer ID is required"),
  body("masterTrackingNumber").optional().isString().withMessage("Master Tracking Number should be a string"),
  body("createdBy").notEmpty().withMessage("Created By is required"),
  body("createdAt").notEmpty().isDate().withMessage("Created At must be a valid date"),
  body("updatedBy").optional().isString().withMessage("Updated By should be a string"),
  body("updatedAt").optional().isDate().withMessage("Updated At must be a valid date"),
  body("deletedBy").optional().isString().withMessage("Deleted By should be a string"),
  body("deletedAt").optional().isDate().withMessage("Deleted At must be a valid date"),
];

const shippingAddressValidation = [
  body("orderId").notEmpty().withMessage("Order ID is required"),
  body("firstName").notEmpty().withMessage("First Name is required"),
  body("lastName").notEmpty().withMessage("Last Name is required"),
  body("email").optional().isEmail().withMessage("Valid email is required"),
  body("phone").optional().isString().withMessage("Phone should be a valid string"),
  body("address1").notEmpty().withMessage("Address 1 is required"),
  body("address2").optional().isString().withMessage("Address 2 should be a string"),
  body("shippingCarrier").optional().isString().withMessage("Shipping Carrier should be a string"),
  body("shippingMethod").optional().isString().withMessage("Shipping Method should be a string"),
];

const billingAddressValidation = [
  body("orderId").notEmpty().withMessage("Order ID is required"),
  body("street").notEmpty().withMessage("Street is required"),
  body("city").notEmpty().withMessage("City is required"),
  body("state").notEmpty().withMessage("State is required"),
  body("zipCode").notEmpty().withMessage("Zip Code is required"),
];

const warehouseAddressValidation = [
  body("orderId").notEmpty().withMessage("Order ID is required"),
  body("street").notEmpty().withMessage("Street is required"),
  body("city").notEmpty().withMessage("City is required"),
  body("state").notEmpty().withMessage("State is required"),
  body("zipCode").notEmpty().withMessage("Zip Code is required"),
];

const vehicleInfoValidation = [
  body("orderId").notEmpty().withMessage("Order ID is required"),
  body("vin").notEmpty().withMessage("VIN is required"),
  body("make").notEmpty().withMessage("Make is required"),
  body("model").notEmpty().withMessage("Model is required"),
  body("year").notEmpty().isInt().withMessage("Year must be a valid number"),
];

const productItemValidation = [
  body("orderId").notEmpty().withMessage("Order ID is required"),
  body("cartIdSku").notEmpty().withMessage("Cart ID SKU is required"),
  body("brand").notEmpty().withMessage("Brand is required"),
  body("vpn").optional().isString().withMessage("VPN should be a string"),
  body("description").optional().isString().withMessage("Description should be a string"),
  body("orderQty").isInt().withMessage("Order Quantity should be a number"),
  body("price").isFloat().withMessage("Price should be a valid number"),
  body("status").optional().isString().withMessage("Status should be a string"),
  body("trackingNumber").optional().isString().withMessage("Tracking Number should be a string"),
  body("shippingCarrier").optional().isString().withMessage("Shipping Carrier should be a string"),
  body("shippingMethod").optional().isString().withMessage("Shipping Method should be a string"),
];

const serviceItemValidation = [
  body("orderId").notEmpty().withMessage("Order ID is required"),
  body("cartIdSku").notEmpty().withMessage("Cart ID SKU is required"),
  body("description").optional().isString().withMessage("Description should be a string"),
  body("quantity").isInt().withMessage("Quantity should be a valid number"),
  body("price").isFloat().withMessage("Price should be a valid number"),
];

const shippingLabelValidation = [
  body("orderId").notEmpty().withMessage("Order ID is required"),
  body("userId").notEmpty().withMessage("User ID is required"),
  body("requestedDate").optional().isDate().withMessage("Requested Date must be a valid date"),
  body("requestComment").optional().isString().withMessage("Request Comment should be a string"),
  body("filePath").optional().isString().withMessage("File Path should be a string"),
  body("updatedDate").optional().isDate().withMessage("Updated Date must be a valid date"),
  body("responseComment").optional().isString().withMessage("Response Comment should be a string"),
];

module.exports.validateCreateOrder = validate([
  ...orderValidation,
  ...shippingAddressValidation,
  ...billingAddressValidation,
  ...warehouseAddressValidation,
  ...vehicleInfoValidation,
  ...productItemValidation,
  ...serviceItemValidation,
  ...shippingLabelValidation,
]);

module.exports.validateUpdateOrder = validate([
  ...orderValidation,
  ...shippingAddressValidation,
  ...billingAddressValidation,
  ...warehouseAddressValidation,
  ...vehicleInfoValidation,
  ...productItemValidation,
  ...serviceItemValidation,
  ...shippingLabelValidation,
]);
