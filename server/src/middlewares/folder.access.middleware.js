import * as folderService from '#src/services/folder.service.js';
import { BadRequestError } from '#src/utils/errors/index.js';
import ApiResponse from '#src/utils/response.util.js';

/**
 * Middleware to check if user has access to a folder
 */
export const checkFolderAccess = async (req, res, next) => {
    try {
        const folderId = req.params.id || req.params.folderId;
        const userId = req.user._id;

        if (!folderId) {
            return next(new BadRequestError('Folder ID is required'));
        }

        const hasAccess = await folderService.checkFolderAccess(folderId, userId);
        if (!hasAccess) {
            return ApiResponse.error(403, 'You do not have access to this folder').send(res);
        }

        next();
    } catch (error) {
        return next(error);
    }
};

/**
 * Middleware to check if user is folder owner
 */
export const checkFolderOwner = async (req, res, next) => {
    try {
        const folderId = req.params.id || req.params.folderId;
        const userId = req.user._id;

        if (!folderId) {
            return next(new BadRequestError('Folder ID is required'));
        }

        const isOwner = await folderService.checkFolderOwner(folderId, userId);
        if (!isOwner) {
            return ApiResponse.error(403, 'Only folder owner can perform this action').send(res);
        }

        next();
    } catch (error) {
        return next(error);
    }
};

