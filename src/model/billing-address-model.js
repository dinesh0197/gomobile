const { DataTypes } = require("sequelize");
const sequelize = require("../config/db-connection");
const Order = require("./order-model");

const BillingAddress = sequelize.define("BillingAddress", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  street: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  zipCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
});

BillingAddress.belongsTo(Order, {
  foreignKey: "orderId",
  as: "order",
});

module.exports = BillingAddress;
