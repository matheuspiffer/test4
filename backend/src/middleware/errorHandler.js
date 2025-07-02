// middleware/errorHandler.js
const axios = require("axios");

// ► Handler 404 ◄
const notFound = (req, res, next) => {
  const err = new Error("Route Not Found");
  err.status = 404;
  next(err);
};

const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== "test") {
    console.error(err.stack || err);
  }

  const status = err.status || 500;

  res.status(status).json({
    error: err.message || "Internal Server Error",
  });
};

module.exports = { notFound, errorHandler };
