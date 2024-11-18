const winston = require('winston');

const isProduction = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple()
    ),
    transports: [

        !isProduction && new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.Console({ format: winston.format.simple() })
    ].filter(Boolean),
});

module.exports = logger;
