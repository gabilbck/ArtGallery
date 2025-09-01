const { createLogger, format, transports } = require("winston");
const winston = require("winston");

const logger = createLogger({
  level: 'info',
  format: format.json(),
  transports: [
    new winston.transports.Console(), // Datadog Agent lê daqui
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

const loggerMiddleware = (req, res, next) => {
  logger.info({
    message: 'Requisição recebida',
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
  });
  next();
};

// Exporta tanto o logger (pra usar em outras partes) quanto o middleware
module.exports = { logger, loggerMiddleware };


