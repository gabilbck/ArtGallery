const { createLogger, format, transports } = require("winston");

const logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.Console(), // manda pro console
    new transports.File({ filename: 'logs/app.log' }) // salva em arquivo
  ],
});

const loggerMiddleware = (req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
};

// Exporta tanto o logger (pra usar em outras partes) quanto o middleware
module.exports = { logger, loggerMiddleware };


