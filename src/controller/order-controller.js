const { success, error } = require("../helper/api-response");
const catchAsync = require("../helper/catch-async");
const { Op, where, col, fn } = require("sequelize");
const Order = require("../model/order-model");
const ShippingAddress = require("../model/shipping-address-model");
const BillingAddress = require("../model/billing-address-model");
const WarehouseAddress = require("../model/warehouse-address-model");
const VehicleInfo = require("../model/vehicle-info-model");
const ProductItem = require("../model/product-item-model");
const ServiceItem = require("../model/service-item-model");
const ShippingLabel = require("../model/shipping-label-model");

const { getCommonValuesFromObject } = require("../helper/constants");
const { excludeAudits } = require("../helper/sequelize");
const User = require("../model/user-model");
const { UploadShippingLabelNotification } = require("../helper/send-email");

const orderColNames = [
  "id",
  "internalOrderId",
  "customerOrderNumber",
  "orderDate",
  "orderTotal",
  "status",
  "esd",
  "specialRequest",
  "requestedShippingLabel",
  "customerId",
  "masterTrackingNumber",
  "assignedFranchiseId",
  "createdBy",
  "createdAt",
  "updatedBy",
  "updatedAt",
  "deletedBy",
  "deletedAt",
];

const shippingAddressColNames = [
  "id",
  "orderId",
  "firstName",
  "lastName",
  "email",
  "phone",
  "address1",
  "address2",
  "shippingCarrier",
  "shippingMethod",
];

const billingAddressColNames = [
  "id",
  "orderId",
  "street",
  "city",
  "state",
  "zipCode",
];

const warehouseAddressColNames = [
  "id",
  "orderId",
  "street",
  "city",
  "state",
  "zipCode",
];

const vehicleInfoColNames = ["id", "orderId", "make", "model", "year"];

const productItemColNames = [
  "id",
  "orderId",
  "caridSKU",
  "brand",
  "vpn",
  "description",
  "orderQty",
  "price",
  "status",
  "trackingNumber",
  "shippingCarrier",
  "shippingMethod",
];

const serviceItemColNames = [
  "id",
  "orderId",
  "cartIdSku",
  "description",
  "quantity",
  "price",
];

const shippingLabelColNames = [
  "id",
  "orderId",
  "userId",
  "requestedDate",
  "requestComment",
  "filePath",
  "updatedDate",
  "responseComment",
];

const createNewOrder = catchAsync(async (req, res) => {
  const {
    orderInfo,
    items: { productItems, serviceItems },
    orderTotal,
  } = req.body;

  const supplierId = req.headers["x-auth-token"];
  console.log({ supplierId });

  if (!supplierId)
    return res.status(400).json({ error: "x-auth-token is necessaary" });

  const transaction = await Order.sequelize.transaction();

  try {
    const customerOrderNumber = orderInfo.orderNumber;
    const internalOrderId = `ORD${Math.floor(
      Math.random() * 900000000 + 100000000
    )}`;

    // Prepare and create Order
    const orderPayload = {
      ...getCommonValuesFromObject(orderInfo, orderColNames),
      customerOrderNumber,
      internalOrderId,
      orderTotal,
      status: "Ordered",
      assignedFranchiseId: orderInfo.franchiseId,
      createdBy: supplierId,
    };

    const orderData = await Order.create(orderPayload, { transaction });

    // Create Shipping Address if available
    if (orderInfo.shippingAddress) {
      const shippingPayload = getCommonValuesFromObject(
        orderInfo.shippingAddress,
        shippingAddressColNames
      );
      await ShippingAddress.create(
        {
          orderId: orderData.id,
          ...shippingPayload,
        },
        { transaction }
      );
    }

    // Create Billing Address if available
    if (orderInfo.billingAddress) {
      const billingPayload = getCommonValuesFromObject(
        orderInfo.billingAddress,
        billingAddressColNames
      );
      await BillingAddress.create(
        {
          orderId: orderData.id,
          ...billingPayload,
        },
        { transaction }
      );
    }

    // Create Warehouse Address if available
    if (orderInfo.warehouseLocationAddress) {
      const warehousePayload = getCommonValuesFromObject(
        orderInfo.warehouseLocationAddress,
        warehouseAddressColNames
      );
      await WarehouseAddress.create(
        {
          orderId: orderData.id,
          ...warehousePayload,
        },
        { transaction }
      );
    }

    // Create Vehicle Info if available
    if (orderInfo.vehicleInfo) {
      const vehiclePayload = getCommonValuesFromObject(
        orderInfo.vehicleInfo,
        vehicleInfoColNames
      );
      await VehicleInfo.create(
        {
          orderId: orderData.id,
          ...vehiclePayload,
        },
        { transaction }
      );
    }

    // Create Vehicle Info if available
    if (orderInfo.shippingLabel) {
      const shippingLabelPayload = getCommonValuesFromObject(
        orderInfo.shippingLabel,
        shippingLabelColNames
      );
      await ShippingLabel.create(
        {
          orderId: orderData.id,
          ...shippingLabelPayload,
        },
        { transaction }
      );
    }

    // Create Product Items
    for (let item of productItems) {
      const productPayload = getCommonValuesFromObject(
        item,
        productItemColNames
      );
      await ProductItem.create(
        {
          orderId: orderData.id,
          ...productPayload,
        },
        { transaction }
      );
    }

    // Create Service Items
    for (let item of serviceItems) {
      const servicePayload = getCommonValuesFromObject(
        item,
        serviceItemColNames
      );
      await ServiceItem.create(
        {
          orderId: orderData.id,
          ...servicePayload,
        },
        { transaction }
      );
    }

    // Commit the transaction
    await transaction.commit();
    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        customerOrderNumber,
        internalOrderId,
        status: "Created",
      },
    });
  } catch (err) {
    // Rollback the transaction in case of an error
    await transaction.rollback();
    return res
      .status(500)
      .json({ error: "Error creating order", details: err.message });
  }
});

