import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock modules
vi.mock('#src/services/task.service.js', () => ({
    getTasksByProject: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    moveTask: vi.fn(),
    reorderTask: vi.fn(),
}));

vi.mock('#src/config/logger.js', () => ({
    default: {
        info: vi.fn(),
        error: vi.fn(),
    },
}));

// Import after mocks
import { registerTaskHandlers } from '#src/socket/handlers/task.handlers.js';
import * as taskService from '#src/services/task.service.js';
import logger from '#src/config/logger.js';

describe('Task Socket Handlers', () => {
    let mockIo;
    let mockSocket;

    beforeEach(() => {
        vi.clearAllMocks();

        mockIo = {
            to: vi.fn().mockReturnValue({
                emit: vi.fn(),
            }),
        };

        mockSocket = {
            user: {
                _id: '507f1f77bcf86cd799439011',
                email: 'test@example.com',
            },
            join: vi.fn(),
            leave: vi.fn(),
            emit: vi.fn(),
            on: vi.fn((event, handler) => {
                // Store handlers for testing
                mockSocket._handlers = mockSocket._handlers || {};
                mockSocket._handlers[event] = handler;
            }),
        };

        registerTaskHandlers(mockIo, mockSocket);
    });

    describe('task:join-project', () => {
        it('should join project room successfully', async () => {
            const projectId = '507f1f77bcf86cd799439012';
            const mockTasks = [];

            taskService.getTasksByProject.mockResolvedValue(mockTasks);

            const handler = mockSocket._handlers['task:join-project'];
            await handler(projectId);

            expect(taskService.getTasksByProject).toHaveBeenCalledWith(
                projectId,
                {},
                mockSocket.user._id,
            );
            expect(mockSocket.join).toHaveBeenCalledWith(`project:${projectId}`);
            expect(mockSocket.emit).toHaveBeenCalledWith('task:joined-project', {
                projectId,
                room: `project:${projectId}`,
            });
            expect(logger.info).toHaveBeenCalled();
        });

        it('should emit error when access denied', async () => {
            const projectId = '507f1f77bcf86cd799439012';
            const error = new Error('Access denied');

            taskService.getTasksByProject.mockRejectedValue(error);

            const handler = mockSocket._handlers['task:join-project'];
            await handler(projectId);

            expect(mockSocket.emit).toHaveBeenCalledWith('task:error', {
                message: error.message,
            });
            expect(logger.error).toHaveBeenCalled();
        });
    });

    describe('task:leave-project', () => {
        it('should leave project room successfully', async () => {
            const projectId = '507f1f77bcf86cd799439012';

            const handler = mockSocket._handlers['task:leave-project'];
            await handler(projectId);

            expect(mockSocket.leave).toHaveBeenCalledWith(`project:${projectId}`);
            expect(mockSocket.emit).toHaveBeenCalledWith('task:left-project', {
                projectId,
            });
            expect(logger.info).toHaveBeenCalled();
        });
    });

    describe('task:create', () => {
        it('should create task and broadcast to room', async () => {
            const projectId = '507f1f77bcf86cd799439012';
            const taskData = {
                columnId: '507f1f77bcf86cd799439013',
                title: 'Test Task',
                description: 'Test Description',
            };

            const mockTask = {
                _id: '507f1f77bcf86cd799439014',
                ...taskData,
                projectId,
            };

            taskService.createTask.mockResolvedValue(mockTask);

            const handler = mockSocket._handlers['task:create'];
            await handler({ projectId, taskData });

            expect(taskService.createTask).toHaveBeenCalledWith(
                projectId,
                taskData,
                mockSocket.user._id,
            );
            expect(mockIo.to).toHaveBeenCalledWith(`project:${projectId}`);
            expect(logger.info).toHaveBeenCalled();
        });

        it('should emit error when creation fails', async () => {
            const projectId = '507f1f77bcf86cd799439012';
            const error = new Error('Creation failed');

            taskService.createTask.mockRejectedValue(error);

            const handler = mockSocket._handlers['task:create'];
            await handler({ projectId, taskData: {} });

            expect(mockSocket.emit).toHaveBeenCalledWith('task:error', {
                message: error.message,
            });
            expect(logger.error).toHaveBeenCalled();
        });
    });

    describe('task:update', () => {
        it('should update task and broadcast to room', async () => {
            const taskId = '507f1f77bcf86cd799439014';
            const taskData = { title: 'Updated Title' };

            const mockTask = {
                _id: taskId,
                projectId: { _id: '507f1f77bcf86cd799439012' },
                ...taskData,
            };

            taskService.updateTask.mockResolvedValue(mockTask);

            const handler = mockSocket._handlers['task:update'];
            await handler({ taskId, taskData });

            expect(taskService.updateTask).toHaveBeenCalledWith(
                taskId,
                taskData,
                mockSocket.user._id,
            );
            expect(mockIo.to).toHaveBeenCalled();
            expect(logger.info).toHaveBeenCalled();
        });

        it('should handle projectId as object or string', async () => {
            const taskId = '507f1f77bcf86cd799439014';
            const projectId = '507f1f77bcf86cd799439012';

            const mockTask = {
                _id: taskId,
                projectId,
            };

            taskService.updateTask.mockResolvedValue(mockTask);

            const handler = mockSocket._handlers['task:update'];
            await handler({ taskId, taskData: {} });

            expect(mockIo.to).toHaveBeenCalled();
        });
    });

    describe('task:delete', () => {
        it('should delete task and broadcast to room', async () => {
            const taskId = '507f1f77bcf86cd799439014';
            const projectId = '507f1f77bcf86cd799439012';

            const mockTask = {
                _id: taskId,
            };

            taskService.deleteTask.mockResolvedValue(mockTask);

            const handler = mockSocket._handlers['task:delete'];
            await handler({ taskId, projectId });

            expect(taskService.deleteTask).toHaveBeenCalledWith(
                taskId,
                mockSocket.user._id,
            );
            expect(mockIo.to).toHaveBeenCalledWith(`project:${projectId}`);
            expect(logger.info).toHaveBeenCalled();
        });
    });

    describe('task:move', () => {
        it('should move task and broadcast to room', async () => {
            const taskId = '507f1f77bcf86cd799439014';
            const columnId = '507f1f77bcf86cd799439015';
            const projectId = '507f1f77bcf86cd799439012';

            const mockTask = {
                _id: taskId,
                projectId: { _id: projectId },
                columnId,
            };

            taskService.moveTask.mockResolvedValue(mockTask);

            const handler = mockSocket._handlers['task:move'];
            await handler({ taskId, columnId });

            expect(taskService.moveTask).toHaveBeenCalledWith(
                taskId,
                columnId,
                mockSocket.user._id,
            );
            expect(mockIo.to).toHaveBeenCalled();
            expect(logger.info).toHaveBeenCalled();
        });
    });

    describe('task:reorder', () => {
        it('should reorder task and broadcast to room', async () => {
            const taskId = '507f1f77bcf86cd799439014';
            const orderIndex = 2;
            const projectId = '507f1f77bcf86cd799439012';

            const mockTask = {
                _id: taskId,
                projectId: { _id: projectId },
                orderIndex,
            };

            taskService.reorderTask.mockResolvedValue(mockTask);

            const handler = mockSocket._handlers['task:reorder'];
            await handler({ taskId, orderIndex });

            expect(taskService.reorderTask).toHaveBeenCalledWith(
                taskId,
                orderIndex,
                mockSocket.user._id,
            );
            expect(mockIo.to).toHaveBeenCalled();
            expect(logger.info).toHaveBeenCalled();
        });
    });

    describe('disconnect', () => {
        it('should log disconnect event', () => {
            const handler = mockSocket._handlers['disconnect'];
            handler();

            expect(logger.info).toHaveBeenCalledWith(
                `User ${mockSocket.user._id} disconnected`,
            );
        });
    });
});

