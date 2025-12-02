import { Project, Folder, Task, Column } from '#src/models/index.js';
import { NotFoundError, BadRequestError, ConflictError } from '#src/utils/errors/index.js';
import { withTransaction } from '#src/config/database.js';

export const createProject = async (folderId, projectData, userId) => {
    // Check if folder exists and user has access
    const folder = await Folder.findOne({
        _id: folderId,
        $or: [{ owner: userId }, { members: userId }],
    });

    if (!folder) {
        throw new NotFoundError('Folder not found or you do not have access');
    }

    return await withTransaction(async (session) => {
        const project = new Project({
            ...projectData,
            folderId: folder._id,
            owner: userId,
            members: [],
            status: 'active',
        });

        const saveOptions = session ? { session } : {};
        await project.save(saveOptions);

        // Create default columns
        const defaultColumns = [
            { name: 'Pending', orderIndex: 0 },
            { name: 'In Progress', orderIndex: 1 },
            { name: 'Completed', orderIndex: 2 },
            { name: 'Launched', orderIndex: 3 },
        ];

        for (const columnData of defaultColumns) {
            const column = new Column({
                projectId: project._id,
                name: columnData.name,
                orderIndex: columnData.orderIndex,
            });
            await column.save(saveOptions);
        }

        return await Project.findById(project._id)
            .populate('owner', 'firstName lastName email avatar')
            .populate('members', 'firstName lastName email avatar')
            .populate('folderId', 'name')
            .session(session);
    });
};

export const getProjectsByFolder = async (folderId, userId) => {
    // Check if folder exists and user has access
    const folder = await Folder.findOne({
        _id: folderId,
        $or: [{ owner: userId }, { members: userId }],
    });

    if (!folder) {
        throw new NotFoundError('Folder not found or you do not have access');
    }

    const projects = await Project.find({ folderId: folder._id })
        .populate('owner', 'firstName lastName email avatar')
        .populate('members', 'firstName lastName email avatar')
        .sort({ createdAt: -1 });

    return projects;
};

export const getProjectById = async (projectId, userId) => {
    const project = await Project.findById(projectId)
        .populate('owner', 'firstName lastName email avatar')
        .populate('members', 'firstName lastName email avatar')
        .populate('folderId', 'name');

    if (!project) {
        throw new NotFoundError('Project not found');
    }

    // Check if user has access through folder
    const folder = await Folder.findById(project.folderId._id || project.folderId);
    if (
        folder.owner.toString() !== userId.toString() &&
        !folder.members.some((id) => id.toString() === userId.toString()) &&
        project.owner.toString() !== userId.toString() &&
        !project.members.some((id) => id.toString() === userId.toString())
    ) {
        throw new NotFoundError('Project not found or you do not have access');
    }

    return project;
};

export const updateProject = async (projectId, projectData, userId) => {
    const project = await Project.findById(projectId);

    if (!project) {
        throw new NotFoundError('Project not found');
    }

    // Check if user is owner
    if (project.owner.toString() !== userId.toString()) {
        throw new BadRequestError('Only project owner can update the project');
    }

    Object.assign(project, projectData);
    await project.save();

    return await Project.findById(project._id)
        .populate('owner', 'firstName lastName email avatar')
        .populate('members', 'firstName lastName email avatar')
        .populate('folderId', 'name');
};

export const deleteProject = async (projectId, userId) => {
    const project = await Project.findById(projectId);

    if (!project) {
        throw new NotFoundError('Project not found');
    }

    // Check if user is owner
    if (project.owner.toString() !== userId.toString()) {
        throw new BadRequestError('Only project owner can delete the project');
    }

    return await withTransaction(async (session) => {
        const deleteOptions = session ? { session } : {};
        
        // Delete all tasks in this project
        await Task.deleteMany({ projectId: project._id }, deleteOptions);

        // Delete all columns
        await Column.deleteMany({ projectId: project._id }, deleteOptions);

        await Project.findByIdAndDelete(projectId, deleteOptions);
        return project;
    });
};

