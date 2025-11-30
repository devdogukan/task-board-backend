import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock modules
vi.mock('#src/services/user.service.js', () => {
    const mockGetUserById = vi.fn();
    const mockUpdateUser = vi.fn();
    const mockDeleteUser = vi.fn();
    const mockGetAllUsers = vi.fn();
    return {
        getUserById: mockGetUserById,
        updateUser: mockUpdateUser,
        deleteUser: mockDeleteUser,
        getAllUsers: mockGetAllUsers,
        __mocks: {
            getUserById: mockGetUserById,
            updateUser: mockUpdateUser,
            deleteUser: mockDeleteUser,
            getAllUsers: mockGetAllUsers,
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

// Import after mocks
import * as userController from '#src/controllers/user.controller.js';
import * as userService from '#src/services/user.service.js';
import ApiResponse from '#src/utils/response.util.js';

// Access to mock functions
const mockGetUserById = userService.getUserById;
const mockUpdateUser = userService.updateUser;
const mockDeleteUser = userService.deleteUser;
const mockGetAllUsers = userService.getAllUsers;
const mockApiResponseSuccess = ApiResponse.success;

describe('User Controller - getUserById', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: {
                id: '507f1f77bcf86cd799439011',
            },
        };

        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        };

        // Reset mocks
        vi.clearAllMocks();
        mockGetUserById.mockClear();
        mockApiResponseSuccess.mockClear();
    });

    describe('Successful fetch', () => {
        it('should fetch a user by ID successfully', async () => {
            const mockUser = {
                _id: '507f1f77bcf86cd799439011',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                avatar: null,
            };

            const mockApiResponse = {
                send: vi.fn().mockReturnValue(undefined),
            };

            // Mock userService.getUserById
            mockGetUserById.mockResolvedValue(mockUser);

            // Mock ApiResponse.success
            mockApiResponseSuccess.mockReturnValue(mockApiResponse);

            await userController.getUserById(req, res);

            // Assertions
            expect(mockGetUserById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
            expect(mockApiResponseSuccess).toHaveBeenCalledWith(
                200,
                'User fetched successfully',
                mockUser,
            );
            expect(mockApiResponse.send).toHaveBeenCalledWith(res);
        });
    });
});

describe('User Controller - updateUser', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: {
                id: '507f1f77bcf86cd799439011',
            },
            body: {
                firstName: 'Jane',
                lastName: 'Smith',
            },
        };

        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        };

        // Reset mocks
        vi.clearAllMocks();
        mockUpdateUser.mockClear();
        mockApiResponseSuccess.mockClear();
    });

    describe('Successful update', () => {
        it('should update a user successfully', async () => {
            const updatedUser = {
                _id: '507f1f77bcf86cd799439011',
                email: 'test@example.com',
                firstName: 'Jane',
                lastName: 'Smith',
                avatar: null,
            };

            const mockApiResponse = {
                send: vi.fn().mockReturnValue(undefined),
            };

            // Mock userService.updateUser
            mockUpdateUser.mockResolvedValue(updatedUser);

            // Mock ApiResponse.success
            mockApiResponseSuccess.mockReturnValue(mockApiResponse);

            await userController.updateUser(req, res);

            // Assertions
            expect(mockUpdateUser).toHaveBeenCalledWith(
                '507f1f77bcf86cd799439011',
                {
                    firstName: 'Jane',
                    lastName: 'Smith',
                },
            );
            expect(mockApiResponseSuccess).toHaveBeenCalledWith(
                200,
                'User updated successfully',
                updatedUser,
            );
            expect(mockApiResponse.send).toHaveBeenCalledWith(res);
        });
    });
});

describe('User Controller - deleteUser', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: {
                id: '507f1f77bcf86cd799439011',
            },
        };

        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        };

        // Reset mocks
        vi.clearAllMocks();
        mockDeleteUser.mockClear();
        mockApiResponseSuccess.mockClear();
    });

    describe('Successful deletion', () => {
        it('should delete a user successfully', async () => {
            const mockApiResponse = {
                send: vi.fn().mockReturnValue(undefined),
            };

            // Mock userService.deleteUser
            mockDeleteUser.mockResolvedValue(undefined);

            // Mock ApiResponse.success
            mockApiResponseSuccess.mockReturnValue(mockApiResponse);

            await userController.deleteUser(req, res);

            // Assertions
            expect(mockDeleteUser).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
            expect(mockApiResponseSuccess).toHaveBeenCalledWith(
                200,
                'User deleted successfully',
            );
            expect(mockApiResponse.send).toHaveBeenCalledWith(res);
        });
    });
});

describe('User Controller - getAllUsers', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            validatedQuery: {},
            query: {},
        };

        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        };

        next = vi.fn();

        // Reset mocks
        vi.clearAllMocks();
        mockGetAllUsers.mockClear();
        mockApiResponseSuccess.mockClear();
    });

    describe('Successful fetch', () => {
        it('should fetch all users successfully', async () => {
            const mockUsers = [
                {
                    _id: '507f1f77bcf86cd799439011',
                    email: 'test1@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                },
                {
                    _id: '507f1f77bcf86cd799439012',
                    email: 'test2@example.com',
                    firstName: 'Jane',
                    lastName: 'Smith',
                },
            ];

            const mockApiResponse = {
                send: vi.fn().mockReturnValue(undefined),
            };

            // Mock userService.getAllUsers
            mockGetAllUsers.mockResolvedValue(mockUsers);

            // Mock ApiResponse.success
            mockApiResponseSuccess.mockReturnValue(mockApiResponse);

            await userController.getAllUsers(req, res, next);

            // Assertions
            expect(mockGetAllUsers).toHaveBeenCalledWith({});
            expect(mockApiResponseSuccess).toHaveBeenCalledWith(
                200,
                'Users fetched successfully',
                mockUsers,
            );
            expect(mockApiResponse.send).toHaveBeenCalledWith(res);
            expect(next).not.toHaveBeenCalled();
        });

        it('should pass query parameters to service', async () => {
            req.validatedQuery = { page: 1, limit: 10 };

            const mockUsers = [];
            const mockApiResponse = {
                send: vi.fn().mockReturnValue(undefined),
            };

            mockGetAllUsers.mockResolvedValue(mockUsers);
            mockApiResponseSuccess.mockReturnValue(mockApiResponse);

            await userController.getAllUsers(req, res, next);

            expect(mockGetAllUsers).toHaveBeenCalledWith({ page: 1, limit: 10 });
        });

        it('should use req.query when validatedQuery is not available', async () => {
            req.validatedQuery = undefined;
            req.query = { page: 2, limit: 20 };

            const mockUsers = [];
            const mockApiResponse = {
                send: vi.fn().mockReturnValue(undefined),
            };

            mockGetAllUsers.mockResolvedValue(mockUsers);
            mockApiResponseSuccess.mockReturnValue(mockApiResponse);

            await userController.getAllUsers(req, res, next);

            expect(mockGetAllUsers).toHaveBeenCalledWith({ page: 2, limit: 20 });
            expect(mockApiResponse.send).toHaveBeenCalledWith(res);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('Error handling', () => {
        it('should call next with error when getAllUsers throws an error', async () => {
            const testError = new Error('Database error');
            mockGetAllUsers.mockRejectedValue(testError);

            await userController.getAllUsers(req, res, next);

            expect(mockGetAllUsers).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(testError);
            expect(mockApiResponseSuccess).not.toHaveBeenCalled();
        });
    });
});

