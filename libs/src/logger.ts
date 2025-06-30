import * as winston from "winston"

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({filename: 'error.log', level: 'error'}),
  ],
});


//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
const myFormat = winston.format.printf(({level, message, label, timestamp}) => {
  return `${timestamp} [${level}] ${message}`;
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({format: "YYYY-MM-dd HH:mm:ss"}),
      myFormat
    )
  }));
}

