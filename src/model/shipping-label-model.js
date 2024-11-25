const { DataTypes } = require("sequelize");
const sequelize = require("../config/db-connection");
const Order = require("./order-model");

const ShippingLabel = sequelize.define("ShippingLabel", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  requestedDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  requestComment: {
    type: DataTypes.STRING(255),
  },
  filePath: {
    type: DataTypes.STRING(255),
  },
  updatedDate: {
    type: DataTypes.DATE,
  },
  responseComment: {
    type: DataTypes.STRING(255),
  },
});

ShippingLabel.belongsTo(Order, {
  foreignKey: "orderId",
  as: "order",
});

module.exports = ShippingLabel;
