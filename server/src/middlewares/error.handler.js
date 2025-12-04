import logger from '#src/config/logger.js';
import ApiResponse from '#src/utils/response.util.js';
import { AppError } from '#src/utils/errors/index.js';

export const errorHandler = (err, req, res, next) => {
    logger.error(`Error: ${err.message}`);

    let statusCode = res.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // -- Custom App Errors --
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        return ApiResponse.error(statusCode, message).send(res);
    }

    // -- MongoDB Transaction Errors --
    if (err.message && err.message.includes('Transaction numbers are only allowed')) {
        statusCode = 500;
        message = 'Database transaction error. Please try again.';
        logger.error('MongoDB transaction error - transactions require replica set');
        return ApiResponse.error(statusCode, message).send(res);
    }

    // -- Mongoose Errors --
    if (err.name === 'CastError') {
        statusCode = 404;
        message = `Resource not found: ${err.value}`;
    }

    if (err.code === 11000) {
        statusCode = 400;
        message = `Duplicate field value entered: ${Object.keys(err.keyValue).join(', ')}`;
    }

    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = `Validation error: ${Object.values(err.errors)
            .map((val) => val.message)
            .join(', ')}`;
    }

    // -- JWT Errors --
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }

    return ApiResponse.error(statusCode, message).send(res);
};
