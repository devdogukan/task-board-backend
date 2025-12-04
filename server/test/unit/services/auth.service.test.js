import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock modules
vi.mock('#src/models/index.js', () => {
    const mockUserFindOne = vi.fn();
    const mockUserCreate = vi.fn();
    const mockUserFindById = vi.fn();
    return {
        User: {
            findOne: mockUserFindOne,
            create: mockUserCreate,
            findById: mockUserFindById,
        },
        __mocks: {
            findOne: mockUserFindOne,
            create: mockUserCreate,
            findById: mockUserFindById,
        },
    };
});

vi.mock('bcryptjs', () => {
    const mockHash = vi.fn();
    const mockCompare = vi.fn();
    return {
        default: {
            hash: mockHash,
            compare: mockCompare,
        },
        __mocks: {
            hash: mockHash,
            compare: mockCompare,
        },
    };
});

vi.mock('jsonwebtoken', () => {
    const mockSign = vi.fn();
    const mockVerify = vi.fn();
    return {
        default: {
            sign: mockSign,
            verify: mockVerify,
        },
        __mocks: {
            sign: mockSign,
            verify: mockVerify,
        },
    };
});

vi.mock('#src/utils/time.util.js', () => {
    const mockParseJwtExpirationToMs = vi.fn();
    return {
        parseExpirationToMs: mockParseJwtExpirationToMs,
        __mocks: {
            parseExpirationToMs: mockParseJwtExpirationToMs,
        },
    };
});

vi.mock('#src/config/env.js', () => {
    return {
        env: {
            JWT_SECRET: 'test-jwt-secret',
            JWT_REFRESH_SECRET: 'test-jwt-refresh-secret',
            JWT_EXPIRES_IN: '1h',
            JWT_REFRESH_EXPIRES_IN: '7d',
            NODE_ENV: 'test',
        },
    };
});

// Import after mocks
import * as authService from '#src/services/auth.service.js';
import { User } from '#src/models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { parseExpirationToMs } from '#src/utils/time.util.js';

// Access to mock functions
const mockUserFindOne = User.findOne;
const mockUserCreate = User.create;
const mockUserFindById = User.findById;
const mockBcryptHash = bcrypt.hash;
const mockBcryptCompare = bcrypt.compare;
const mockJwtSign = jwt.sign;
const mockJwtVerify = jwt.verify;
const mockParseJwtExpirationToMs = parseExpirationToMs;

describe('Auth Service - register', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUserFindOne.mockClear();
        mockUserCreate.mockClear();
        mockBcryptHash.mockClear();
    });

    describe('Successful registration', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                password: 'password123',
            };

            const mockUser = {
                _id: '507f1f77bcf86cd799439011',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                password: 'hashedPassword123',
                toObject: vi.fn().mockReturnValue({
                    _id: '507f1f77bcf86cd799439011',
                    email: 'test@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    password: 'hashedPassword123',
                }),
            };

            // Mock User.findOne to return null (no existing user)
            mockUserFindOne.mockResolvedValue(null);

            // Mock bcrypt.hash
            mockBcryptHash.mockResolvedValue('hashedPassword123');

            // Mock User.create
            mockUserCreate.mockResolvedValue(mockUser);

            const result = await authService.register(userData);

            // Assertions
            expect(mockUserFindOne).toHaveBeenCalledWith({
                email: 'test@example.com',
            });
            expect(mockBcryptHash).toHaveBeenCalledWith('password123', 10);
            expect(mockUserCreate).toHaveBeenCalledWith({
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                password: 'hashedPassword123',
            });

            // Verify password is removed from result
            expect(result).not.toHaveProperty('password');
            expect(result).toMatchObject({
                _id: '507f1f77bcf86cd799439011',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
            });
        });
    });

    describe('Email already exists', () => {
        it('should throw ConflictError when email already exists', async () => {
            const userData = {
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                password: 'password123',
            };

            const existingUser = {
                _id: '507f1f77bcf86cd799439011',
                email: 'test@example.com',
                firstName: 'Existing',
                lastName: 'User',
            };

            // Mock User.findOne to return existing user
            mockUserFindOne.mockResolvedValue(existingUser);

            // Expect ConflictError to be thrown
            await expect(authService.register(userData)).rejects.toThrow(
                'User already exists',
            );

            // Assertions
            expect(mockUserFindOne).toHaveBeenCalledWith({
                email: 'test@example.com',
            });
            expect(mockBcryptHash).not.toHaveBeenCalled();
            expect(mockUserCreate).not.toHaveBeenCalled();
        });
    });
});

