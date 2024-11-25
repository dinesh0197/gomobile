const { DataTypes } = require("sequelize");
const sequelize = require("../config/db-connection");
const Order = require("./order-model");

const ShippingAddress = sequelize.define("ShippingAddress", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  firstName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  address1: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  address2: {
    type: DataTypes.STRING(255),
  },
  shippingCarrier: {
    type: DataTypes.STRING(255),
  },
  shippingMethod: {
    type: DataTypes.STRING(255),
  },
});

ShippingAddress.belongsTo(Order, {
  foreignKey: "orderId",
  as: "order",
});

module.exports = ShippingAddress;