const getAllOrderList = catchAsync(async (req, res) => {
  try {
    const {
      search,
      pageNo = 1,
      perPage = 10,
      status,
      orderDate,
      customerOrderNumber,
      franchise,
    } = req.query;
    const limit = parseInt(perPage, 10) || 10;
    const offset = (parseInt(pageNo, 10) - 1) * limit;

    const { role, id } = req.userInfo || {};
    let filter = {};

    if (role === "User") filter.assignedFranchiseId = id;

    if (status) filter.status = status;

    if (role === "Admin" && franchise) filter.assignedFranchiseId = franchise;

    if (orderDate) {
      const formattedDate = new Date(orderDate).toISOString().split("T")[0];
      filter.orderDate = where(fn("DATE", col("orderDate")), formattedDate);
    }

    if (customerOrderNumber)
      filter.customerOrderNumber = { [Op.like]: `%${customerOrderNumber}%` };

    let orderData;
    let totalCount;

    const searchConditions = search
      ? {
          [Op.or]: [
            { customerId: { [Op.like]: `%${search}%` } },
            { internalOrderId: { [Op.like]: `%${search}%` } },
            { customerOrderNumber: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const whereConditions = {
      [Op.and]: [filter, searchConditions],
    };

    // Fetch total count for the search criteria
    totalCount = await Order.count({ where: whereConditions });

    // Fetch paginated orders
    orderData = await Order.findAll({
      where: whereConditions,
      include: [
        {
          model: ShippingLabel,
          as: "shippingLabel",
        },
        {
          model: User,
          as: "franchise",
          attributes: ["franchise_code", "id", "operating_name"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json(
      success(
        "orders retrieved successfully",
        {
          data: orderData,
          totalCount,
          perPage: limit,
          pageNo: parseInt(pageNo, 10),
          totalPages,
        },
        res.statusCode
      )
    );
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", details: err.message });
  }
});

const getOrderById = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;

    const orderData = await Order.findOne({
      where: { id },
      attributes: { exclude: excludeAudits },
    });

    if (!orderData) {
      return res.status(404).json({ message: "Order not found" });
    }

    const shippingAddresses = await ShippingAddress.findAll({
      where: { orderId: id },
      attributes: { exclude: excludeAudits },
    });
    const billingAddress = await BillingAddress.findAll({
      where: { orderId: id },
      attributes: { exclude: excludeAudits },
    });

    const productItem = await ProductItem.findAll({
      where: { orderId: id },
      attributes: { exclude: excludeAudits },
    });
    const serviceItem = await ServiceItem.findAll({
      where: { orderId: id },
      attributes: { exclude: excludeAudits },
    });
    const shippingLabel = await ShippingLabel.findAll({
      where: { orderId: id },
      attributes: { exclude: excludeAudits },
    });
    const vehicleInfo = await VehicleInfo.findAll({
      where: { orderId: id },
      attributes: { exclude: excludeAudits },
    });

    const warehouseAddresses = await WarehouseAddress.findAll({
      where: { orderId: id },
      attributes: { exclude: excludeAudits },
    });

    const orderInfo = {
      ...orderData.dataValues,
      shippingAddresses,
      billingAddress,
      productItem,
      serviceItem,
      shippingLabel,
      vehicleInfo,
      warehouseAddresses,
    };
    return res.status(200).json({
      message: "Order fetched successfully",
      orderInfo,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", details: err.message });
  }
});

const updateOrder = catchAsync(async (req, res) => {
  const {
    order,
    shippingAddress,
    billingAddress,
    warehouseAddress,
    vehicleInfo,
    productItems,
    serviceItems,
    shippingLabel,
  } = req.body;

  const { id } = req.params;
  let finalStatus = "completed";
  const transaction = await Order.sequelize.transaction();

  try {
    // Find the existing order
    const orderData = await Order.findOne({
      where: { id },
      transaction,
    });
    if (!orderData) {
      return res.status(404).json(error("Order not found", res.statusCode));
    }

    // Update order data
    const orderPayload = getCommonValuesFromObject(order, orderColNames);
    await orderData.update(orderPayload, { transaction });

    // Update or insert Shipping Address
    if (shippingAddress) {
      const payload = getCommonValuesFromObject(
        shippingAddress,
        shippingAddressColNames
      );
      await ShippingAddress.upsert(
        {
          order_id: id,
          ...payload,
        },
        { transaction }
      );
    } else {
      finalStatus = "draft";
    }

    // Update or insert Billing Address
    if (billingAddress) {
      const payload = getCommonValuesFromObject(
        billingAddress,
        billingAddressColNames
      );
      await BillingAddress.upsert(
        {
          order_id: id,
          ...payload,
        },
        { transaction }
      );
    }

    // Update or insert Warehouse Address
    if (warehouseAddress) {
      const payload = getCommonValuesFromObject(
        warehouseAddress,
        warehouseAddressColNames
      );
      await WarehouseAddress.upsert(
        {
          order_id: id,
          ...payload,
        },
        { transaction }
      );
    }

    // Update or insert Vehicle Info
    if (vehicleInfo && Array.isArray(vehicleInfo)) {
      const existingVehicles = await VehicleInfo.findAll({
        where: { order_id: id },
        attributes: ["id"],
        transaction,
      });
      const existingVehicleIds = existingVehicles.map((vehicle) => vehicle.id);

      const incomingVehicleIds = vehicleInfo.map((vehicle) => vehicle.id);
      const idsToDelete = existingVehicleIds.filter(
        (id) => !incomingVehicleIds.includes(id)
      );
      if (idsToDelete.length) {
        await VehicleInfo.destroy({
          where: { id: idsToDelete },
          transaction,
        });
      }
      const payload = vehicleInfo.map((vehicle) =>
        getCommonValuesFromObject(vehicle, vehicleInfoColNames)
      );
      await Promise.all(
        payload.map((vehicle) =>
          VehicleInfo.upsert(
            {
              order_id: id,
              ...vehicle,
            },
            { transaction }
          )
        )
      );
    }

    // Update or insert Product Items
    if (productItems && Array.isArray(productItems)) {
      const existingProducts = await ProductItem.findAll({
        where: { order_id: id },
        attributes: ["id"],
        transaction,
      });
      const existingProductIds = existingProducts.map((product) => product.id);

      const incomingProductIds = productItems.map((item) => item.id);
      const idsToDelete = existingProductIds.filter(
        (id) => !incomingProductIds.includes(id)
      );
      if (idsToDelete.length) {
        await ProductItem.destroy({
          where: { id: idsToDelete },
          transaction,
        });
      }
      const payload = productItems.map((item) =>
        getCommonValuesFromObject(item, productItemColNames)
      );
      await Promise.all(
        payload.map((item) =>
          ProductItem.upsert(
            {
              order_id: id,
              ...item,
            },
            { transaction }
          )
        )
      );
    }

    // Update or insert Service Items
    if (serviceItems && Array.isArray(serviceItems)) {
      const existingServices = await ServiceItem.findAll({
        where: { order_id: id },
        attributes: ["id"],
        transaction,
      });
      const existingServiceIds = existingServices.map((service) => service.id);

      const incomingServiceIds = serviceItems.map((item) => item.id);
      const idsToDelete = existingServiceIds.filter(
        (id) => !incomingServiceIds.includes(id)
      );
      if (idsToDelete.length) {
        await ServiceItem.destroy({
          where: { id: idsToDelete },
          transaction,
        });
      }
      const payload = serviceItems.map((item) =>
        getCommonValuesFromObject(item, serviceItemColNames)
      );
      await Promise.all(
        payload.map((item) =>
          ServiceItem.upsert(
            {
              order_id: id,
              ...item,
            },
            { transaction }
          )
        )
      );
    }

    // Update or insert Shipping Label
    if (shippingLabel) {
      const payload = getCommonValuesFromObject(
        shippingLabel,
        shippingLabelColNames
      );
      await ShippingLabel.upsert(
        {
          order_id: id,
          ...payload,
        },
        { transaction }
      );
    }

    if (orderData.creationStatus !== "completed") {
      await orderData.update(
        { creationStatus: finalStatus },
        { transaction, silent: true }
      );
    }

    // Commit the transaction if successful
    await transaction.commit();
    return res
      .status(200)
      .json(
        success(
          "Order has been updated successfully",
          { data: orderData },
          res.statusCode
        )
      );
  } catch (e) {
    console.error({ e });
    await transaction.rollback();
    return res.status(400).json(error(e, res.statusCode));
  }
});

const getOrderStatus = catchAsync(async (req, res) => {
  try {
    const { id: internalOrderId } = req.params;

    const orderData = await Order.findOne({
      where: {
        internalOrderId: internalOrderId,
      },
      attributes: { exclude: excludeAudits },
    });

    if (!orderData) {
      return res.status(404).json({ message: "Order not found" });
    }

    const { id } = orderData;

    const shippingAddresses = await ShippingAddress.findAll({
      where: { orderId: id },
      attributes: { exclude: excludeAudits },
    });

    const billingAddress = await BillingAddress.findAll({
      where: { orderId: id },
      attributes: { exclude: excludeAudits },
    });

    const productItem = await ProductItem.findAll({
      where: { orderId: id },
      attributes: { exclude: excludeAudits },
    });
    const serviceItem = await ServiceItem.findAll({
      where: { orderId: id },
      attributes: { exclude: excludeAudits },
    });
    const shippingLabel = await ShippingLabel.findAll({
      where: { orderId: id },
      attributes: { exclude: excludeAudits },
    });
    const vehicleInfo = await VehicleInfo.findAll({
      where: { orderId: id },
      attributes: { exclude: excludeAudits },
    });

    const warehouseAddresses = await WarehouseAddress.findAll({
      where: { orderId: id },
      attributes: { exclude: excludeAudits },
    });

    const orderInfo = {
      ...orderData.dataValues,
      shippingAddresses,
      billingAddress,
      productItem,
      serviceItem,
      shippingLabel,
      vehicleInfo,
      warehouseAddresses,
    };
    return res.status(200).json({
      message: "Order fetched successfully",
      orderInfo,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", details: err.message });
  }
});

const updateSpecialRequest = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const { specialRequest } = req.body;

    await Order.update({ specialRequest }, { where: { internalOrderId: id } });

    // Fetch the updated record
    const updatedOrder = await Order.findOne({
      where: { internalOrderId: id },
      attributes: ["internalOrderId", "customerOrderNumber", "specialRequest"],
    });

    if (updatedOrder) {
      return res.status(200).json({
        internalOrderId: updatedOrder.internalOrderId,
        orderNumber: updatedOrder.customerOrderNumber,
        specialRequest: updatedOrder.specialRequest,
        message: "Special request updated successfully",
      });
    } else {
      return res.status(404).json({
        message: "Order not found or update failed",
      });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", details: err.message });
  }
});

const updateShippingLabel = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const { filename } = req.file || {};
    const { requestComment = "" } = req.body;

    if (!filename) {
      return res
        .status(400)
        .json({ message: "Shipping label file is required" });
    }

    const orderData = await Order.findOne({
      where: {
        internalOrderId: id,
      },
    });

    if (!orderData) {
      return res.status(404).json({ message: "Order not found" });
    }

    const [updatedRows] = await ShippingLabel.update(
      {
        filePath: filename,
        updatedDate: new Date(),
        requestComment: requestComment,
      },
      {
        where: {
          orderId: orderData.id,
        },
      }
    );

    if (updatedRows > 0) {
      const user = await User.findOne({
        where: { id: orderData.assignedFranchiseId },
      });

      const adminUsers = await User.findAll({ where: { role: "Admin" } });

      const adminEmails = adminUsers.map((user) => user.email);

      console.log({ data: [...adminEmails, user.email], filename });

      UploadShippingLabelNotification(
        [...adminEmails, user.email],
        orderData,
        filename
      );
      return res.status(200).json({
        message: "Shipping label updated successfully",
      });
    } else {
      return res.status(404).json({
        message: "Shipping label not found or update failed",
      });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", details: err.message });
  }
});

module.exports = {
  createNewOrder,
  updateOrder,
  getOrderById,
  getAllOrderList,
  getOrderStatus,
  updateSpecialRequest,
  updateShippingLabel,
};
