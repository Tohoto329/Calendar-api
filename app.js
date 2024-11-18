const express = require('express');
const cors = require('cors');
const route = require('./route'); 
const logger = require('./config/logger');
require('dotenv').config();
require('./config/mongo');

const app = express();

const allowedOrigin = process.env.ALLOW_ORIGIN;

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin === allowedOrigin) {
      return callback(null, true);
    } else {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(route);

const errorHandler = (err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({
    error: 'Something went wrong, please try again later.'
  });
};

app.use(errorHandler);

module.exports = app;
