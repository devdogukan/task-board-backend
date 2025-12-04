import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock modules
vi.mock('#src/services/auth.service.js', () => {
    const mockRegister = vi.fn();
    const mockLogin = vi.fn();
    const mockRefreshToken = vi.fn();
    return {
        register: mockRegister,
        login: mockLogin,
        refreshToken: mockRefreshToken,
        __mocks: {
            register: mockRegister,
            login: mockLogin,
            refreshToken: mockRefreshToken,
        },
    };
});

vi.mock('#src/utils/response.util.js', () => {
    const mockSuccess = vi.fn();
    const mockError = vi.fn();
    return {
        default: {
            success: mockSuccess,
            error: mockError,
        },
        __mocks: {
            success: mockSuccess,
            error: mockError,
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
            NODE_ENV: 'test',
        },
    };
});

// Import after mocks
import { register, login, refreshToken, logout, getCurrentUser } from '#src/controllers/auth.controller.js';
import * as authService from '#src/services/auth.service.js';
import ApiResponse from '#src/utils/response.util.js';
import { parseExpirationToMs } from '#src/utils/time.util.js';

// Access to mock functions
const mockRegister = authService.register;
const mockLogin = authService.login;
const mockRefreshToken = authService.refreshToken;
const mockApiResponseSuccess = ApiResponse.success;
const mockParseJwtExpirationToMs = parseExpirationToMs;