describe('Auth Service - login', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUserFindOne.mockClear();
        mockBcryptCompare.mockClear();
        mockJwtSign.mockClear();
        mockParseJwtExpirationToMs.mockClear();
    });

    describe('Successful login', () => {
        it('should login a user successfully with valid credentials', async () => {
            const email = 'test@example.com';
            const password = 'password123';

            const mockUser = {
                _id: '507f1f77bcf86cd799439011',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                password: 'hashedPassword123',
                toObject: vi.fn().mockReturnValue({
                    _id: '507f1f77bcf86cd799439011',
                    email: 'test@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    password: 'hashedPassword123',
                }),
            };

            const mockQuery = {
                select: vi.fn().mockResolvedValue(mockUser),
            };

            // Mock User.findOne().select()
            mockUserFindOne.mockReturnValue(mockQuery);

            // Mock bcrypt.compare to return true
            mockBcryptCompare.mockResolvedValue(true);

            // Mock jwt.sign
            mockJwtSign.mockReturnValueOnce('access-token-123');
            mockJwtSign.mockReturnValueOnce('refresh-token-456');

            // Mock parseExpirationToMs
            mockParseJwtExpirationToMs.mockReturnValue(3600000); // 1 hour in ms

            const result = await authService.login(email, password);

            // Assertions
            expect(mockUserFindOne).toHaveBeenCalledWith({
                email: 'test@example.com',
            });
            expect(mockQuery.select).toHaveBeenCalledWith('+password');
            expect(mockBcryptCompare).toHaveBeenCalledWith(
                'password123',
                'hashedPassword123',
            );

            // Verify jwt.sign was called twice (token and refreshToken)
            expect(mockJwtSign).toHaveBeenCalledTimes(2);
            expect(mockJwtSign).toHaveBeenNthCalledWith(
                1,
                { id: '507f1f77bcf86cd799439011' },
                'test-jwt-secret',
                { expiresIn: 3600000 },
            );
            expect(mockJwtSign).toHaveBeenNthCalledWith(
                2,
                { id: '507f1f77bcf86cd799439011' },
                'test-jwt-refresh-secret',
                { expiresIn: 3600000 },
            );

            // Verify result structure
            expect(result).toMatchObject({
                user: {
                    _id: '507f1f77bcf86cd799439011',
                    email: 'test@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                },
                token: 'access-token-123',
                refreshToken: 'refresh-token-456',
            });

            // Verify password is removed from user
            expect(result.user).not.toHaveProperty('password');
        });
    });

    describe('User not found', () => {
        it('should throw BadRequestError when user does not exist', async () => {
            const email = 'test@example.com';
            const password = 'password123';

            const mockQuery = {
                select: vi.fn().mockResolvedValue(null),
            };

            // Mock User.findOne().select() to return null
            mockUserFindOne.mockReturnValue(mockQuery);

            // Expect BadRequestError to be thrown
            await expect(authService.login(email, password)).rejects.toThrow(
                'Invalid email or password',
            );

            // Assertions
            expect(mockUserFindOne).toHaveBeenCalledWith({
                email: 'test@example.com',
            });
            expect(mockQuery.select).toHaveBeenCalledWith('+password');
            expect(mockBcryptCompare).not.toHaveBeenCalled();
            expect(mockJwtSign).not.toHaveBeenCalled();
        });
    });

    describe('Invalid password', () => {
        it('should throw BadRequestError when password is incorrect', async () => {
            const email = 'test@example.com';
            const password = 'password123';

            const mockUser = {
                _id: '507f1f77bcf86cd799439011',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                password: 'hashedPassword123',
            };

            const mockQuery = {
                select: vi.fn().mockResolvedValue(mockUser),
            };

            // Mock User.findOne().select()
            mockUserFindOne.mockReturnValue(mockQuery);

            // Mock bcrypt.compare to return false (invalid password)
            mockBcryptCompare.mockResolvedValue(false);

            // Expect BadRequestError to be thrown
            await expect(authService.login(email, password)).rejects.toThrow(
                'Invalid email or password',
            );

            // Assertions
            expect(mockUserFindOne).toHaveBeenCalledWith({
                email: 'test@example.com',
            });
            expect(mockQuery.select).toHaveBeenCalledWith('+password');
            expect(mockBcryptCompare).toHaveBeenCalledWith(
                'password123',
                'hashedPassword123',
            );
            expect(mockJwtSign).not.toHaveBeenCalled();
        });
    });
});

