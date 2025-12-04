import { Column, Project, Task, Folder } from '#src/models/index.js';
import { NotFoundError, BadRequestError } from '#src/utils/errors/index.js';
import { validateProjectAccess } from '#src/services/project.service.js';
import { withTransaction } from '#src/config/database.js';

export const createColumn = async (projectId, columnData, userId) => {
    // Check if project exists and user has access
    const { project } = await validateProjectAccess(projectId, userId);

    // Get max orderIndex to set new column at the end
    const maxOrderColumn = await Column.findOne({ projectId })
        .sort({ orderIndex: -1 })
        .limit(1);

    const orderIndex = maxOrderColumn ? maxOrderColumn.orderIndex + 1 : 0;

    const column = new Column({
        ...columnData,
        projectId: project._id,
        orderIndex,
    });

    await column.save();
    return await Column.findById(column._id).populate('projectId', 'name');
};

export const getColumnsByProject = async (projectId, userId) => {
    // Check if project exists and user has access
    await validateProjectAccess(projectId, userId);

    const columns = await Column.find({ projectId })
        .populate('projectId', 'name')
        .sort({ orderIndex: 1 });

    return columns;
};

export const getColumnById = async (columnId, userId) => {
    const column = await Column.findById(columnId).populate(
        'projectId',
        'name',
    );

    if (!column) {
        throw new NotFoundError('Column not found');
    }

    // Check if user has access through project
    await validateProjectAccess(
        column.projectId._id || column.projectId,
        userId,
    );

    return column;
};

export const updateColumn = async (columnId, columnData, userId) => {
    const column = await Column.findById(columnId);

    if (!column) {
        throw new NotFoundError('Column not found');
    }

    // Check if user has access through project
    await validateProjectAccess(column.projectId, userId);

    Object.assign(column, columnData);
    await column.save();

    return await Column.findById(column._id).populate('projectId', 'name');
};

export const deleteColumn = async (columnId, userId) => {
    const column = await Column.findById(columnId);

    if (!column) {
        throw new NotFoundError('Column not found');
    }

    // Check if user has access through project
    await validateProjectAccess(column.projectId, userId);

    // Move all tasks to the first available column or delete them
    const otherColumns = await Column.find({
        projectId: column.projectId,
        _id: { $ne: columnId },
    }).sort({ orderIndex: 1 });

    return await withTransaction(async (session) => {
        if (otherColumns.length > 0) {
            // Move tasks to the first column
            await Task.updateMany(
                { columnId: column._id },
                { columnId: otherColumns[0]._id },
            ).session(session);

        } else {
            // If no other columns, delete all tasks
            await Task.deleteMany({ columnId: column._id }).session(session);
        }

        await Column.findByIdAndDelete(columnId).session(session);

        // Decrement orderIndex for columns with higher orderIndex
        await Column.updateMany(
            {
                projectId: column.projectId,
                orderIndex: { $gt: column.orderIndex },
            },
            { $inc: { orderIndex: -1 } },
        ).session(session);

        return column;
    });
};

export const reorderColumn = async (columnId, newOrderIndex, userId) => {
    const column = await Column.findById(columnId);

    if (!column) {
        throw new NotFoundError('Column not found');
    }

    // Check if user has access through project
    await validateProjectAccess(column.projectId, userId);

    const oldOrderIndex = column.orderIndex;
    const columns = await Column.find({ projectId: column.projectId }).sort({
        orderIndex: 1,
    });

    if (newOrderIndex < 0 || newOrderIndex >= columns.length) {
        throw new BadRequestError('Invalid order index');
    }

    return await withTransaction(async (session) => {
        // Reorder columns
        if (oldOrderIndex < newOrderIndex) {
            // Moving down
            await Column.updateMany(
                {
                    projectId: column.projectId,
                    orderIndex: { $gt: oldOrderIndex, $lte: newOrderIndex },
                },
                { $inc: { orderIndex: -1 } },
            ).session(session);
        } else {
            // Moving up
            await Column.updateMany(
                {
                    projectId: column.projectId,
                    orderIndex: { $gte: newOrderIndex, $lt: oldOrderIndex },
                },
                { $inc: { orderIndex: 1 } },
            ).session(session);
        }

        column.orderIndex = newOrderIndex;
        await column.save({ session });

        return await Column.findById(column._id).populate('projectId', 'name').session(session);
    });
};
