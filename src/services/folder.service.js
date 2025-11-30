import { Folder, Project, Task, Column } from '#src/models/index.js';
import { NotFoundError, BadRequestError, ConflictError } from '#src/utils/errors/index.js';
import { withTransaction } from '#src/config/database.js';

export const createFolder = async (folderData, userId) => {
    const folder = new Folder({
        ...folderData,
        owner: userId,
        members: [],
    });

    await folder.save();
    return await Folder.findById(folder._id).populate('owner', 'firstName lastName email avatar');
};

export const getFoldersByUser = async (userId) => {
    const folders = await Folder.find({
        $or: [{ owner: userId }, { members: userId }],
    })
        .populate('owner', 'firstName lastName email avatar')
        .populate('members', 'firstName lastName email avatar')
        .sort({ createdAt: -1 });

    return folders;
};

export const getFolderById = async (folderId, userId) => {
    const folder = await Folder.findOne({
        _id: folderId,
        $or: [{ owner: userId }, { members: userId }],
    })
        .populate('owner', 'firstName lastName email avatar')
        .populate('members', 'firstName lastName email avatar');

    if (!folder) {
        throw new NotFoundError('Folder not found or you do not have access');
    }

    return folder;
};

export const updateFolder = async (folderId, folderData, userId) => {
    const folder = await Folder.findById(folderId);

    if (!folder) {
        throw new NotFoundError('Folder not found');
    }

    // Check if user is owner
    if (folder.owner.toString() !== userId.toString()) {
        throw new BadRequestError('Only folder owner can update the folder');
    }

    Object.assign(folder, folderData);
    await folder.save();

    return await Folder.findById(folder._id)
        .populate('owner', 'firstName lastName email avatar')
        .populate('members', 'firstName lastName email avatar');
};

export const deleteFolder = async (folderId, userId) => {
    const folder = await Folder.findById(folderId);

    if (!folder) {
        throw new NotFoundError('Folder not found');
    }

    // Check if user is owner
    if (folder.owner.toString() !== userId.toString()) {
        throw new BadRequestError('Only folder owner can delete the folder');
    }

    return await withTransaction(async (session) => {
        // Get all projects in this folder
        const projectQuery = Project.find({ folderId: folder._id });
        // Always call session() - Mongoose handles null/undefined gracefully
        const projects = await projectQuery.session(session || null);
        const projectIds = projects.map(p => p._id);

        // Delete all tasks in these projects
        if (projectIds.length > 0) {
            const taskOptions = session ? { session } : {};
            await Task.deleteMany({ projectId: { $in: projectIds } }, taskOptions);
        }

        // Delete all columns in these projects
        if (projectIds.length > 0) {
            const columnOptions = session ? { session } : {};
            await Column.deleteMany({ projectId: { $in: projectIds } }, columnOptions);
        }

        // Delete all projects
        const projectDeleteOptions = session ? { session } : {};
        await Project.deleteMany({ folderId: folder._id }, projectDeleteOptions);

        // Delete the folder
        const folderDeleteOptions = session ? { session } : {};
        await Folder.findByIdAndDelete(folderId, folderDeleteOptions);
        return folder;
    });
};

export const addMemberToFolder = async (folderId, memberId, userId) => {
    const folder = await Folder.findById(folderId);

    if (!folder) {
        throw new NotFoundError('Folder not found');
    }

    // Check if user is owner
    if (folder.owner.toString() !== userId.toString()) {
        throw new BadRequestError('Only folder owner can add members');
    }

    // Check if member is already in the folder
    if (folder.members.includes(memberId)) {
        throw new ConflictError('User is already a member of this folder');
    }

    // Check if trying to add owner as member
    if (folder.owner.toString() === memberId.toString()) {
        throw new BadRequestError('Owner cannot be added as a member');
    }

    folder.members.push(memberId);
    await folder.save();

    return await Folder.findById(folder._id)
        .populate('owner', 'firstName lastName email avatar')
        .populate('members', 'firstName lastName email avatar');
};

export const removeMemberFromFolder = async (folderId, memberId, userId) => {
    const folder = await Folder.findById(folderId);

    if (!folder) {
        throw new NotFoundError('Folder not found');
    }

    // Check if user is owner
    if (folder.owner.toString() !== userId.toString()) {
        throw new BadRequestError('Only folder owner can remove members');
    }

    // Check if member exists in the folder
    if (!folder.members.includes(memberId)) {
        throw new NotFoundError('User is not a member of this folder');
    }

    folder.members = folder.members.filter(
        (id) => id.toString() !== memberId.toString()
    );
    await folder.save();

    return await Folder.findById(folder._id)
        .populate('owner', 'firstName lastName email avatar')
        .populate('members', 'firstName lastName email avatar');
};

/**
 * Check if user has access to a folder (owner or member)
 */
export const checkFolderAccess = async (folderId, userId) => {
    const folder = await Folder.findById(folderId);
    if (!folder) {
        throw new NotFoundError('Folder not found');
    }
    
    const isOwner = folder.owner.toString() === userId.toString();
    const isMember = folder.members.some((id) => id.toString() === userId.toString());
    
    return isOwner || isMember;
};

/**
 * Check if user is owner of a folder
 */
export const checkFolderOwner = async (folderId, userId) => {
    const folder = await Folder.findById(folderId);
    if (!folder) {
        throw new NotFoundError('Folder not found');
    }
    return folder.owner.toString() === userId.toString();
};

