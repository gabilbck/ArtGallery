const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(), // manda pro console
    new transports.File({ filename: 'logs/app.log' }) // salva em arquivo
  ],
});

module.exports = logger;
