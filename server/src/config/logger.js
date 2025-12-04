import winston from 'winston';

import { env } from './env.js';

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.printf(({ timestamp, level, message, stack }) => {
        const logMessage = `${timestamp} [${level}]: ${message}`;
        return stack ? `${logMessage}\n${stack}` : logMessage;
    }),
);

const logger = winston.createLogger({
    level: env.NODE_ENV === 'development' ? 'debug' : 'info',
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                logFormat,
            ),
        }),

        ...(env.NODE_ENV === 'production'
            ? [
                  new winston.transports.File({
                      filename: 'logs/combined.log',
                      level: 'info',
                      format: logFormat,
                  }),
                  new winston.transports.File({
                      filename: 'logs/error.log',
                      level: 'error',
                      format: logFormat,
                  }),
              ]
            : []),
    ],
});

export default logger;
