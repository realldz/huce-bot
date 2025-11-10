import winston from 'winston';
import config from "@/config/config";

// Format log tự động chuyển mọi kiểu dữ liệu về chuỗi
const formatLogMessage = (...messages: any[]): string => {
  return messages.map(msg => {
    if (msg instanceof Error) {
      return `${msg.message}\nStack: ${msg.stack}`;
    } else if (typeof msg === 'object') {
      return JSON.stringify(msg, null, 2);
    }
    return String(msg);
  }).join(' '); // Nối tất cả tham số thành một chuỗi
};

const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

const logger: winston.Logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: customFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/bot.log' }),
  ],
});

// Ghi đè các phương thức log để nhận nhiều tham số
const originalLogMethods = {
  info: logger.info,
  warn: logger.warn,
  error: logger.error,
  debug: logger.debug,
};

logger.info = (...args: any[]) => originalLogMethods.info.call(logger, formatLogMessage(...args));
logger.warn = (...args: any[]) => originalLogMethods.warn.call(logger, formatLogMessage(...args));
logger.error = (...args: any[]) => originalLogMethods.error.call(logger, formatLogMessage(...args));
logger.debug = (...args: any[]) => originalLogMethods.debug.call(logger, formatLogMessage(...args));

export default logger;
