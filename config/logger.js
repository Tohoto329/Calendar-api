const winston = require('winston');
const fs = require('fs');
const path = require('path');


const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const isProduction = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [

    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
    !isProduction && new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      level: 'info',
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  ].filter(Boolean),
});

module.exports = logger;



// const winston = require('winston');

// const logger = winston.createLogger({
//     level: 'info',
//     format: winston.format.combine(
//         winston.format.timestamp(), 
//         winston.format.simple()
//     ),
//     transports: [
//         new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
//         new winston.transports.Console({ format: winston.format.simple() })
//     ],
// });

// module.exports = logger;

