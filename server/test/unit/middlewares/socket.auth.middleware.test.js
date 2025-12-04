import { describe, it, expect, beforeEach, vi } from 'vitest';
import jwt from 'jsonwebtoken';

// Mock modules
vi.mock('#src/config/env.js', () => ({
    env: {
        JWT_SECRET: 'test-secret',
    },
}));

vi.mock('#src/config/logger.js', () => ({
    default: {
        error: vi.fn(),
    },
}));

vi.mock('#src/models/index.js', () => {
    const mockFindById = vi.fn();
    return {
        User: {
            findById: mockFindById,
        },
    };
});

// Import after mocks
import { socketAuthMiddleware } from '#src/middlewares/socket.auth.middleware.js';
import { User } from '#src/models/index.js';
import { env } from '#src/config/env.js';
import logger from '#src/config/logger.js';

describe('Socket Auth Middleware', () => {
    let socket, next;

    beforeEach(() => {
        socket = {
            handshake: {
                auth: {},
                headers: {},
            },
        };

        next = vi.fn();

        // Reset mocks
        vi.clearAllMocks();
        User.findById.mockClear();
        logger.error.mockClear();
    });

    describe('Successful authentication', () => {
        it('should authenticate user with token in auth.token', async () => {
            const mockUser = {
                _id: '507f1f77bcf86cd799439011',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
            };

            const token = jwt.sign({ id: '507f1f77bcf86cd799439011' }, env.JWT_SECRET);
            socket.handshake.auth.token = token;

            const mockQuery = {
                select: vi.fn().mockResolvedValue(mockUser),
            };
            User.findById.mockReturnValue(mockQuery);

            await socketAuthMiddleware(socket, next);

            expect(User.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
            expect(mockQuery.select).toHaveBeenCalledWith('-password');
            expect(socket.user).toEqual(mockUser);
            expect(next).toHaveBeenCalledWith();
            expect(logger.error).not.toHaveBeenCalled();
        });

        it('should authenticate user with token in Authorization header', async () => {
            const mockUser = {
                _id: '507f1f77bcf86cd799439011',
                email: 'test@example.com',
            };

            const token = jwt.sign({ id: '507f1f77bcf86cd799439011' }, env.JWT_SECRET);
            socket.handshake.headers.authorization = `Bearer ${token}`;

            const mockQuery = {
                select: vi.fn().mockResolvedValue(mockUser),
            };
            User.findById.mockReturnValue(mockQuery);

            await socketAuthMiddleware(socket, next);

            expect(User.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
            expect(socket.user).toEqual(mockUser);
            expect(next).toHaveBeenCalledWith();
        });

        it('should prefer auth.token over Authorization header', async () => {
            const mockUser = {
                _id: '507f1f77bcf86cd799439011',
                email: 'test@example.com',
            };

            const token1 = jwt.sign({ id: '507f1f77bcf86cd799439011' }, env.JWT_SECRET);
            const token2 = jwt.sign({ id: '507f1f77bcf86cd799439022' }, env.JWT_SECRET);
            
            socket.handshake.auth.token = token1;
            socket.handshake.headers.authorization = `Bearer ${token2}`;

            const mockQuery = {
                select: vi.fn().mockResolvedValue(mockUser),
            };
            User.findById.mockReturnValue(mockQuery);

            await socketAuthMiddleware(socket, next);

            expect(User.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
            expect(socket.user).toEqual(mockUser);
            expect(next).toHaveBeenCalledWith();
        });
    });

    describe('Authentication failures', () => {
        it('should call next with error when token is missing', async () => {
            await socketAuthMiddleware(socket, next);

            expect(User.findById).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(next.mock.calls[0][0].message).toBe('Authentication token is required');
            expect(socket.user).toBeUndefined();
        });

        it('should call next with error when token is invalid', async () => {
            socket.handshake.auth.token = 'invalid-token';

            await socketAuthMiddleware(socket, next);

            expect(User.findById).not.toHaveBeenCalled();
            expect(logger.error).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(next.mock.calls[0][0].message).toBe('Authentication failed');
            expect(socket.user).toBeUndefined();
        });

        it('should call next with error when user is not found', async () => {
            const token = jwt.sign({ id: '507f1f77bcf86cd799439011' }, env.JWT_SECRET);
            socket.handshake.auth.token = token;

            const mockQuery = {
                select: vi.fn().mockResolvedValue(null),
            };
            User.findById.mockReturnValue(mockQuery);

            await socketAuthMiddleware(socket, next);

            expect(User.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(next.mock.calls[0][0].message).toBe('User not found');
            expect(socket.user).toBeUndefined();
        });

        it('should call next with error when JWT verification fails', async () => {
            socket.handshake.auth.token = 'expired-token';

            await socketAuthMiddleware(socket, next);

            expect(User.findById).not.toHaveBeenCalled();
            expect(logger.error).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(next.mock.calls[0][0].message).toBe('Authentication failed');
        });

        it('should handle Authorization header without Bearer prefix', async () => {
            socket.handshake.headers.authorization = 'invalid-format';

            await socketAuthMiddleware(socket, next);

            expect(User.findById).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });

        it('should handle empty Authorization header', async () => {
            socket.handshake.headers.authorization = '';

            await socketAuthMiddleware(socket, next);

            expect(User.findById).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('User selection', () => {
        it('should select user without password field', async () => {
            const mockUser = {
                _id: '507f1f77bcf86cd799439011',
                email: 'test@example.com',
                password: 'hashed-password',
            };

            const token = jwt.sign({ id: '507f1f77bcf86cd799439011' }, env.JWT_SECRET);
            socket.handshake.auth.token = token;

            const mockQuery = {
                select: vi.fn().mockResolvedValue(mockUser),
            };
            User.findById.mockReturnValue(mockQuery);

            await socketAuthMiddleware(socket, next);

            expect(User.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
            expect(mockQuery.select).toHaveBeenCalledWith('-password');
        });
    });
});

