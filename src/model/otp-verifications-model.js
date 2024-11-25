const { DataTypes } = require("sequelize");
const sequelize = require("../config/db-connection");
const User = require("./user-model");

const OtpVerification = sequelize.define("OtpVerification", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("EMAIL", "MOBILE"),
    allowNull: false,
  },
  otpCode: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});
OtpVerification.belongsTo(User, {
  foreignKey: "userId",
});

module.exports = OtpVerification;
