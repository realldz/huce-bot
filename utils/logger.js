import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    // Ghi log ra console
    new winston.transports.Console(),
    // Ghi log ra file
    new winston.transports.File({ filename: 'logs/bot.log' }),
  ],
});

export default logger;