import httpStatus from 'http-status';
import { Prisma } from '@prisma/client';
import config from '../config/config.js';
import logger from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';

const handlePrismaError = (err) => {
  switch (err.code) {
    case 'P2002':
      // handling duplicate key errors
      return new ApiError(400, `Duplicate field value: ${err.meta.target}`, false, err.stack);
    case 'P2014':
      // handling invalid id errors
      return new ApiError(400, `Invalid ID: ${err.meta.target}`, false, err.stack);
    case 'P2003':
      // handling invalid data errors
      return new ApiError(400, `Invalid input data: ${err.meta.target}`, false, err.stack);
    default:
      // handling all other errors
      return new ApiError(500, `Something went wrong: ${err.message}`, false, err.stack);
  }
};

export const errorConverter = (err, req, res, next) => {
  let error = err;
  if (error instanceof Prisma.PrismaClientValidationError) {
    const statusCode = httpStatus.BAD_REQUEST;
    const message = 'Validation error in database operation';
    error = new ApiError(statusCode, message, false, err.stack);
  } else if (!(error instanceof ApiError)) {
    // if error from axios or http request
    if (error.response) {
      const message = error.response.data.message || error.response.data;
      const statusCode = error.response.status;

      logger.info('handleAxiosError');
      error = new ApiError(statusCode, message, false, err.stack);
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handling Prisma Error
      logger.info('handlePrismaError');
      error = handlePrismaError(error);
    } else {
      // Handling Global Error
      const { statusCode } = error;
      const message = error.message || httpStatus[statusCode];
      error = new ApiError(statusCode, message, false, err.stack);
    }
  }
  next(error);
};

export const errorHandleres = (err, req, res, next) => {
  let { statusCode, message } = err;
  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(config.env === 'development' && { stack: err.stack })
  };

  if (config.env === 'development') {
    logger.error(err);
  }

  res.status(statusCode).send(response);
};
