import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock modules
vi.mock('#src/models/index.js', () => {
    const mockTaskFindById = vi.fn();
    const mockTaskFind = vi.fn();
    const mockTaskFindOne = vi.fn();
    const mockTaskFindByIdAndDelete = vi.fn();
    const mockTaskUpdateMany = vi.fn().mockReturnValue({
        session: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
    });
    
    const mockProjectFindById = vi.fn();
    
    const mockColumnFindById = vi.fn();
    
    const mockFolderFindById = vi.fn();
    
    class MockTask {
        constructor(data) {
            Object.assign(this, data);
            this.save = vi.fn().mockResolvedValue(this);
            this.populate = vi.fn().mockReturnThis();
        }
    }
    
    MockTask.findById = mockTaskFindById;
    MockTask.find = mockTaskFind;
    MockTask.findOne = mockTaskFindOne;
    MockTask.findByIdAndDelete = mockTaskFindByIdAndDelete;
    MockTask.updateMany = mockTaskUpdateMany;
    
    const mockUserFindById = vi.fn();
    
    return {
        Task: MockTask,
        Project: {
            findById: mockProjectFindById,
        },
        Column: {
            findById: mockColumnFindById,
        },
        Folder: {
            findById: mockFolderFindById,
        },
        User: {
            findById: mockUserFindById,
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
import * as taskService from '#src/services/task.service.js';
import { Task, Project, Column, Folder, User } from '#src/models/index.js';
import { NotFoundError, BadRequestError } from '#src/utils/errors/index.js';
import * as projectService from '#src/services/project.service.js';

// Access to mock functions
const mockTaskFindById = Task.findById;
const mockTaskFind = Task.find;
const mockTaskFindOne = Task.findOne;
const mockTaskFindByIdAndDelete = Task.findByIdAndDelete;
const mockTaskUpdateMany = Task.updateMany;
const mockProjectFindById = Project.findById;
const mockColumnFindById = Column.findById;
const mockFolderFindById = Folder.findById;
const mockUserFindById = User.findById;
const mockValidateProjectAccess = projectService.validateProjectAccess;

describe('Task Service', () => {
    const userId = '507f1f77bcf86cd799439011';
    const folderId = '507f1f77bcf86cd799439012';
    const projectId = '507f1f77bcf86cd799439013';
    const columnId = '507f1f77bcf86cd799439014';
    const taskId = '507f1f77bcf86cd799439015';
    const assigneeId = '507f1f77bcf86cd799439016';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createTask', () => {
        it('should create task successfully', async () => {
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

            const columnData = {
                _id: columnId,
                projectId,
            };

            const taskData = {
                columnId,
                title: 'Test Task',
                description: 'Test Description',
            };

            mockValidateProjectAccess.mockResolvedValue({ project: projectData });
            mockColumnFindById.mockResolvedValue(columnData);
            
            const mockTaskFindOneQuery = {
                sort: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue(null),
            };
            mockTaskFindOne.mockReturnValue(mockTaskFindOneQuery);
            
            const mockPopulate3 = vi.fn().mockResolvedValue({
                _id: taskId,
                ...taskData,
            });
            const mockPopulate2 = vi.fn().mockReturnValue({
                populate: mockPopulate3,
            });
            const mockPopulate1 = vi.fn().mockReturnValue({
                populate: mockPopulate2,
            });
            mockTaskFindById.mockReturnValue({
                populate: mockPopulate1,
            });

            const result = await taskService.createTask(projectId, taskData, userId);

            // Task is a class, so we check if it was instantiated by checking the mock
            expect(mockTaskFindById).toHaveBeenCalled();
        });

        it('should throw BadRequestError when column does not belong to project', async () => {
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

            const columnData = {
                _id: columnId,
                projectId: '507f1f77bcf86cd799439020',
            };

            mockValidateProjectAccess.mockResolvedValue({ project: projectData });
            mockColumnFindById.mockResolvedValue(columnData);

            await expect(
                taskService.createTask(projectId, { columnId, title: 'Test', description: 'Test' }, userId),
            ).rejects.toThrow(BadRequestError);
        });
    });

    describe('getTasksByProject', () => {
        it('should return tasks with query filters', async () => {
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

            const mockTasks = [
                { _id: taskId, title: 'Task 1', projectId, columnId },
            ];

            mockValidateProjectAccess.mockResolvedValue({ project: projectData });
            const mockQuery = {
                populate: vi.fn().mockReturnThis(),
                sort: vi.fn().mockResolvedValue(mockTasks),
            };
            mockTaskFind.mockReturnValue(mockQuery);

            const result = await taskService.getTasksByProject(
                projectId,
                { columnId, priority: 'high' },
                userId,
            );

            expect(result).toEqual(mockTasks);
        });

        it('should filter by dueDate range', async () => {
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

            const mockTasks = [];

            mockValidateProjectAccess.mockResolvedValue({ project: projectData });
            const mockQuery = {
                populate: vi.fn().mockReturnThis(),
                sort: vi.fn().mockResolvedValue(mockTasks),
            };
            mockTaskFind.mockReturnValue(mockQuery);

            const result = await taskService.getTasksByProject(
                projectId,
                {
                    dueDateFrom: '2024-01-01',
                    dueDateTo: '2024-12-31',
                },
                userId,
            );

            expect(result).toEqual(mockTasks);
        });
    });

    describe('getTaskById', () => {
        it('should return task when user has access', async () => {
            const taskData = {
                _id: taskId,
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

            const mockPopulate3 = vi.fn().mockResolvedValue(taskData);
            const mockPopulate2 = vi.fn().mockReturnValue({
                populate: mockPopulate3,
            });
            const mockPopulate1 = vi.fn().mockReturnValue({
                populate: mockPopulate2,
            });
            mockTaskFindById.mockReturnValue({
                populate: mockPopulate1,
            });
            mockValidateProjectAccess.mockResolvedValue({ project: projectData });

            const result = await taskService.getTaskById(taskId, userId);

            expect(result).toEqual(taskData);
        });

        it('should throw NotFoundError when task not found', async () => {
            const mockPopulate3 = vi.fn().mockResolvedValue(null);
            const mockPopulate2 = vi.fn().mockReturnValue({
                populate: mockPopulate3,
            });
            const mockPopulate1 = vi.fn().mockReturnValue({
                populate: mockPopulate2,
            });
            mockTaskFindById.mockReturnValue({
                populate: mockPopulate1,
            });

            await expect(
                taskService.getTaskById(taskId, userId),
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe('updateTask', () => {
        it('should update task when user has access', async () => {
            const taskData = {
                _id: taskId,
                projectId,
                columnId,
                title: 'Old Title',
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

            const updatedTask = {
                ...taskData,
                title: 'New Title',
            };
            const mockPopulate3 = vi.fn().mockResolvedValue(updatedTask);
            const mockPopulate2 = vi.fn().mockReturnValue({
                populate: mockPopulate3,
            });
            const mockPopulate1 = vi.fn().mockReturnValue({
                populate: mockPopulate2,
            });
            
            mockTaskFindById
                .mockResolvedValueOnce(taskData)
                .mockReturnValueOnce({
                    populate: mockPopulate1,
                });
            mockValidateProjectAccess.mockResolvedValue({ project: projectData });

            const result = await taskService.updateTask(
                taskId,
                { title: 'New Title' },
                userId,
            );

            expect(taskData.save).toHaveBeenCalled();
        });

        it('should validate columnId when updating', async () => {
            const taskData = {
                _id: taskId,
                projectId,
                columnId,
                save: vi.fn().mockResolvedValue(true),
            };

            const newColumnId = '507f1f77bcf86cd799439017';
            const newColumnData = {
                _id: newColumnId,
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

            const updatedTask = {
                ...taskData,
                columnId: newColumnId,
            };
            const mockPopulate3 = vi.fn().mockResolvedValue(updatedTask);
            const mockPopulate2 = vi.fn().mockReturnValue({
                populate: mockPopulate3,
            });
            const mockPopulate1 = vi.fn().mockReturnValue({
                populate: mockPopulate2,
            });
            
            mockTaskFindById
                .mockResolvedValueOnce(taskData)
                .mockReturnValueOnce({
                    populate: mockPopulate1,
                });
            mockValidateProjectAccess.mockResolvedValue({ project: projectData });
            mockColumnFindById.mockResolvedValue(newColumnData);

            const result = await taskService.updateTask(
                taskId,
                { columnId: newColumnId },
                userId,
            );

            expect(mockColumnFindById).toHaveBeenCalledWith(newColumnId);
        });
    });

    describe('deleteTask', () => {
        it('should delete task when user has access', async () => {
            const taskData = {
                _id: taskId,
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

            mockTaskFindById.mockResolvedValue(taskData);
            mockValidateProjectAccess.mockResolvedValue({ project: projectData });
            mockTaskFindByIdAndDelete.mockResolvedValue(null);

            const result = await taskService.deleteTask(taskId, userId);

            expect(mockTaskFindByIdAndDelete).toHaveBeenCalledWith(taskId);
            expect(result).toEqual(taskData);
        });
    });

    describe('moveTask', () => {
        it('should move task to new column', async () => {
            const taskData = {
                _id: taskId,
                projectId,
                columnId,
                save: vi.fn().mockResolvedValue(true),
            };

            const newColumnId = '507f1f77bcf86cd799439017';
            const newColumnData = {
                _id: newColumnId,
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

            const updatedTask = {
                ...taskData,
                columnId: newColumnId,
            };
            const mockPopulate3 = vi.fn().mockResolvedValue(updatedTask);
            const mockPopulate2 = vi.fn().mockReturnValue({
                populate: mockPopulate3,
            });
            const mockPopulate1 = vi.fn().mockReturnValue({
                populate: mockPopulate2,
            });
            
            mockTaskFindById
                .mockResolvedValueOnce(taskData)
                .mockReturnValueOnce({
                    populate: mockPopulate1,
                });
            mockValidateProjectAccess.mockResolvedValue({ project: projectData });
            mockColumnFindById.mockResolvedValue(newColumnData);
            
            const mockTaskFindOneQuery = {
                sort: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue(null),
            };
            mockTaskFindOne.mockReturnValue(mockTaskFindOneQuery);

            const result = await taskService.moveTask(taskId, newColumnId, userId);

            expect(taskData.save).toHaveBeenCalled();
        });

        it('should throw BadRequestError when column belongs to different project', async () => {
            const taskData = {
                _id: taskId,
                projectId,
                columnId,
            };

            const newColumnId = '507f1f77bcf86cd799439017';
            const newColumnData = {
                _id: newColumnId,
                projectId: '507f1f77bcf86cd799439020',
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

            mockTaskFindById.mockResolvedValue(taskData);
            mockValidateProjectAccess.mockResolvedValue({ project: projectData });
            mockColumnFindById.mockResolvedValue(newColumnData);

            await expect(
                taskService.moveTask(taskId, newColumnId, userId),
            ).rejects.toThrow(BadRequestError);
        });
    });

    describe('reorderTask', () => {
        it('should reorder task successfully', async () => {
            const taskData = {
                _id: taskId,
                projectId,
                columnId,
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

            const tasks = [
                { _id: taskId, orderIndex: 0 },
                { _id: '507f1f77bcf86cd799439017', orderIndex: 1 },
            ];

            const updatedTask = {
                ...taskData,
                orderIndex: 1,
            };
            const mockPopulateWithSession = vi.fn().mockResolvedValue(updatedTask);
            const mockPopulate3 = vi.fn().mockReturnValue({
                session: mockPopulateWithSession,
            });
            const mockPopulate2 = vi.fn().mockReturnValue({
                populate: mockPopulate3,
            });
            const mockPopulate1 = vi.fn().mockReturnValue({
                populate: mockPopulate2,
            });
            
            mockTaskFindById
                .mockResolvedValueOnce(taskData)
                .mockReturnValueOnce({
                    populate: mockPopulate1,
                });
            mockValidateProjectAccess.mockResolvedValue({ project: projectData });
            const mockQuery = {
                sort: vi.fn().mockResolvedValue(tasks),
            };
            mockTaskFind.mockReturnValue(mockQuery);

            const result = await taskService.reorderTask(taskId, 1, userId);

            expect(taskData.save).toHaveBeenCalled();
        });

        it('should throw BadRequestError for invalid order index', async () => {
            const taskData = {
                _id: taskId,
                projectId,
                columnId,
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

            const tasks = [{ _id: taskId, orderIndex: 0 }];

            mockTaskFindById.mockResolvedValue(taskData);
            mockValidateProjectAccess.mockResolvedValue({ project: projectData });
            const mockQuery = {
                sort: vi.fn().mockResolvedValue(tasks),
            };
            mockTaskFind.mockReturnValue(mockQuery);

            await expect(
                taskService.reorderTask(taskId, 5, userId),
            ).rejects.toThrow(BadRequestError);
        });
    });

    describe('addAssigneeToTask', () => {
        it('should add assignee successfully', async () => {
            const taskData = {
                _id: taskId,
                projectId,
                assignees: [],
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

            const updatedTask = {
                ...taskData,
                assignees: [assigneeId],
            };
            const mockPopulate3 = vi.fn().mockResolvedValue(updatedTask);
            const mockPopulate2 = vi.fn().mockReturnValue({
                populate: mockPopulate3,
            });
            const mockPopulate1 = vi.fn().mockReturnValue({
                populate: mockPopulate2,
            });
            
            mockTaskFindById
                .mockResolvedValueOnce(taskData)
                .mockReturnValueOnce({
                    populate: mockPopulate1,
                });
            mockValidateProjectAccess.mockResolvedValue({ project: projectData });
            mockUserFindById.mockResolvedValue({ _id: assigneeId });

            const result = await taskService.addAssigneeToTask(taskId, assigneeId, userId);

            expect(taskData.save).toHaveBeenCalled();
        });
    });

    describe('removeAssigneeFromTask', () => {
        it('should remove assignee successfully', async () => {
            const taskData = {
                _id: taskId,
                projectId,
                assignees: [assigneeId],
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

            const updatedTask = {
                ...taskData,
                assignees: [],
            };
            const mockPopulate3 = vi.fn().mockResolvedValue(updatedTask);
            const mockPopulate2 = vi.fn().mockReturnValue({
                populate: mockPopulate3,
            });
            const mockPopulate1 = vi.fn().mockReturnValue({
                populate: mockPopulate2,
            });
            
            mockTaskFindById
                .mockResolvedValueOnce(taskData)
                .mockReturnValueOnce({
                    populate: mockPopulate1,
                });
            mockValidateProjectAccess.mockResolvedValue({ project: projectData });

            const result = await taskService.removeAssigneeFromTask(taskId, assigneeId, userId);

            expect(taskData.save).toHaveBeenCalled();
        });
    });
});

