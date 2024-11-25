require("dotenv").config(); // Load environment variables

const { Sequelize } = require("sequelize");
const fs = require("fs");

const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.DATABASEUSERNAME,
  process.env.PASSWORD,
  {
    host: process.env.HOST,
    port: process.env.DBPORT, // Add the port number here
    dialect: "mysql",
    logging: console.log, // Optional: Enable logging in development
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((e) => {
    console.error("Unable to connect to the database:", e);
  });

module.exports = sequelize;
