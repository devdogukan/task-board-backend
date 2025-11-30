import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock modules
vi.mock('#src/models/index.js', () => {
    const mockUserFindById = vi.fn();
    const mockUserFindByIdAndUpdate = vi.fn();
    const mockUserFindByIdAndDelete = vi.fn();
    const mockUserFind = vi.fn();
    
    return {
        User: {
            findById: mockUserFindById,
            findByIdAndUpdate: mockUserFindByIdAndUpdate,
            findByIdAndDelete: mockUserFindByIdAndDelete,
            find: mockUserFind,
        },
        __mocks: {
            userFindById: mockUserFindById,
            userFindByIdAndUpdate: mockUserFindByIdAndUpdate,
            userFindByIdAndDelete: mockUserFindByIdAndDelete,
            userFind: mockUserFind,
        },
    };
});

vi.mock('#src/utils/errors/index.js', () => ({
    NotFoundError: class NotFoundError extends Error {
        constructor(message) {
            super(message);
            this.name = 'NotFoundError';
        }
    },
}));

// Import after mocks
import * as userService from '#src/services/user.service.js';
import { User } from '#src/models/index.js';
import { NotFoundError } from '#src/utils/errors/index.js';

// Access to mock functions
const mockUserFindById = User.findById;
const mockUserFindByIdAndUpdate = User.findByIdAndUpdate;
const mockUserFindByIdAndDelete = User.findByIdAndDelete;
const mockUserFind = User.find;

describe('User Service', () => {
    const userId = '507f1f77bcf86cd799439011';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getUserById', () => {
        it('should return user when found', async () => {
            const mockUser = {
                _id: userId,
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
            };

            mockUserFindById.mockResolvedValue(mockUser);

            const result = await userService.getUserById(userId);

            expect(mockUserFindById).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockUser);
        });

        it('should throw NotFoundError when user not found', async () => {
            mockUserFindById.mockResolvedValue(null);

            await expect(userService.getUserById(userId)).rejects.toThrow(NotFoundError);
            expect(mockUserFindById).toHaveBeenCalledWith(userId);
        });
    });

    describe('updateUser', () => {
        it('should update user successfully', async () => {
            const updateData = {
                firstName: 'Jane',
                lastName: 'Smith',
            };

            const updatedUser = {
                _id: userId,
                email: 'test@example.com',
                ...updateData,
            };

            mockUserFindByIdAndUpdate.mockResolvedValue(updatedUser);

            const result = await userService.updateUser(userId, updateData);

            expect(mockUserFindByIdAndUpdate).toHaveBeenCalledWith(
                userId,
                { $set: updateData },
                { new: true, runValidators: true },
            );
            expect(result).toEqual(updatedUser);
        });

        it('should throw NotFoundError when user not found', async () => {
            const updateData = { firstName: 'Jane' };
            mockUserFindByIdAndUpdate.mockResolvedValue(null);

            await expect(userService.updateUser(userId, updateData)).rejects.toThrow(
                NotFoundError,
            );
        });
    });

    describe('deleteUser', () => {
        it('should delete user successfully', async () => {
            const mockUser = {
                _id: userId,
                email: 'test@example.com',
            };

            mockUserFindByIdAndDelete.mockResolvedValue(mockUser);

            const result = await userService.deleteUser(userId);

            expect(mockUserFindByIdAndDelete).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockUser);
        });

        it('should throw NotFoundError when user not found', async () => {
            mockUserFindByIdAndDelete.mockResolvedValue(null);

            await expect(userService.deleteUser(userId)).rejects.toThrow(NotFoundError);
        });
    });

    describe('getAllUsers', () => {
        it('should return all users without pagination', async () => {
            const mockUsers = [
                { _id: userId, email: 'test1@example.com' },
                { _id: '507f1f77bcf86cd799439012', email: 'test2@example.com' },
            ];

            mockUserFind.mockResolvedValue(mockUsers);

            const result = await userService.getAllUsers();

            expect(mockUserFind).toHaveBeenCalledWith({});
            expect(result).toEqual(mockUsers);
        });

        it('should return paginated users when page and limit provided', async () => {
            const mockUsers = [{ _id: userId, email: 'test@example.com' }];

            const mockLimit = vi.fn();
            const mockSkip = vi.fn();
            
            // Make the query object itself awaitable
            const mockQuery = {
                skip: mockSkip,
                limit: mockLimit,
                then: (resolve) => Promise.resolve(mockUsers).then(resolve),
            };
            
            // Chain the methods to return the query object
            mockSkip.mockReturnValue(mockQuery);
            mockLimit.mockReturnValue(mockQuery);

            mockUserFind.mockReturnValue(mockQuery);

            const result = await userService.getAllUsers({ page: 1, limit: 10 });

            expect(mockUserFind).toHaveBeenCalledWith({});
            expect(mockSkip).toHaveBeenCalledWith(0);
            expect(mockLimit).toHaveBeenCalledWith(10);
            expect(result).toEqual(mockUsers);
        });

        it('should calculate skip correctly for page 2', async () => {
            const mockUsers = [];

            const mockQuery = {
                skip: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue(mockUsers),
            };

            mockUserFind.mockReturnValue(mockQuery);

            await userService.getAllUsers({ page: 2, limit: 10 });

            expect(mockQuery.skip).toHaveBeenCalledWith(10);
            expect(mockQuery.limit).toHaveBeenCalledWith(10);
        });

        it('should handle empty queryParams', async () => {
            const mockUsers = [];

            mockUserFind.mockResolvedValue(mockUsers);

            const result = await userService.getAllUsers({});

            expect(result).toEqual(mockUsers);
        });
    });
});

