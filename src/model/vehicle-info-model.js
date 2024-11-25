const { DataTypes } = require("sequelize");
const sequelize = require("../config/db-connection");
const Order = require("./order-model");

const VehicleInfo = sequelize.define("VehicleInfo", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  make: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  model: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

VehicleInfo.belongsTo(Order, {
  foreignKey: "orderId",
  as: "order",
});

module.exports = VehicleInfo;
