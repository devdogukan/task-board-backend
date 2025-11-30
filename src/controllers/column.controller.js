import * as columnService from '#src/services/column.service.js';
import ApiResponse from '#src/utils/response.util.js';

export const createColumn = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const columnData = req.body;
        const userId = req.user._id;

        const column = await columnService.createColumn(projectId, columnData, userId);
        return ApiResponse.success(201, 'Column created successfully', column).send(res);
    } catch (error) {
        return next(error);
    }
};

export const getColumnsByProject = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const userId = req.user._id;

        const columns = await columnService.getColumnsByProject(projectId, userId);
        return ApiResponse.success(200, 'Columns fetched successfully', columns).send(res);
    } catch (error) {
        return next(error);
    }
};

export const getColumnById = async (req, res, next) => {
    try {
        const columnId = req.params.id;
        const userId = req.user._id;

        const column = await columnService.getColumnById(columnId, userId);
        return ApiResponse.success(200, 'Column fetched successfully', column).send(res);
    } catch (error) {
        return next(error);
    }
};

export const updateColumn = async (req, res, next) => {
    try {
        const columnId = req.params.id;
        const columnData = req.body;
        const userId = req.user._id;

        const column = await columnService.updateColumn(columnId, columnData, userId);
        return ApiResponse.success(200, 'Column updated successfully', column).send(res);
    } catch (error) {
        return next(error);
    }
};

export const deleteColumn = async (req, res, next) => {
    try {
        const columnId = req.params.id;
        const userId = req.user._id;

        await columnService.deleteColumn(columnId, userId);
        return ApiResponse.success(200, 'Column deleted successfully').send(res);
    } catch (error) {
        return next(error);
    }
};

export const reorderColumn = async (req, res, next) => {
    try {
        const columnId = req.params.id;
        const { orderIndex } = req.body;
        const userId = req.user._id;

        const column = await columnService.reorderColumn(columnId, orderIndex, userId);
        return ApiResponse.success(200, 'Column reordered successfully', column).send(res);
    } catch (error) {
        return next(error);
    }
};

