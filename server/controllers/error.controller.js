/* eslint-disable arrow-body-style */
const ErrorStack = require("../helpers/appError")

const handleJWTError = () => {
  return new ErrorStack('Invalid token. Please log in again!', 401)
}

const handleJWTExpiredError = () => {
  return new ErrorStack('Your token has expired! Please log in again', 401)
}

const sendErrorDev = (error, req, res) => {
  const { statusCode, message, stack } = error;

  /* if (req.originalUrl.startsWith('/api')) {} */
  return res.status(statusCode).json({ status: false, error, message, stack })
}

const sendErrorProd = (error, req, res) => {
  const { status, statusCode, message, isOperational } = error;

  if (req.originalUrl.startsWith('/api')) {
    if (isOperational) {
      return res.status(statusCode).json({ status, message })
    }
    // eslint-disable-next-line no-console
    console.log('🛑 Error ', error)

    return res.status(500).json({ status: false, message: 'Something went wrong!', error })
  }
}

module.exports = (err, req, res, next) => {
  let error = {
    status: 'error',
    statusCode: 500,
    message: err.sqlMessage ? err.sqlMessage : err.message,
    ...err
  }

  /* if (error.code === 'ER_WRONG_VALUE_COUNT_ON_ROW') {
    const parts = error.sqlMessage.split(' ')
    const row = parts[parts.length - 1]
    
    const message = `Column value for ${bookModel[row - 1][0]} doesn't match expected data type. Expected ${bookModel[row - 1][1]}`

    return res.status(statusCode).json({ status, message, error, stack })
  } */

  if (error.statusCode === 422) {
    error.message = JSON.parse(error.message)
  }

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, req, res)
  } else if (process.env.NODE_ENV === 'production') {
    if (err.name === 'JsonWebTokenError') {
      error = handleJWTError()
    }

    if (err.name === 'TokenExpiredError') {
      error = handleJWTExpiredError()
    }

    sendErrorProd(error, req, res)
  }


}