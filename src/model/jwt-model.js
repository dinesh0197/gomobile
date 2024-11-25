const { DataTypes } = require("sequelize");
const sequelize = require("../config/db-connection");
const User = require("./user-model");

const Jwt = sequelize.define("Jwt", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  token: {
    type: DataTypes.TEXT("long"),
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
Jwt.belongsTo(User, {
  foreignKey: "userId",
});

module.exports = Jwt;