export const updateProjectStatus = async (projectId, status, userId) => {
    const project = await Project.findById(projectId);

    if (!project) {
        throw new NotFoundError('Project not found');
    }

    // Check if user is owner
    if (project.owner.toString() !== userId.toString()) {
        throw new BadRequestError('Only project owner can update project status');
    }

    const validStatuses = ['active', 'archived', 'completed'];
    if (!validStatuses.includes(status)) {
        throw new BadRequestError(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    project.status = status;
    await project.save();

    return await Project.findById(project._id)
        .populate('owner', 'firstName lastName email avatar')
        .populate('members', 'firstName lastName email avatar')
        .populate('folderId', 'name');
};

export const addMemberToProject = async (projectId, memberId, userId) => {
    const project = await Project.findById(projectId);

    if (!project) {
        throw new NotFoundError('Project not found');
    }

    // Check if user is owner
    if (project.owner.toString() !== userId.toString()) {
        throw new BadRequestError('Only project owner can add members');
    }

    // Check if member is already in the project
    if (project.members.includes(memberId)) {
        throw new ConflictError('User is already a member of this project');
    }

    // Check if trying to add owner as member
    if (project.owner.toString() === memberId.toString()) {
        throw new BadRequestError('Owner cannot be added as a member');
    }

    project.members.push(memberId);
    await project.save();

    return await Project.findById(project._id)
        .populate('owner', 'firstName lastName email avatar')
        .populate('members', 'firstName lastName email avatar')
        .populate('folderId', 'name');
};

export const removeMemberFromProject = async (projectId, memberId, userId) => {
    const project = await Project.findById(projectId);

    if (!project) {
        throw new NotFoundError('Project not found');
    }

    // Check if user is owner
    if (project.owner.toString() !== userId.toString()) {
        throw new BadRequestError('Only project owner can remove members');
    }

    // Check if member exists in the project
    if (!project.members.includes(memberId)) {
        throw new NotFoundError('User is not a member of this project');
    }

    project.members = project.members.filter(
        (id) => id.toString() !== memberId.toString()
    );
    await project.save();

    return await Project.findById(project._id)
        .populate('owner', 'firstName lastName email avatar')
        .populate('members', 'firstName lastName email avatar')
        .populate('folderId', 'name');
};

/**
 * Check if user has access to a project (owner, member, or folder access)
 * @param {string|ObjectId} projectId - Project ID
 * @param {string|ObjectId} userId - User ID
 * @returns {Promise<boolean>} - True if user has access, false otherwise
 */
export const checkProjectAccess = async (projectId, userId) => {
    const project = await Project.findById(projectId);
    if (!project) {
        throw new NotFoundError('Project not found');
    }
    
    const userIdStr = userId.toString();
    const isOwner = project.owner.toString() === userIdStr;
    const isMember = project.members.some((id) => id.toString() === userIdStr);
    
    // Also check folder access
    const folder = await Folder.findById(project.folderId);
    if (!folder) {
        throw new NotFoundError('Folder not found');
    }
    
    const hasFolderAccess = folder.owner.toString() === userIdStr ||
        folder.members.some((id) => id.toString() === userIdStr);
    
    return isOwner || isMember || hasFolderAccess;
};

/**
 * Validate that user has access to a project, throws NotFoundError if not
 * @param {string|ObjectId} projectId - Project ID
 * @param {string|ObjectId} userId - User ID
 * @returns {Promise<{project: Object}>} - Project object if user has access
 * @throws {NotFoundError} - If project not found or user doesn't have access
 */
export const validateProjectAccess = async (projectId, userId) => {
    const project = await Project.findById(projectId);
    if (!project) {
        throw new NotFoundError('Project not found');
    }

    const hasAccess = await checkProjectAccess(projectId, userId);
    if (!hasAccess) {
        throw new NotFoundError('Project not found or you do not have access');
    }

    return { project };
};

/**
 * Check if user is owner of a project
 */
export const checkProjectOwner = async (projectId, userId) => {
    const project = await Project.findById(projectId);
    if (!project) {
        throw new NotFoundError('Project not found');
    }
    return project.owner.toString() === userId.toString();
};