describe('Auth Service - refreshToken', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUserFindById.mockClear();
        mockJwtSign.mockClear();
        mockJwtVerify.mockClear();
        mockParseJwtExpirationToMs.mockClear();
    });

    describe('Successful token refresh', () => {
        it('should refresh tokens successfully with valid refresh token', async () => {
            const oldRefreshToken = 'old-refresh-token-123';

            const mockUser = {
                _id: '507f1f77bcf86cd799439011',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                password: 'hashedPassword123',
                toObject: vi.fn().mockReturnValue({
                    _id: '507f1f77bcf86cd799439011',
                    email: 'test@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    password: 'hashedPassword123',
                }),
            };

            const decodedToken = {
                id: '507f1f77bcf86cd799439011',
            };

            // Mock jwt.verify to return decoded token
            mockJwtVerify.mockReturnValue(decodedToken);

            // Mock User.findById
            mockUserFindById.mockResolvedValue(mockUser);

            // Mock jwt.sign
            mockJwtSign.mockReturnValueOnce('new-access-token-123');
            mockJwtSign.mockReturnValueOnce('new-refresh-token-456');

            // Mock parseExpirationToMs
            mockParseJwtExpirationToMs.mockReturnValue(3600000); // 1 hour in ms

            const result = await authService.refreshToken(oldRefreshToken);

            // Assertions
            expect(mockJwtVerify).toHaveBeenCalledWith(
                'old-refresh-token-123',
                'test-jwt-refresh-secret',
            );
            expect(mockUserFindById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');

            // Verify jwt.sign was called twice (token and refreshToken)
            expect(mockJwtSign).toHaveBeenCalledTimes(2);
            expect(mockJwtSign).toHaveBeenNthCalledWith(
                1,
                { id: '507f1f77bcf86cd799439011' },
                'test-jwt-secret',
                { expiresIn: 3600000 },
            );
            expect(mockJwtSign).toHaveBeenNthCalledWith(
                2,
                { id: '507f1f77bcf86cd799439011' },
                'test-jwt-refresh-secret',
                { expiresIn: 3600000 },
            );

            // Verify result structure
            expect(result).toMatchObject({
                user: {
                    _id: '507f1f77bcf86cd799439011',
                    email: 'test@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                },
                token: 'new-access-token-123',
                refreshToken: 'new-refresh-token-456',
            });

            // Verify password is removed from user
            expect(result.user).not.toHaveProperty('password');
        });
    });

    describe('Refresh token missing', () => {
        it('should throw UnauthorizedError when refresh token is missing', async () => {
            // Expect UnauthorizedError to be thrown
            await expect(authService.refreshToken(null)).rejects.toThrow(
                'Refresh token is not provided',
            );

            expect(mockJwtVerify).not.toHaveBeenCalled();
            expect(mockUserFindById).not.toHaveBeenCalled();
            expect(mockJwtSign).not.toHaveBeenCalled();
        });
    });

    describe('Invalid refresh token', () => {
        it('should throw UnauthorizedError when refresh token is invalid', async () => {
            const oldRefreshToken = 'invalid-token';

            // Mock jwt.verify to throw an error (invalid token)
            mockJwtVerify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            // Expect UnauthorizedError to be thrown
            await expect(authService.refreshToken(oldRefreshToken)).rejects.toThrow(
                'Invalid refresh token',
            );

            // Assertions
            expect(mockJwtVerify).toHaveBeenCalledWith(
                'invalid-token',
                'test-jwt-refresh-secret',
            );
            expect(mockUserFindById).not.toHaveBeenCalled();
            expect(mockJwtSign).not.toHaveBeenCalled();
        });
    });

    describe('User not found', () => {
        it('should throw NotFoundError when user does not exist', async () => {
            const oldRefreshToken = 'old-refresh-token-123';

            const decodedToken = {
                id: '507f1f77bcf86cd799439011',
            };

            // Mock jwt.verify to return decoded token
            mockJwtVerify.mockReturnValue(decodedToken);

            // Mock User.findById to return null
            mockUserFindById.mockResolvedValue(null);

            // Expect NotFoundError to be thrown
            await expect(authService.refreshToken(oldRefreshToken)).rejects.toThrow(
                'User not found',
            );

            // Assertions
            expect(mockJwtVerify).toHaveBeenCalledWith(
                'old-refresh-token-123',
                'test-jwt-refresh-secret',
            );
            expect(mockUserFindById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
            expect(mockJwtSign).not.toHaveBeenCalled();
        });
    });
});

