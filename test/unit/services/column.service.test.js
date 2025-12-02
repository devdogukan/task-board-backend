import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock modules
vi.mock('#src/models/index.js', () => {
    const mockColumnFindById = vi.fn();
    const mockColumnFind = vi.fn();
    const mockColumnFindOne = vi.fn();
    const mockColumnFindByIdAndDelete = vi.fn();
    const mockColumnUpdateMany = vi.fn();
    
    const mockProjectFindById = vi.fn();
    
    const mockTaskUpdateMany = vi.fn().mockReturnValue({
        session: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
    });
    const mockTaskDeleteMany = vi.fn().mockReturnValue({
        session: vi.fn().mockResolvedValue({ deletedCount: 1 }),
    });
    
    class MockColumn {
        constructor(data) {
            Object.assign(this, data);
            this.save = vi.fn().mockResolvedValue(this);
            this.populate = vi.fn().mockReturnThis();
        }
    }
    
    MockColumn.findById = mockColumnFindById;
    MockColumn.find = mockColumnFind;
    MockColumn.findOne = mockColumnFindOne;
    MockColumn.findByIdAndDelete = mockColumnFindByIdAndDelete;
    MockColumn.updateMany = vi.fn().mockReturnValue({
        session: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
    });
    
    return {
        Column: MockColumn,
        Project: {
            findById: mockProjectFindById,
        },
        Task: {
            updateMany: mockTaskUpdateMany,
            deleteMany: mockTaskDeleteMany,
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
}));

vi.mock('#src/services/project.service.js', () => {
    const mockValidateProjectAccess = vi.fn();
    return {
        validateProjectAccess: mockValidateProjectAccess,
        __mocks: {
            validateProjectAccess: mockValidateProjectAccess,
        },
    };
});

vi.mock('#src/config/database.js', () => ({
    withTransaction: async (callback) => {
        // Mock session object
        const mockSession = {};
        return await callback(mockSession);
    },
}));

// Import after mocks
import * as columnService from '#src/services/column.service.js';
import { Column, Project, Task } from '#src/models/index.js';
import { NotFoundError, BadRequestError } from '#src/utils/errors/index.js';
import * as projectService from '#src/services/project.service.js';

// Access to mock functions
const mockColumnFindById = Column.findById;
const mockColumnFind = Column.find;
const mockColumnFindOne = Column.findOne;
const mockColumnFindByIdAndDelete = Column.findByIdAndDelete;
const mockColumnUpdateMany = Column.updateMany;
const mockProjectFindById = Project.findById;
const mockTaskUpdateMany = Task.updateMany;
const mockTaskDeleteMany = Task.deleteMany;
const mockValidateProjectAccess = projectService.validateProjectAccess;

describe('Column Service', () => {
    const userId = '507f1f77bcf86cd799439011';
    const folderId = '507f1f77bcf86cd799439012';
    const projectId = '507f1f77bcf86cd799439013';
    const columnId = '507f1f77bcf86cd799439014';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createColumn', () => {
        it('should create column successfully', async () => {
            const projectData = {
                _id: projectId,
                folderId,
                owner: userId,
                members: [],
            };

            const folderData = {
                _id: folderId,
                owner: userId,
                members: [],
            };

            const columnData = { name: 'Test Column' };

            mockValidateProjectAccess.mockResolvedValue({ project: projectData });
            
            // Mock chainable query for findOne().sort().limit()
            const mockQuery = {
                sort: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue(null),
            };
            mockColumnFindOne.mockReturnValue(mockQuery);
            
            const mockPopulate = vi.fn().mockResolvedValue({
                _id: columnId,
                ...columnData,
                projectId,
                orderIndex: 0,
            });
            mockColumnFindById.mockReturnValue({
                populate: mockPopulate,
            });

            const result = await columnService.createColumn(projectId, columnData, userId);

            // Column is a class, so we verify by checking that findById was called
            expect(mockColumnFindById).toHaveBeenCalled();
        });

        it('should throw NotFoundError when project not found', async () => {
            mockValidateProjectAccess.mockRejectedValue(new NotFoundError('Project not found'));

            await expect(
                columnService.createColumn(projectId, { name: 'Test' }, userId),
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe('getColumnsByProject', () => {
        it('should return columns when user has access', async () => {
            const projectData = {
                _id: projectId,
                folderId,
                owner: userId,
            };

            const folderData = {
                _id: folderId,
                owner: userId,
                members: [],
            };

            const mockColumns = [
                { _id: columnId, name: 'Column 1', projectId, orderIndex: 0 },
            ];

            mockValidateProjectAccess.mockResolvedValue({ project: projectData });
            const mockQuery = {
                populate: vi.fn().mockReturnThis(),
                sort: vi.fn().mockResolvedValue(mockColumns),
            };
            mockColumnFind.mockReturnValue(mockQuery);

            const result = await columnService.getColumnsByProject(projectId, userId);

            expect(result).toEqual(mockColumns);
        });
    });

    describe('getColumnById', () => {
        it('should return column when user has access', async () => {
            const columnData = {
                _id: columnId,
                projectId: { _id: projectId },
            };

            const projectData = {
                _id: projectId,
                folderId,
                owner: userId,
            };

            const folderData = {
                _id: folderId,
                owner: userId,
                members: [],
            };

            const mockPopulate = vi.fn().mockResolvedValue(columnData);
            mockColumnFindById.mockReturnValue({
                populate: mockPopulate,
            });
            mockValidateProjectAccess.mockResolvedValue({ project: projectData });

            const result = await columnService.getColumnById(columnId, userId);

            expect(result).toEqual(columnData);
        });

        it('should throw NotFoundError when column not found', async () => {
            const mockPopulate = vi.fn().mockResolvedValue(null);
            mockColumnFindById.mockReturnValue({
                populate: mockPopulate,
            });

            await expect(
                columnService.getColumnById(columnId, userId),
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe('updateColumn', () => {
        it('should update column when user has access', async () => {
            const columnData = {
                _id: columnId,
                projectId,
                name: 'Old Name',
                save: vi.fn().mockResolvedValue(true),
            };

            const projectData = {
                _id: projectId,
                folderId,
                owner: userId,
            };

            const folderData = {
                _id: folderId,
                owner: userId,
                members: [],
            };

            mockColumnFindById
                .mockResolvedValueOnce(columnData)
                .mockReturnValueOnce({
                    populate: vi.fn().mockResolvedValue({
                        ...columnData,
                        name: 'New Name',
                    }),
                });
            mockValidateProjectAccess.mockResolvedValue({ project: projectData });

            const result = await columnService.updateColumn(
                columnId,
                { name: 'New Name' },
                userId,
            );

            expect(columnData.save).toHaveBeenCalled();
        });
    });

    describe('deleteColumn', () => {
        it('should delete column and move tasks to other column', async () => {
            const columnData = {
                _id: columnId,
                projectId,
                orderIndex: 0,
            };

            const otherColumn = {
                _id: '507f1f77bcf86cd799439015',
                projectId,
                orderIndex: 1,
            };

            const projectData = {
                _id: projectId,
                folderId,
                owner: userId,
            };

            const folderData = {
                _id: folderId,
                owner: userId,
                members: [],
            };

            mockColumnFindById.mockResolvedValue(columnData);
            mockValidateProjectAccess.mockResolvedValue({ project: projectData });
            const mockQuery = {
                sort: vi.fn().mockResolvedValue([otherColumn]),
            };
            mockColumnFind.mockReturnValue(mockQuery);
            mockColumnFindByIdAndDelete.mockReturnValue({
                session: vi.fn().mockResolvedValue(columnData),
            });

            const result = await columnService.deleteColumn(columnId, userId);

            expect(mockTaskUpdateMany).toHaveBeenCalled();
            expect(mockColumnFindByIdAndDelete).toHaveBeenCalledWith(columnId);
            expect(result).toEqual(columnData);
        });

        it('should delete tasks when no other columns exist', async () => {
            const columnData = {
                _id: columnId,
                projectId,
            };

            const projectData = {
                _id: projectId,
                folderId,
                owner: userId,
            };

            const folderData = {
                _id: folderId,
                owner: userId,
                members: [],
            };

            mockColumnFindById.mockResolvedValue(columnData);
            mockValidateProjectAccess.mockResolvedValue({ project: projectData });
            const mockQuery = {
                sort: vi.fn().mockResolvedValue([]),
            };
            mockColumnFind.mockReturnValue(mockQuery);
            mockColumnFindByIdAndDelete.mockReturnValue({
                session: vi.fn().mockResolvedValue(columnData),
            });

            const result = await columnService.deleteColumn(columnId, userId);

            expect(mockTaskDeleteMany).toHaveBeenCalled();
            expect(result).toEqual(columnData);
        });
    });

    describe('reorderColumn', () => {
        it('should reorder column successfully', async () => {
            const columnData = {
                _id: columnId,
                projectId,
                orderIndex: 0,
                save: vi.fn().mockResolvedValue(true),
            };

            const projectData = {
                _id: projectId,
                folderId,
                owner: userId,
            };

            const folderData = {
                _id: folderId,
                owner: userId,
                members: [],
            };

            const columns = [
                { _id: columnId, orderIndex: 0 },
                { _id: '507f1f77bcf86cd799439015', orderIndex: 1 },
            ];

            const mockPopulateWithSession = vi.fn().mockResolvedValue({
                ...columnData,
                orderIndex: 1,
            });
            const mockPopulate = vi.fn().mockReturnValue({
                session: mockPopulateWithSession,
            });
            mockColumnFindById
                .mockResolvedValueOnce(columnData)
                .mockReturnValueOnce({
                    populate: mockPopulate,
                });
            mockValidateProjectAccess.mockResolvedValue({ project: projectData });
            const mockQuery = {
                sort: vi.fn().mockResolvedValue(columns),
            };
            mockColumnFind.mockReturnValue(mockQuery);

            const result = await columnService.reorderColumn(columnId, 1, userId);

            expect(columnData.save).toHaveBeenCalled();
        });

        it('should throw BadRequestError for invalid order index', async () => {
            const columnData = {
                _id: columnId,
                projectId,
                orderIndex: 0,
            };

            const projectData = {
                _id: projectId,
                folderId,
                owner: userId,
            };

            const folderData = {
                _id: folderId,
                owner: userId,
                members: [],
            };

            const columns = [{ _id: columnId, orderIndex: 0 }];

            mockColumnFindById.mockResolvedValue(columnData);
            mockValidateProjectAccess.mockResolvedValue({ project: projectData });
            const mockQuery = {
                sort: vi.fn().mockResolvedValue(columns),
            };
            mockColumnFind.mockReturnValue(mockQuery);

            await expect(
                columnService.reorderColumn(columnId, 5, userId),
            ).rejects.toThrow(BadRequestError);
        });
    });
});

