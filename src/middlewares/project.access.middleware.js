import * as projectService from '#src/services/project.service.js';
import { BadRequestError } from '#src/utils/errors/index.js';
import ApiResponse from '#src/utils/response.util.js';

/**
 * Middleware to check if user has access to a project
 */
export const checkProjectAccess = async (req, res, next) => {
    try {
        const projectId = req.params.id || req.params.projectId;
        const userId = req.user._id;

        if (!projectId) {
            return next(new BadRequestError('Project ID is required'));
        }

        const hasAccess = await projectService.checkProjectAccess(projectId, userId);
        if (!hasAccess) {
            return ApiResponse.error(403, 'You do not have access to this project').send(res);
        }

        next();
    } catch (error) {
        return next(error);
    }
};

/**
 * Middleware to check if user is project owner
 */
export const checkProjectOwner = async (req, res, next) => {
    try {
        const projectId = req.params.id || req.params.projectId;
        const userId = req.user._id;

        if (!projectId) {
            return next(new BadRequestError('Project ID is required'));
        }

        const isOwner = await projectService.checkProjectOwner(projectId, userId);
        if (!isOwner) {
            return ApiResponse.error(403, 'Only project owner can perform this action').send(res);
        }

        next();
    } catch (error) {
        return next(error);
    }
};

