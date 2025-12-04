import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock modules
vi.mock('#src/config/logger.js', () => ({
    default: {
        error: vi.fn(),
    },
}));

vi.mock('#src/utils/response.util.js', () => {
    const mockSend = vi.fn();
    return {
        default: {
            error: vi.fn(() => ({
                send: mockSend,
            })),
        },
        __mocks: {
            send: mockSend,
        },
    };
});

// Import after mocks
import { errorHandler } from '#src/middlewares/error.handler.js';
import { AppError, NotFoundError, BadRequestError } from '#src/utils/errors/index.js';
import ApiResponse from '#src/utils/response.util.js';
import logger from '#src/config/logger.js';

describe('Error Handler Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {};
        res = {
            statusCode: 200,
        };
        next = vi.fn();

        // Reset mocks
        vi.clearAllMocks();
        logger.error.mockClear();
        ApiResponse.error.mockClear();
    });

    describe('AppError handling', () => {
        it('should handle AppError correctly', () => {
            const appError = new NotFoundError('Resource not found');
            const mockResponse = {
                send: vi.fn(),
            };

            ApiResponse.error.mockReturnValue(mockResponse);

            errorHandler(appError, req, res, next);

            expect(logger.error).toHaveBeenCalledWith('Error: Resource not found');
            expect(ApiResponse.error).toHaveBeenCalledWith(404, 'Resource not found');
            expect(mockResponse.send).toHaveBeenCalledWith(res);
        });

        it('should handle BadRequestError correctly', () => {
            const badRequestError = new BadRequestError('Invalid input');
            const mockResponse = {
                send: vi.fn(),
            };

            ApiResponse.error.mockReturnValue(mockResponse);

            errorHandler(badRequestError, req, res, next);

            expect(ApiResponse.error).toHaveBeenCalledWith(400, 'Invalid input');
            expect(mockResponse.send).toHaveBeenCalledWith(res);
        });
    });

    describe('Mongoose CastError handling', () => {
        it('should handle CastError correctly', () => {
            const castError = new Error('Cast to ObjectId failed');
            castError.name = 'CastError';
            castError.value = 'invalid-id';

            const mockResponse = {
                send: vi.fn(),
            };

            ApiResponse.error.mockReturnValue(mockResponse);

            errorHandler(castError, req, res, next);

            expect(logger.error).toHaveBeenCalledWith('Error: Cast to ObjectId failed');
            expect(ApiResponse.error).toHaveBeenCalledWith(
                404,
                'Resource not found: invalid-id',
            );
            expect(mockResponse.send).toHaveBeenCalledWith(res);
        });
    });

    describe('Mongoose duplicate key error handling', () => {
        it('should handle duplicate key error (code 11000) correctly', () => {
            const duplicateError = new Error('Duplicate key');
            duplicateError.code = 11000;
            duplicateError.keyValue = { email: 'test@example.com' };

            const mockResponse = {
                send: vi.fn(),
            };

            ApiResponse.error.mockReturnValue(mockResponse);

            errorHandler(duplicateError, req, res, next);

            expect(logger.error).toHaveBeenCalledWith('Error: Duplicate key');
            expect(ApiResponse.error).toHaveBeenCalledWith(
                400,
                'Duplicate field value entered: email',
            );
            expect(mockResponse.send).toHaveBeenCalledWith(res);
        });

        it('should handle duplicate key error with multiple fields', () => {
            const duplicateError = new Error('Duplicate key');
            duplicateError.code = 11000;
            duplicateError.keyValue = {
                email: 'test@example.com',
                username: 'testuser',
            };

            const mockResponse = {
                send: vi.fn(),
            };

            ApiResponse.error.mockReturnValue(mockResponse);

            errorHandler(duplicateError, req, res, next);

            expect(ApiResponse.error).toHaveBeenCalledWith(
                400,
                'Duplicate field value entered: email, username',
            );
            expect(mockResponse.send).toHaveBeenCalledWith(res);
        });
    });

    describe('Mongoose ValidationError handling', () => {
        it('should handle ValidationError correctly', () => {
            const validationError = new Error('Validation failed');
            validationError.name = 'ValidationError';
            validationError.errors = {
                email: { message: 'Email is required' },
                password: { message: 'Password must be at least 6 characters' },
            };

            const mockResponse = {
                send: vi.fn(),
            };

            ApiResponse.error.mockReturnValue(mockResponse);

            errorHandler(validationError, req, res, next);

            expect(logger.error).toHaveBeenCalledWith('Error: Validation failed');
            expect(ApiResponse.error).toHaveBeenCalledWith(
                400,
                'Validation error: Email is required, Password must be at least 6 characters',
            );
            expect(mockResponse.send).toHaveBeenCalledWith(res);
        });
    });

    describe('JWT error handling', () => {
        it('should handle JsonWebTokenError correctly', () => {
            const jwtError = new Error('Invalid token');
            jwtError.name = 'JsonWebTokenError';

            const mockResponse = {
                send: vi.fn(),
            };

            ApiResponse.error.mockReturnValue(mockResponse);

            errorHandler(jwtError, req, res, next);

            expect(logger.error).toHaveBeenCalledWith('Error: Invalid token');
            expect(ApiResponse.error).toHaveBeenCalledWith(401, 'Invalid token');
            expect(mockResponse.send).toHaveBeenCalledWith(res);
        });

        it('should handle TokenExpiredError correctly', () => {
            const expiredError = new Error('Token expired');
            expiredError.name = 'TokenExpiredError';

            const mockResponse = {
                send: vi.fn(),
            };

            ApiResponse.error.mockReturnValue(mockResponse);

            errorHandler(expiredError, req, res, next);

            expect(logger.error).toHaveBeenCalledWith('Error: Token expired');
            expect(ApiResponse.error).toHaveBeenCalledWith(401, 'Token expired');
            expect(mockResponse.send).toHaveBeenCalledWith(res);
        });
    });

    describe('Default error handling', () => {
        it('should handle generic errors with default status code', () => {
            const genericError = new Error('Something went wrong');
            res.statusCode = undefined;

            const mockResponse = {
                send: vi.fn(),
            };

            ApiResponse.error.mockReturnValue(mockResponse);

            errorHandler(genericError, req, res, next);

            expect(logger.error).toHaveBeenCalledWith('Error: Something went wrong');
            expect(ApiResponse.error).toHaveBeenCalledWith(500, 'Something went wrong');
            expect(mockResponse.send).toHaveBeenCalledWith(res);
        });

        it('should handle errors without message', () => {
            const errorWithoutMessage = new Error();
            errorWithoutMessage.message = undefined;
            res.statusCode = undefined;

            const mockResponse = {
                send: vi.fn(),
            };

            ApiResponse.error.mockReturnValue(mockResponse);

            errorHandler(errorWithoutMessage, req, res, next);

            expect(logger.error).toHaveBeenCalledWith('Error: undefined');
            expect(ApiResponse.error).toHaveBeenCalledWith(500, 'Internal Server Error');
            expect(mockResponse.send).toHaveBeenCalledWith(res);
        });

        it('should use res.statusCode when available', () => {
            const genericError = new Error('Custom error');
            res.statusCode = 418;

            const mockResponse = {
                send: vi.fn(),
            };

            ApiResponse.error.mockReturnValue(mockResponse);

            errorHandler(genericError, req, res, next);

            expect(ApiResponse.error).toHaveBeenCalledWith(418, 'Custom error');
            expect(mockResponse.send).toHaveBeenCalledWith(res);
        });
    });
});

