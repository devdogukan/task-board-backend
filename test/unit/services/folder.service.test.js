import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock modules
vi.mock('#src/models/index.js', () => {
    const mockFolderFindById = vi.fn();
    const mockFolderFind = vi.fn();
    const mockFolderFindOne = vi.fn();
    const mockFolderFindByIdAndDelete = vi.fn();
    const mockProjectFind = vi.fn();
    const mockProjectDeleteMany = vi.fn();
    const mockTaskDeleteMany = vi.fn();
    const mockColumnDeleteMany = vi.fn();
    
    return {
        Folder: Object.assign(
            vi.fn().mockImplementation((data) => ({
                ...data,
                save: vi.fn().mockResolvedValue(data),
                populate: vi.fn().mockReturnThis(),
            })),
            {
                findById: mockFolderFindById,
                find: mockFolderFind,
                findOne: mockFolderFindOne,
                findByIdAndDelete: mockFolderFindByIdAndDelete,
            }
        ),
        Project: {
            find: mockProjectFind,
            deleteMany: mockProjectDeleteMany,
        },
        Task: {
            deleteMany: mockTaskDeleteMany,
        },
        Column: {
            deleteMany: mockColumnDeleteMany,
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
    BadRequestError: class BadRequestError extends Error {
        constructor(message) {
            super(message);
            this.name = 'BadRequestError';
        }
    },
    ConflictError: class ConflictError extends Error {
        constructor(message) {
            super(message);
            this.name = 'ConflictError';
        }
    },
}));

vi.mock('#src/config/database.js', () => ({
    withTransaction: async (callback) => {
        // Mock session object
        const mockSession = {};
        return await callback(mockSession);
    },
}));

// Import after mocks
import * as folderService from '#src/services/folder.service.js';
import { Folder, Project, Task, Column } from '#src/models/index.js';
import { NotFoundError, BadRequestError, ConflictError } from '#src/utils/errors/index.js';

// Access to mock functions
const mockFolderFindById = Folder.findById;
const mockFolderFind = Folder.find;
const mockFolderFindOne = Folder.findOne;
const mockFolderFindByIdAndDelete = Folder.findByIdAndDelete;
const mockProjectFind = Project.find;
const mockProjectDeleteMany = Project.deleteMany;
const mockTaskDeleteMany = Task.deleteMany;
const mockColumnDeleteMany = Column.deleteMany;

describe('Folder Service', () => {
    const userId = '507f1f77bcf86cd799439011';
    const folderId = '507f1f77bcf86cd799439012';
    const memberId = '507f1f77bcf86cd799439013';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createFolder', () => {
        it('should create a folder successfully', async () => {
            const folderData = {
                name: 'Test Folder',
                description: 'Test Description',
            };

            const mockFolder = {
                _id: folderId,
                ...folderData,
                owner: userId,
                members: [],
            };

            const folderInstance = {
                ...mockFolder,
                save: vi.fn().mockResolvedValue(mockFolder),
            };
            
            // Reset Folder mock to be a proper constructor
            Folder.mockImplementation(function(data) {
                return folderInstance;
            });
            
            const mockPopulateQuery = {
                populate: vi.fn().mockResolvedValue(mockFolder),
            };
            mockFolderFindById.mockReturnValue(mockPopulateQuery);

            const result = await folderService.createFolder(folderData, userId);

            expect(Folder).toHaveBeenCalledWith({
                ...folderData,
                owner: userId,
                members: [],
            });
            expect(folderInstance.save).toHaveBeenCalled();
        });
    });

    describe('getFoldersByUser', () => {
        it('should return folders where user is owner', async () => {
            const mockFolders = [
                {
                    _id: folderId,
                    name: 'Folder 1',
                    owner: userId,
                    members: [],
                },
            ];

            const mockQuery = {
                populate: vi.fn().mockReturnThis(),
                sort: vi.fn().mockResolvedValue(mockFolders),
            };

            mockFolderFind.mockReturnValue(mockQuery);

            const result = await folderService.getFoldersByUser(userId);

            expect(mockFolderFind).toHaveBeenCalledWith({
                $or: [{ owner: userId }, { members: userId }],
            });
            expect(result).toEqual(mockFolders);
        });

        it('should return folders where user is member', async () => {
            const mockFolders = [
                {
                    _id: folderId,
                    name: 'Folder 1',
                    owner: '507f1f77bcf86cd799439020',
                    members: [userId],
                },
            ];

            const mockQuery = {
                populate: vi.fn().mockReturnThis(),
                sort: vi.fn().mockResolvedValue(mockFolders),
            };

            mockFolderFind.mockReturnValue(mockQuery);

            const result = await folderService.getFoldersByUser(userId);

            expect(result).toEqual(mockFolders);
        });
    });

    describe('getFolderById', () => {
        it('should return folder when user is owner', async () => {
            const mockFolder = {
                _id: folderId,
                name: 'Test Folder',
                owner: userId,
                members: [],
            };

            const mockPopulate1 = vi.fn().mockReturnThis();
            const mockPopulate2 = vi.fn().mockResolvedValue(mockFolder);
            const mockQuery = {
                populate: mockPopulate1,
            };
            mockPopulate1.mockReturnValue({
                populate: mockPopulate2,
            });

            mockFolderFindOne.mockReturnValue(mockQuery);

            const result = await folderService.getFolderById(folderId, userId);

            expect(mockFolderFindOne).toHaveBeenCalledWith({
                _id: folderId,
                $or: [{ owner: userId }, { members: userId }],
            });
            expect(result).toEqual(mockFolder);
        });

        it('should throw NotFoundError when folder not found', async () => {
            const mockPopulate2 = vi.fn().mockResolvedValue(null);
            const mockPopulate1 = vi.fn().mockReturnValue({
                populate: mockPopulate2,
            });
            const mockQuery = {
                populate: mockPopulate1,
            };

            mockFolderFindOne.mockReturnValue(mockQuery);

            await expect(
                folderService.getFolderById(folderId, userId),
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe('updateFolder', () => {
        it('should update folder when user is owner', async () => {
            const mockFolder = {
                _id: folderId,
                name: 'Old Name',
                description: 'Old Description',
                owner: userId,
                members: [],
                save: vi.fn().mockResolvedValue(true),
            };

            const updatedFolder = {
                ...mockFolder,
                name: 'New Name',
            };
            const mockPopulate1 = vi.fn().mockReturnThis();
            const mockPopulate2 = vi.fn().mockResolvedValue(updatedFolder);
            
            mockFolderFindById
                .mockResolvedValueOnce(mockFolder)
                .mockReturnValueOnce({
                    populate: mockPopulate1,
                });
            mockPopulate1.mockReturnValue({
                populate: mockPopulate2,
            });

            const updateData = { name: 'New Name' };
            const result = await folderService.updateFolder(folderId, updateData, userId);

            expect(mockFolderFindById).toHaveBeenCalledWith(folderId);
            expect(mockFolder.save).toHaveBeenCalled();
        });

        it('should throw BadRequestError when user is not owner', async () => {
            const mockFolder = {
                _id: folderId,
                owner: '507f1f77bcf86cd799439020',
                members: [],
            };

            mockFolderFindById.mockResolvedValue(mockFolder);

            await expect(
                folderService.updateFolder(folderId, { name: 'New Name' }, userId),
            ).rejects.toThrow(BadRequestError);
        });

        it('should throw NotFoundError when folder not found', async () => {
            mockFolderFindById.mockResolvedValue(null);

            await expect(
                folderService.updateFolder(folderId, { name: 'New Name' }, userId),
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe('deleteFolder', () => {
        it('should delete folder and cascade delete projects, tasks, and columns when user is owner', async () => {
            const mockFolder = {
                _id: folderId,
                owner: userId,
                members: [],
            };

            const mockProjects = [
                { _id: '507f1f77bcf86cd799439020' },
                { _id: '507f1f77bcf86cd799439021' },
            ];
            const projectIds = mockProjects.map(p => p._id);

            mockFolderFindById.mockResolvedValue(mockFolder);
            const mockProjectFindQuery = {
                session: vi.fn().mockResolvedValue(mockProjects),
            };
            mockProjectFind.mockReturnValue(mockProjectFindQuery);
            mockTaskDeleteMany.mockResolvedValue({ deletedCount: 10 });
            mockColumnDeleteMany.mockResolvedValue({ deletedCount: 8 });
            mockProjectDeleteMany.mockResolvedValue({ deletedCount: 2 });
            mockFolderFindByIdAndDelete.mockResolvedValue(mockFolder);

            const result = await folderService.deleteFolder(folderId, userId);

            expect(mockFolderFindById).toHaveBeenCalledWith(folderId);
            expect(mockProjectFind).toHaveBeenCalledWith({ folderId: mockFolder._id });
            expect(mockTaskDeleteMany).toHaveBeenCalledWith(
                { projectId: { $in: projectIds } },
                expect.any(Object), // session parameter
            );
            expect(mockColumnDeleteMany).toHaveBeenCalledWith(
                { projectId: { $in: projectIds } },
                expect.any(Object), // session parameter
            );
            expect(mockProjectDeleteMany).toHaveBeenCalledWith(
                { folderId: mockFolder._id },
                expect.any(Object), // session parameter
            );
            expect(mockFolderFindByIdAndDelete).toHaveBeenCalledWith(
                folderId,
                expect.any(Object), // session parameter
            );
            expect(result).toEqual(mockFolder);
        });

        it('should throw BadRequestError when user is not owner', async () => {
            const mockFolder = {
                _id: folderId,
                owner: '507f1f77bcf86cd799439020',
            };

            mockFolderFindById.mockResolvedValue(mockFolder);

            await expect(
                folderService.deleteFolder(folderId, userId),
            ).rejects.toThrow(BadRequestError);
        });

        it('should throw NotFoundError when folder not found', async () => {
            mockFolderFindById.mockResolvedValue(null);

            await expect(
                folderService.deleteFolder(folderId, userId),
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe('addMemberToFolder', () => {
        it('should add member successfully', async () => {
            const mockFolder = {
                _id: folderId,
                owner: userId,
                members: [],
                save: vi.fn().mockResolvedValue(true),
            };

            const updatedFolder = {
                ...mockFolder,
                members: [memberId],
            };
            const mockPopulate1 = vi.fn().mockReturnThis();
            const mockPopulate2 = vi.fn().mockResolvedValue(updatedFolder);
            
            mockFolderFindById
                .mockResolvedValueOnce(mockFolder)
                .mockReturnValueOnce({
                    populate: mockPopulate1,
                });
            mockPopulate1.mockReturnValue({
                populate: mockPopulate2,
            });

            const result = await folderService.addMemberToFolder(folderId, memberId, userId);

            expect(mockFolderFindById).toHaveBeenCalledWith(folderId);
            expect(mockFolder.save).toHaveBeenCalled();
        });

        it('should throw BadRequestError when user is not owner', async () => {
            const mockFolder = {
                _id: folderId,
                owner: '507f1f77bcf86cd799439020',
                members: [],
            };

            mockFolderFindById.mockResolvedValue(mockFolder);

            await expect(
                folderService.addMemberToFolder(folderId, memberId, userId),
            ).rejects.toThrow(BadRequestError);
        });

        it('should throw ConflictError when member already exists', async () => {
            const mockFolder = {
                _id: folderId,
                owner: userId,
                members: [memberId],
            };

            mockFolderFindById.mockResolvedValue(mockFolder);

            await expect(
                folderService.addMemberToFolder(folderId, memberId, userId),
            ).rejects.toThrow(ConflictError);
        });

        it('should throw BadRequestError when trying to add owner as member', async () => {
            const mockFolder = {
                _id: folderId,
                owner: userId,
                members: [],
            };

            mockFolderFindById.mockResolvedValue(mockFolder);

            await expect(
                folderService.addMemberToFolder(folderId, userId, userId),
            ).rejects.toThrow(BadRequestError);
        });

        it('should throw NotFoundError when folder not found', async () => {
            mockFolderFindById.mockResolvedValue(null);

            await expect(
                folderService.addMemberToFolder(folderId, memberId, userId),
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe('removeMemberFromFolder', () => {
        it('should remove member successfully', async () => {
            const mockFolder = {
                _id: folderId,
                owner: userId,
                members: [memberId],
                save: vi.fn().mockResolvedValue(true),
            };

            const updatedFolder = {
                ...mockFolder,
                members: [],
            };
            const mockPopulate1 = vi.fn().mockReturnThis();
            const mockPopulate2 = vi.fn().mockResolvedValue(updatedFolder);
            
            mockFolderFindById
                .mockResolvedValueOnce(mockFolder)
                .mockReturnValueOnce({
                    populate: mockPopulate1,
                });
            mockPopulate1.mockReturnValue({
                populate: mockPopulate2,
            });

            const result = await folderService.removeMemberFromFolder(folderId, memberId, userId);

            expect(mockFolderFindById).toHaveBeenCalledWith(folderId);
            expect(mockFolder.save).toHaveBeenCalled();
        });

        it('should throw BadRequestError when user is not owner', async () => {
            const mockFolder = {
                _id: folderId,
                owner: '507f1f77bcf86cd799439020',
                members: [memberId],
            };

            mockFolderFindById.mockResolvedValue(mockFolder);

            await expect(
                folderService.removeMemberFromFolder(folderId, memberId, userId),
            ).rejects.toThrow(BadRequestError);
        });

        it('should throw NotFoundError when member does not exist', async () => {
            const mockFolder = {
                _id: folderId,
                owner: userId,
                members: [],
            };

            mockFolderFindById.mockResolvedValue(mockFolder);

            await expect(
                folderService.removeMemberFromFolder(folderId, memberId, userId),
            ).rejects.toThrow(NotFoundError);
        });

        it('should throw NotFoundError when folder not found', async () => {
            mockFolderFindById.mockResolvedValue(null);

            await expect(
                folderService.removeMemberFromFolder(folderId, memberId, userId),
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe('checkFolderAccess', () => {
        it('should return true when user is owner', async () => {
            const mockFolder = {
                _id: folderId,
                owner: userId,
                members: [],
            };

            mockFolderFindById.mockResolvedValue(mockFolder);

            const result = await folderService.checkFolderAccess(folderId, userId);

            expect(result).toBe(true);
        });

        it('should return true when user is member', async () => {
            const mockFolder = {
                _id: folderId,
                owner: '507f1f77bcf86cd799439020',
                members: [userId],
            };

            mockFolderFindById.mockResolvedValue(mockFolder);

            const result = await folderService.checkFolderAccess(folderId, userId);

            expect(result).toBe(true);
        });

        it('should return false when user has no access', async () => {
            const mockFolder = {
                _id: folderId,
                owner: '507f1f77bcf86cd799439020',
                members: ['507f1f77bcf86cd799439021'],
            };

            mockFolderFindById.mockResolvedValue(mockFolder);

            const result = await folderService.checkFolderAccess(folderId, userId);

            expect(result).toBe(false);
        });

        it('should throw NotFoundError when folder not found', async () => {
            mockFolderFindById.mockResolvedValue(null);

            await expect(
                folderService.checkFolderAccess(folderId, userId),
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe('checkFolderOwner', () => {
        it('should return true when user is owner', async () => {
            const mockFolder = {
                _id: folderId,
                owner: userId,
            };

            mockFolderFindById.mockResolvedValue(mockFolder);

            const result = await folderService.checkFolderOwner(folderId, userId);

            expect(result).toBe(true);
        });

        it('should return false when user is not owner', async () => {
            const mockFolder = {
                _id: folderId,
                owner: '507f1f77bcf86cd799439020',
            };

            mockFolderFindById.mockResolvedValue(mockFolder);

            const result = await folderService.checkFolderOwner(folderId, userId);

            expect(result).toBe(false);
        });

        it('should throw NotFoundError when folder not found', async () => {
            mockFolderFindById.mockResolvedValue(null);

            await expect(
                folderService.checkFolderOwner(folderId, userId),
            ).rejects.toThrow(NotFoundError);
        });
    });
});