describe('Auth Controller - register', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                password: 'password123',
            },
        };

        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        };

        next = vi.fn();

        // Reset mocks
        vi.clearAllMocks();
        mockRegister.mockClear();
        mockApiResponseSuccess.mockClear();
    });

    describe('Successful registration', () => {
        it('should register a new user successfully', async () => {
            const mockUser = {
                _id: '507f1f77bcf86cd799439011',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
            };

            const mockApiResponse = {
                send: vi.fn().mockReturnValue(undefined),
            };

            // Mock authService.register
            mockRegister.mockResolvedValue(mockUser);

            // Mock ApiResponse.success
            mockApiResponseSuccess.mockReturnValue(mockApiResponse);

            await register(req, res, next);

            // Assertions
            expect(mockRegister).toHaveBeenCalledWith({
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                password: 'password123',
            });

            expect(mockApiResponseSuccess).toHaveBeenCalledWith(
                201,
                'User registered successfully',
                mockUser,
            );

            expect(mockApiResponse.send).toHaveBeenCalledWith(res);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('Email already exists', () => {
        it('should call next with ConflictError when email already exists', async () => {
            const { ConflictError } = await import('#src/utils/errors/index.js');
            const conflictError = new ConflictError('User already exists');

            // Mock authService.register to throw ConflictError
            mockRegister.mockRejectedValue(conflictError);

            await register(req, res, next);

            // Assertions
            expect(mockRegister).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(conflictError);
            expect(mockApiResponseSuccess).not.toHaveBeenCalled();
        });
    });
});

describe('Auth Controller - login', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {
                email: 'test@example.com',
                password: 'password123',
            },
        };

        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
            cookie: vi.fn().mockReturnThis(),
        };

        next = vi.fn();

        // Reset mocks
        vi.clearAllMocks();
        mockLogin.mockClear();
        mockApiResponseSuccess.mockClear();
        mockParseJwtExpirationToMs.mockClear();
    });

    describe('Successful login', () => {
        it('should login a user successfully with valid credentials', async () => {
            const mockLoginResult = {
                user: {
                    _id: '507f1f77bcf86cd799439011',
                    email: 'test@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                },
                token: 'access-token-123',
                refreshToken: 'refresh-token-456',
            };

            const mockApiResponse = {
                send: vi.fn().mockReturnValue(undefined),
            };

            // Mock authService.login
            mockLogin.mockResolvedValue(mockLoginResult);

            // Mock parseExpirationToMs
            mockParseJwtExpirationToMs.mockReturnValue(3600000);

            // Mock ApiResponse.success
            mockApiResponseSuccess.mockReturnValue(mockApiResponse);

            await login(req, res, next);

            // Assertions
            expect(mockLogin).toHaveBeenCalledWith(
                'test@example.com',
                'password123',
            );

            // Verify cookie was set
            expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'refresh-token-456', {
                httpOnly: true,
                secure: false, // NODE_ENV is 'test'
                sameSite: 'strict',
                maxAge: 3600000,
            });

            // Verify ApiResponse.success was called with correct parameters
            expect(mockApiResponseSuccess).toHaveBeenCalledWith(
                200,
                'User logged in successfully',
                {
                    user: mockLoginResult.user,
                    token: 'access-token-123',
                },
            );

            expect(mockApiResponse.send).toHaveBeenCalledWith(res);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('User not found', () => {
        it('should call next with BadRequestError when user does not exist', async () => {
            const { BadRequestError } = await import('#src/utils/errors/index.js');
            const badRequestError = new BadRequestError('Invalid email or password');

            // Mock authService.login to throw BadRequestError
            mockLogin.mockRejectedValue(badRequestError);

            await login(req, res, next);

            // Assertions
            expect(mockLogin).toHaveBeenCalledWith(
                'test@example.com',
                'password123',
            );
            expect(next).toHaveBeenCalledWith(badRequestError);
            expect(mockApiResponseSuccess).not.toHaveBeenCalled();
            expect(res.cookie).not.toHaveBeenCalled();
        });
    });

    describe('Invalid password', () => {
        it('should call next with BadRequestError when password is incorrect', async () => {
            const { BadRequestError } = await import('#src/utils/errors/index.js');
            const badRequestError = new BadRequestError('Invalid email or password');

            // Mock authService.login to throw BadRequestError
            mockLogin.mockRejectedValue(badRequestError);

            await login(req, res, next);

            // Assertions
            expect(mockLogin).toHaveBeenCalledWith(
                'test@example.com',
                'password123',
            );
            expect(next).toHaveBeenCalledWith(badRequestError);
            expect(mockApiResponseSuccess).not.toHaveBeenCalled();
            expect(res.cookie).not.toHaveBeenCalled();
        });
    });
});

describe('Auth Controller - refreshToken', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            cookies: {
                refreshToken: 'old-refresh-token-123',
            },
        };

        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
            cookie: vi.fn().mockReturnThis(),
        };

        next = vi.fn();

        // Reset mocks
        vi.clearAllMocks();
        mockRefreshToken.mockClear();
        mockApiResponseSuccess.mockClear();
        mockParseJwtExpirationToMs.mockClear();
    });

    describe('Successful token refresh', () => {
        it('should refresh tokens successfully with valid refresh token', async () => {
            const mockRefreshResult = {
                user: {
                    _id: '507f1f77bcf86cd799439011',
                    email: 'test@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                },
                token: 'new-access-token-123',
                refreshToken: 'new-refresh-token-456',
            };

            const mockApiResponse = {
                send: vi.fn().mockReturnValue(undefined),
            };

            // Mock authService.refreshToken
            mockRefreshToken.mockResolvedValue(mockRefreshResult);

            // Mock parseExpirationToMs
            mockParseJwtExpirationToMs.mockReturnValue(3600000);

            // Mock ApiResponse.success
            mockApiResponseSuccess.mockReturnValue(mockApiResponse);

            await refreshToken(req, res, next);

            // Assertions
            expect(mockRefreshToken).toHaveBeenCalledWith('old-refresh-token-123');

            // Verify cookie was set with new refresh token
            expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'new-refresh-token-456', {
                httpOnly: true,
                secure: false, // NODE_ENV is 'test'
                sameSite: 'strict',
                maxAge: 3600000,
            });

            // Verify ApiResponse.success was called with correct parameters
            expect(mockApiResponseSuccess).toHaveBeenCalledWith(
                200,
                'Token refreshed successfully',
                {
                    user: {
                        _id: '507f1f77bcf86cd799439011',
                        email: 'test@example.com',
                        firstName: 'John',
                        lastName: 'Doe',
                    },
                    token: 'new-access-token-123',
                },
            );

            expect(mockApiResponse.send).toHaveBeenCalledWith(res);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('Refresh token missing', () => {
        it('should call next with UnauthorizedError when refresh token is missing', async () => {
            req.cookies = {};

            const { UnauthorizedError } = await import('#src/utils/errors/index.js');
            const unauthorizedError = new UnauthorizedError('Refresh token is not provided');

            // Mock authService.refreshToken to throw UnauthorizedError
            mockRefreshToken.mockRejectedValue(unauthorizedError);

            await refreshToken(req, res, next);

            // Assertions
            expect(mockRefreshToken).toHaveBeenCalledWith(undefined);
            expect(next).toHaveBeenCalledWith(unauthorizedError);
            expect(mockApiResponseSuccess).not.toHaveBeenCalled();
            expect(res.cookie).not.toHaveBeenCalled();
        });
    });

    describe('Invalid refresh token', () => {
        it('should call next with UnauthorizedError when refresh token is invalid', async () => {
            const { UnauthorizedError } = await import('#src/utils/errors/index.js');
            const unauthorizedError = new UnauthorizedError('Invalid refresh token');

            // Mock authService.refreshToken to throw UnauthorizedError
            mockRefreshToken.mockRejectedValue(unauthorizedError);

            await refreshToken(req, res, next);

            // Assertions
            expect(mockRefreshToken).toHaveBeenCalledWith('old-refresh-token-123');
            expect(next).toHaveBeenCalledWith(unauthorizedError);
            expect(mockApiResponseSuccess).not.toHaveBeenCalled();
            expect(res.cookie).not.toHaveBeenCalled();
        });
    });

    describe('User not found', () => {
        it('should call next with NotFoundError when user does not exist', async () => {
            const { NotFoundError } = await import('#src/utils/errors/index.js');
            const notFoundError = new NotFoundError('User not found');

            // Mock authService.refreshToken to throw NotFoundError
            mockRefreshToken.mockRejectedValue(notFoundError);

            await refreshToken(req, res, next);

            // Assertions
            expect(mockRefreshToken).toHaveBeenCalledWith('old-refresh-token-123');
            expect(next).toHaveBeenCalledWith(notFoundError);
            expect(mockApiResponseSuccess).not.toHaveBeenCalled();
            expect(res.cookie).not.toHaveBeenCalled();
        });
    });
});

describe('Auth Controller - logout', () => {
    let req, res;

    beforeEach(() => {
        req = {};

        res = {
            clearCookie: vi.fn().mockReturnThis(),
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        };

        // Reset mocks
        vi.clearAllMocks();
        mockApiResponseSuccess.mockClear();
    });

    describe('Successful logout', () => {
        it('should logout a user successfully', async () => {
            const mockApiResponse = {
                send: vi.fn().mockReturnValue(undefined),
            };

            // Mock ApiResponse.success
            mockApiResponseSuccess.mockReturnValue(mockApiResponse);

            await logout(req, res);

            // Assertions
            expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
            expect(mockApiResponseSuccess).toHaveBeenCalledWith(
                200,
                'User logged out successfully',
            );
            expect(mockApiResponse.send).toHaveBeenCalledWith(res);
        });
    });
});

describe('Auth Controller - getCurrentUser', () => {
    let req, res;

    beforeEach(() => {
        req = {
            user: {
                _id: '507f1f77bcf86cd799439011',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                avatar: null,
            },
        };

        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        };

        // Reset mocks
        vi.clearAllMocks();
        mockApiResponseSuccess.mockClear();
    });

    describe('Successful fetch', () => {
        it('should fetch current user successfully', async () => {
            const mockApiResponse = {
                send: vi.fn().mockReturnValue(undefined),
            };

            // Mock ApiResponse.success
            mockApiResponseSuccess.mockReturnValue(mockApiResponse);

            await getCurrentUser(req, res);

            // Assertions
            expect(mockApiResponseSuccess).toHaveBeenCalledWith(
                200,
                'User fetched successfully',
                req.user,
            );
            expect(mockApiResponse.send).toHaveBeenCalledWith(res);
        });
    });
});
