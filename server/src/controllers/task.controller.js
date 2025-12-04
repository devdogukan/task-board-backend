import * as taskService from '#src/services/task.service.js';
import ApiResponse from '#src/utils/response.util.js';

export const createTask = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const taskData = req.body;
        const userId = req.user._id;

        const task = await taskService.createTask(projectId, taskData, userId);
        return ApiResponse.success(201, 'Task created successfully', task).send(res);
    } catch (error) {
        return next(error);
    }
};

export const getTasksByProject = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const queryParams = req.validatedQuery || req.query;
        const userId = req.user._id;

        const tasks = await taskService.getTasksByProject(projectId, queryParams, userId);
        return ApiResponse.success(200, 'Tasks fetched successfully', tasks).send(res);
    } catch (error) {
        return next(error);
    }
};

export const getTaskById = async (req, res, next) => {
    try {
        const taskId = req.params.id;
        const userId = req.user._id;

        const task = await taskService.getTaskById(taskId, userId);
        return ApiResponse.success(200, 'Task fetched successfully', task).send(res);
    } catch (error) {
        return next(error);
    }
};

export const updateTask = async (req, res, next) => {
    try {
        const taskId = req.params.id;
        const taskData = req.body;
        const userId = req.user._id;

        const task = await taskService.updateTask(taskId, taskData, userId);
        return ApiResponse.success(200, 'Task updated successfully', task).send(res);
    } catch (error) {
        return next(error);
    }
};

export const deleteTask = async (req, res, next) => {
    try {
        const taskId = req.params.id;
        const userId = req.user._id;

        await taskService.deleteTask(taskId, userId);
        return ApiResponse.success(200, 'Task deleted successfully').send(res);
    } catch (error) {
        return next(error);
    }
};

export const moveTask = async (req, res, next) => {
    try {
        const taskId = req.params.id;
        const { columnId } = req.body;
        const userId = req.user._id;

        const task = await taskService.moveTask(taskId, columnId, userId);
        return ApiResponse.success(200, 'Task moved successfully', task).send(res);
    } catch (error) {
        return next(error);
    }
};

export const reorderTask = async (req, res, next) => {
    try {
        const taskId = req.params.id;
        const { orderIndex } = req.body;
        const userId = req.user._id;

        const task = await taskService.reorderTask(taskId, orderIndex, userId);
        return ApiResponse.success(200, 'Task reordered successfully', task).send(res);
    } catch (error) {
        return next(error);
    }
};

export const addAssignee = async (req, res, next) => {
    try {
        const taskId = req.params.id;
        const { assigneeId } = req.body;
        const userId = req.user._id;

        const task = await taskService.addAssigneeToTask(taskId, assigneeId, userId);
        return ApiResponse.success(200, 'Assignee added successfully', task).send(res);
    } catch (error) {
        return next(error);
    }
};

export const removeAssignee = async (req, res, next) => {
    try {
        const taskId = req.params.id;
        const assigneeId = req.params.userId;
        const userId = req.user._id;

        const task = await taskService.removeAssigneeFromTask(taskId, assigneeId, userId);
        return ApiResponse.success(200, 'Assignee removed successfully', task).send(res);
    } catch (error) {
        return next(error);
    }
};

