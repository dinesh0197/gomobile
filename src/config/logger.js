const { createLogger, transports, format } = require("winston");

const date = new Date().toISOString().split("T")[0];
const logger = createLogger({
  transports: [
    new transports.File({
      filename: `logs/${date}.log`,
      level: "info",
      format: format.combine(format.timestamp(), format.json()),
    }),
  ],
});

module.exports = logger;
