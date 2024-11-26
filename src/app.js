require("dotenv").config();
require("./config/db-connection");

const express = require("express");
var cors = require("cors");
const swagger = require("./helper/swagger");
const swaggerUI = require("swagger-ui-express");
const path = require("path");
const { requestLoggerMiddleware } = require("./config/logMiddelware");
const fs = require("fs");
const authRouter = require("./routes/auth-router");
const targetDirectory = "logs";
const globalErrorController = require("./helper/error-handler");
const sequelize = require("./config/db-connection");
const userRouter = require("./routes/user-router");
const maintenanceRouter = require("./routes/maintenance-routes/maintenance-route");

const app = express();
app.disable("x-powered-by");

const orderRouter = require("./routes/order-router");
const User = require("./model/user-model");
app.use(cors());

app.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});
app.use(
  "/api-docs",
  swaggerUI.serve,
  swaggerUI.setup(swagger, { explorer: true })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (!fs.existsSync(targetDirectory)) {
  fs.mkdirSync(targetDirectory);
}

app.use(express.static(path.join(__dirname, "../uploads")));

app.use(requestLoggerMiddleware());

app.patch("/healthy", (req, res) => {
  console.log("healthy");
  return res.status(200).send("healthy");
});

app.use("/auth", authRouter);
app.use("/user", userRouter);
// app.use("/maintenance", maintenanceRouter)
app.use("/order", orderRouter);

app.all("*", (req, res, next) => {
  next(`Cant find ${req.originalUrl} on this server`);
});

sequelize
  .sync()
  .then(() => {
    console.log("Syncedsuccessfully!");
  })
  .catch((error) => {
    console.error("Unable to sync : ", error);
  });
app.use(globalErrorController);

module.exports = app;
