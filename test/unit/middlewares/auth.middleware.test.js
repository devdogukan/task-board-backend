import { describe, it, expect, beforeEach, vi } from 'vitest';
import jwt from 'jsonwebtoken';

// Mock modules
vi.mock('#src/config/logger.js', () => ({
    default: {
        error: vi.fn(),
    },
}));

vi.mock('#src/config/env.js', () => ({
    env: {
        JWT_SECRET: 'test-secret',
    },
}));

vi.mock('#src/models/index.js', () => ({
    User: {
        findById: vi.fn(),
    },
}));

// Import after mocks
import { authMiddleware } from '#src/middlewares/auth.middleware.js';
import { User } from '#src/models/index.js';
import { NotFoundError, UnauthorizedError } from '#src/utils/errors/index.js';
import logger from '#src/config/logger.js';

describe('Auth Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {},
        };

        res = {};

        next = vi.fn();

        // Reset mocks
        vi.clearAllMocks();
        User.findById.mockClear();
        logger.error.mockClear();
    });

    describe('Token extraction', () => {
        it('should extract token from Bearer authorization header', async () => {
            const mockUser = {
                _id: '507f1f77bcf86cd799439011',
                email: 'test@example.com',
            };

            const token = jwt.sign({ id: '507f1f77bcf86cd799439011' }, 'test-secret');
            req.headers.authorization = `Bearer ${token}`;

            User.findById.mockResolvedValue(mockUser);

            await authMiddleware(req, res, next);

            expect(User.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
            expect(req.user).toEqual(mockUser);
            expect(next).toHaveBeenCalledWith();
        });

        it('should return UnauthorizedError when token is not provided', async () => {
            await authMiddleware(req, res, next);

            expect(logger.error).toHaveBeenCalledWith('Bearer token is not provided');
            expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
            expect(req.user).toBeUndefined();
        });

        it('should return UnauthorizedError when authorization header does not start with Bearer', async () => {
            req.headers.authorization = 'Invalid token';

            await authMiddleware(req, res, next);

            expect(logger.error).toHaveBeenCalledWith('Bearer token is not provided');
            expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
            expect(req.user).toBeUndefined();
        });
    });

    describe('Token verification', () => {
        it('should return error when token is invalid', async () => {
            req.headers.authorization = 'Bearer invalid-token';

            await authMiddleware(req, res, next);

            expect(logger.error).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(req.user).toBeUndefined();
        });

        it('should return NotFoundError when user does not exist', async () => {
            const token = jwt.sign({ id: '507f1f77bcf86cd799439011' }, 'test-secret');
            req.headers.authorization = `Bearer ${token}`;

            User.findById.mockResolvedValue(null);

            await authMiddleware(req, res, next);

            expect(User.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
            expect(logger.error).toHaveBeenCalledWith(
                'User not found: 507f1f77bcf86cd799439011',
            );
            expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
            expect(req.user).toBeUndefined();
        });

        it('should set req.user and call next when token is valid and user exists', async () => {
            const mockUser = {
                _id: '507f1f77bcf86cd799439011',
                email: 'test@example.com',
            };

            const token = jwt.sign({ id: '507f1f77bcf86cd799439011' }, 'test-secret');
            req.headers.authorization = `Bearer ${token}`;

            User.findById.mockResolvedValue(mockUser);

            await authMiddleware(req, res, next);

            expect(req.user).toEqual(mockUser);
            expect(next).toHaveBeenCalledWith();
        });
    });
});

