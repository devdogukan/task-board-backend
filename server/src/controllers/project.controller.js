import * as projectService from '#src/services/project.service.js';
import ApiResponse from '#src/utils/response.util.js';

export const createProject = async (req, res, next) => {
    try {
        const { folderId } = req.params;
        const projectData = req.body;
        const userId = req.user._id;

        const project = await projectService.createProject(folderId, projectData, userId);
        return ApiResponse.success(201, 'Project created successfully', project).send(res);
    } catch (error) {
        return next(error);
    }
};

export const getProjectsByFolder = async (req, res, next) => {
    try {
        const { folderId } = req.params;
        const userId = req.user._id;

        const projects = await projectService.getProjectsByFolder(folderId, userId);
        return ApiResponse.success(200, 'Projects fetched successfully', projects).send(res);
    } catch (error) {
        return next(error);
    }
};

export const getProjectById = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const userId = req.user._id;

        const project = await projectService.getProjectById(projectId, userId);
        return ApiResponse.success(200, 'Project fetched successfully', project).send(res);
    } catch (error) {
        return next(error);
    }
};

export const updateProject = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const projectData = req.body;
        const userId = req.user._id;

        const project = await projectService.updateProject(projectId, projectData, userId);
        return ApiResponse.success(200, 'Project updated successfully', project).send(res);
    } catch (error) {
        return next(error);
    }
};

export const deleteProject = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const userId = req.user._id;

        await projectService.deleteProject(projectId, userId);
        return ApiResponse.success(200, 'Project deleted successfully').send(res);
    } catch (error) {
        return next(error);
    }
};

export const updateProjectStatus = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const { status } = req.body;
        const userId = req.user._id;

        const project = await projectService.updateProjectStatus(projectId, status, userId);
        return ApiResponse.success(200, 'Project status updated successfully', project).send(res);
    } catch (error) {
        return next(error);
    }
};

export const addMember = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const { memberId } = req.body;
        const userId = req.user._id;

        const project = await projectService.addMemberToProject(projectId, memberId, userId);
        return ApiResponse.success(200, 'Member added successfully', project).send(res);
    } catch (error) {
        return next(error);
    }
};

export const removeMember = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const memberId = req.params.userId;
        const userId = req.user._id;

        const project = await projectService.removeMemberFromProject(projectId, memberId, userId);
        return ApiResponse.success(200, 'Member removed successfully', project).send(res);
    } catch (error) {
        return next(error);
    }
};

