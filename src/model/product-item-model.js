const { DataTypes } = require("sequelize");
const sequelize = require("../config/db-connection");
const Order = require("./order-model");

const ProductItem = sequelize.define("ProductItem", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  caridSKU: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  mpn: {
    type: DataTypes.STRING(255),
  },
  brand: {
    type: DataTypes.STRING(255),
  },
  vpn: {
    type: DataTypes.STRING(255),
  },
  description: {
    type: DataTypes.STRING(255),
  },
  orderQty: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(50),
  },
  trackingNumber: {
    type: DataTypes.STRING(255),
  },
  shippingCarrier: {
    type: DataTypes.STRING(255),
  },
  shippingMethod: {
    type: DataTypes.STRING(255),
  },
});

ProductItem.belongsTo(Order, {
  foreignKey: "orderId",
  as: "order",
});

module.exports = ProductItem;
