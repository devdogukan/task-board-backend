import * as folderService from '#src/services/folder.service.js';
import ApiResponse from '#src/utils/response.util.js';

export const createFolder = async (req, res, next) => {
    try {
        const folderData = req.body;
        const userId = req.user._id;

        const folder = await folderService.createFolder(folderData, userId);
        return ApiResponse.success(201, 'Folder created successfully', folder).send(res);
    } catch (error) {
        return next(error);
    }
};

export const getFolders = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const folders = await folderService.getFoldersByUser(userId);
        return ApiResponse.success(200, 'Folders fetched successfully', folders).send(res);
    } catch (error) {
        return next(error);
    }
};

export const getFolderById = async (req, res, next) => {
    try {
        const folderId = req.params.id;
        const userId = req.user._id;

        const folder = await folderService.getFolderById(folderId, userId);
        return ApiResponse.success(200, 'Folder fetched successfully', folder).send(res);
    } catch (error) {
        return next(error);
    }
};

export const updateFolder = async (req, res, next) => {
    try {
        const folderId = req.params.id;
        const folderData = req.body;
        const userId = req.user._id;

        const folder = await folderService.updateFolder(folderId, folderData, userId);
        return ApiResponse.success(200, 'Folder updated successfully', folder).send(res);
    } catch (error) {
        return next(error);
    }
};

export const deleteFolder = async (req, res, next) => {
    try {
        const folderId = req.params.id;
        const userId = req.user._id;

        await folderService.deleteFolder(folderId, userId);
        return ApiResponse.success(200, 'Folder deleted successfully').send(res);
    } catch (error) {
        return next(error);
    }
};

export const addMember = async (req, res, next) => {
    try {
        const folderId = req.params.id;
        const { memberId } = req.body;
        const userId = req.user._id;

        const folder = await folderService.addMemberToFolder(folderId, memberId, userId);
        return ApiResponse.success(200, 'Member added successfully', folder).send(res);
    } catch (error) {
        return next(error);
    }
};

export const removeMember = async (req, res, next) => {
    try {
        const folderId = req.params.id;
        const memberId = req.params.userId;
        const userId = req.user._id;

        const folder = await folderService.removeMemberFromFolder(folderId, memberId, userId);
        return ApiResponse.success(200, 'Member removed successfully', folder).send(res);
    } catch (error) {
        return next(error);
    }
};

