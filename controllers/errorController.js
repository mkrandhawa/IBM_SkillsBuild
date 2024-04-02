const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateErrorDB = (err) => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  //loop through all the object values field and only get the corrispondent message

  const errors = Object.values(err.errors).map((el) => el.message); //objects.values are the objects in the error
  const message = `Invalid input data ${errors.join(". ")}.`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please login again", 401);

const handleExpiredJWTError = () =>
  new AppError("Your token has expired! Please log in again", 401);

const sendErrorDev = (err, req, res) => {
  //a) API
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  console.error("ERROR", err);
  //b) RENDERED WEBSITE
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong!", //title of the error page
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  //a) API
  if (req.originalUrl.startsWith("/api")) {
    //a)  Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
      //b) Programming or other unknown error: don't leak error details
    }
    // 1) Log error
    console.error("ERROR", err);

    // 2) Send generic message
    return res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }

  //b) RENDERED WEBSITE
  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong!", //title of the error page
      msg: err.message,
    });

    // b) Programming or other unknown error: don't leak error details
  }
  // 1) Log error
  console.error("ERROR", err);

  // 2) Send generic message
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong!", //title of the error page
    msg: "Please try again later",
  });
};

//Express error handler
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV.trim() === "production") {
    let error = {
      ...err,
      name: err.name,
      code: err.code,
      message: err.message,
    };

    if (error.name === "CastError") error = handleCastErrorDB(error); //on get request
    if (error.code === 11000) error = handleDuplicateErrorDB(error); //on post(add new) request
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error); //on patch(update) request
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleExpiredJWTError();
    sendErrorProd(error, req, res);
  }
};
