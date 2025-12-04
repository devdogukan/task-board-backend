import logger from '#src/config/logger.js';
import * as taskService from '#src/services/task.service.js';

export const registerTaskHandlers = (io, socket) => {
    // Join project room
    socket.on('task:join-project', async (projectId) => {
        try {
            // Verify user has access to project
            await taskService.getTasksByProject(projectId, {}, socket.user._id);
            
            const room = `project:${projectId}`;
            socket.join(room);
            logger.info(`User ${socket.user._id} joined project room: ${room}`);
            
            socket.emit('task:joined-project', { projectId, room });
        } catch (error) {
            logger.error(`Error joining project room: ${error.message}`);
            socket.emit('task:error', { message: error.message });
        }
    });

    // Leave project room
    socket.on('task:leave-project', async (projectId) => {
        try {
            const room = `project:${projectId}`;
            socket.leave(room);
            logger.info(`User ${socket.user._id} left project room: ${room}`);
            
            socket.emit('task:left-project', { projectId });
        } catch (error) {
            logger.error(`Error leaving project room: ${error.message}`);
            socket.emit('task:error', { message: error.message });
        }
    });

    // Task created event
    socket.on('task:create', async (data) => {
        try {
            const { projectId, taskData } = data;
            const task = await taskService.createTask(projectId, taskData, socket.user._id);
            
            const room = `project:${projectId}`;
            io.to(room).emit('task:created', { task });
            logger.info(`Task created: ${task._id} in project: ${projectId}`);
        } catch (error) {
            logger.error(`Error creating task: ${error.message}`);
            socket.emit('task:error', { message: error.message });
        }
    });

    // Task updated event
    socket.on('task:update', async (data) => {
        try {
            const { taskId, taskData } = data;
            const task = await taskService.updateTask(taskId, taskData, socket.user._id);
            
            const room = `project:${task.projectId._id || task.projectId}`;
            io.to(room).emit('task:updated', { task });
            logger.info(`Task updated: ${taskId}`);
        } catch (error) {
            logger.error(`Error updating task: ${error.message}`);
            socket.emit('task:error', { message: error.message });
        }
    });

    // Task deleted event
    socket.on('task:delete', async (data) => {
        try {
            const { taskId, projectId } = data;
            const task = await taskService.deleteTask(taskId, socket.user._id);
            
            const room = `project:${projectId}`;
            io.to(room).emit('task:deleted', { taskId });
            logger.info(`Task deleted: ${taskId}`);
        } catch (error) {
            logger.error(`Error deleting task: ${error.message}`);
            socket.emit('task:error', { message: error.message });
        }
    });

    // Task moved event
    socket.on('task:move', async (data) => {
        try {
            const { taskId, columnId } = data;
            const task = await taskService.moveTask(taskId, columnId, socket.user._id);
            
            const room = `project:${task.projectId._id || task.projectId}`;
            io.to(room).emit('task:moved', { task });
            logger.info(`Task moved: ${taskId} to column: ${columnId}`);
        } catch (error) {
            logger.error(`Error moving task: ${error.message}`);
            socket.emit('task:error', { message: error.message });
        }
    });

    // Task reordered event
    socket.on('task:reorder', async (data) => {
        try {
            const { taskId, orderIndex } = data;
            const task = await taskService.reorderTask(taskId, orderIndex, socket.user._id);
            
            const room = `project:${task.projectId._id || task.projectId}`;
            io.to(room).emit('task:reordered', { task });
            logger.info(`Task reordered: ${taskId} to index: ${orderIndex}`);
        } catch (error) {
            logger.error(`Error reordering task: ${error.message}`);
            socket.emit('task:error', { message: error.message });
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        logger.info(`User ${socket.user._id} disconnected`);
    });
};

