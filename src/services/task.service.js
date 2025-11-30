import { Task, Project, Column, User, Folder } from '#src/models/index.js';
import { NotFoundError, BadRequestError } from '#src/utils/errors/index.js';
import { validateProjectAccess } from '#src/services/project.service.js';

export const createTask = async (projectId, taskData, userId) => {
    // Check if project exists and user has access
    const { project } = await validateProjectAccess(projectId, userId);

    // Check if column exists and belongs to project
    const column = await Column.findById(taskData.columnId);
    if (!column) {
        throw new NotFoundError('Column not found');
    }
    if (column.projectId.toString() !== projectId.toString()) {
        throw new BadRequestError('Column does not belong to this project');
    }

    // Get max orderIndex for tasks in this column
    const maxOrderTask = await Task.findOne({ columnId: taskData.columnId })
        .sort({ orderIndex: -1 })
        .limit(1);

    const orderIndex = maxOrderTask ? maxOrderTask.orderIndex + 1 : 0;

    const task = new Task({
        ...taskData,
        projectId: project._id,
        orderIndex,
    });

    await task.save();
    return await Task.findById(task._id)
        .populate('assignees', 'firstName lastName email avatar')
        .populate('columnId', 'name orderIndex')
        .populate('projectId', 'name');
};

export const getTasksByProject = async (projectId, queryParams, userId) => {
    // Check if project exists and user has access
    await validateProjectAccess(projectId, userId);

    // Build query
    const query = { projectId };

    // Filter by columnId
    if (queryParams.columnId) {
        query.columnId = queryParams.columnId;
    }

    // Filter by assignee
    if (queryParams.assigneeId) {
        query.assignees = queryParams.assigneeId;
    }

    // Filter by priority
    if (queryParams.priority) {
        query.priority = queryParams.priority;
    }

    // Filter by dueDate
    if (queryParams.dueDateFrom || queryParams.dueDateTo) {
        query.dueDate = {};
        if (queryParams.dueDateFrom) {
            query.dueDate.$gte = new Date(queryParams.dueDateFrom);
        }
        if (queryParams.dueDateTo) {
            query.dueDate.$lte = new Date(queryParams.dueDateTo);
        }
    }

    const tasks = await Task.find(query)
        .populate('assignees', 'firstName lastName email avatar')
        .populate('columnId', 'name orderIndex')
        .populate('projectId', 'name')
        .sort({ orderIndex: 1 });

    return tasks;
};

export const getTaskById = async (taskId, userId) => {
    const task = await Task.findById(taskId)
        .populate('assignees', 'firstName lastName email avatar')
        .populate('columnId', 'name orderIndex')
        .populate('projectId', 'name');

    if (!task) {
        throw new NotFoundError('Task not found');
    }

    // Check if user has access through project
    await validateProjectAccess(task.projectId._id || task.projectId, userId);

    return task;
};

export const updateTask = async (taskId, taskData, userId) => {
    const task = await Task.findById(taskId);

    if (!task) {
        throw new NotFoundError('Task not found');
    }

    // Check if user has access through project
    await validateProjectAccess(task.projectId, userId);

    // If columnId is being updated, verify it belongs to the same project
    if (taskData.columnId && taskData.columnId !== task.columnId.toString()) {
        const newColumn = await Column.findById(taskData.columnId);
        if (!newColumn) {
            throw new NotFoundError('Column not found');
        }
        if (newColumn.projectId.toString() !== task.projectId.toString()) {
            throw new BadRequestError('Column does not belong to this project');
        }
    }

    Object.assign(task, taskData);
    await task.save();

    return await Task.findById(task._id)
        .populate('assignees', 'firstName lastName email avatar')
        .populate('columnId', 'name orderIndex')
        .populate('projectId', 'name');
};

export const deleteTask = async (taskId, userId) => {
    const task = await Task.findById(taskId);

    if (!task) {
        throw new NotFoundError('Task not found');
    }

    // Check if user has access through project
    await validateProjectAccess(task.projectId, userId);

    await Task.findByIdAndDelete(taskId);
    return task;
};

export const moveTask = async (taskId, newColumnId, userId) => {
    const task = await Task.findById(taskId);

    if (!task) {
        throw new NotFoundError('Task not found');
    }

    // Check if user has access through project
    await validateProjectAccess(task.projectId, userId);

    // Check if new column exists and belongs to the same project
    const newColumn = await Column.findById(newColumnId);
    if (!newColumn) {
        throw new NotFoundError('Column not found');
    }
    if (newColumn.projectId.toString() !== task.projectId.toString()) {
        throw new BadRequestError('Column does not belong to this project');
    }

    const oldColumnId = task.columnId;
    task.columnId = newColumnId;

    // Get max orderIndex in new column
    const maxOrderTask = await Task.findOne({ columnId: newColumnId })
        .sort({ orderIndex: -1 })
        .limit(1);
    task.orderIndex = maxOrderTask ? maxOrderTask.orderIndex + 1 : 0;

    await task.save();

    return await Task.findById(task._id)
        .populate('assignees', 'firstName lastName email avatar')
        .populate('columnId', 'name orderIndex')
        .populate('projectId', 'name');
};

export const reorderTask = async (taskId, newOrderIndex, userId) => {
    const task = await Task.findById(taskId);

    if (!task) {
        throw new NotFoundError('Task not found');
    }

    // Check if user has access through project
    await validateProjectAccess(task.projectId, userId);

    const oldOrderIndex = task.orderIndex;
    const tasks = await Task.find({ columnId: task.columnId }).sort({ orderIndex: 1 });

    if (newOrderIndex < 0 || newOrderIndex >= tasks.length) {
        throw new BadRequestError('Invalid order index');
    }

    // Reorder tasks
    if (oldOrderIndex < newOrderIndex) {
        // Moving down
        await Task.updateMany(
            {
                columnId: task.columnId,
                orderIndex: { $gt: oldOrderIndex, $lte: newOrderIndex },
            },
            { $inc: { orderIndex: -1 } }
        );
    } else {
        // Moving up
        await Task.updateMany(
            {
                columnId: task.columnId,
                orderIndex: { $gte: newOrderIndex, $lt: oldOrderIndex },
            },
            { $inc: { orderIndex: 1 } }
        );
    }

    task.orderIndex = newOrderIndex;
    await task.save();

    return await Task.findById(task._id)
        .populate('assignees', 'firstName lastName email avatar')
        .populate('columnId', 'name orderIndex')
        .populate('projectId', 'name');
};

export const addAssigneeToTask = async (taskId, assigneeId, userId) => {
    const task = await Task.findById(taskId);

    if (!task) {
        throw new NotFoundError('Task not found');
    }

    // Check if user has access through project
    await validateProjectAccess(task.projectId, userId);

    // Check if assignee exists
    const assignee = await User.findById(assigneeId);
    if (!assignee) {
        throw new NotFoundError('User not found');
    }

    // Check if assignee is already assigned
    if (task.assignees.includes(assigneeId)) {
        throw new BadRequestError('User is already assigned to this task');
    }

    task.assignees.push(assigneeId);
    await task.save();

    return await Task.findById(task._id)
        .populate('assignees', 'firstName lastName email avatar')
        .populate('columnId', 'name orderIndex')
        .populate('projectId', 'name');
};

export const removeAssigneeFromTask = async (taskId, assigneeId, userId) => {
    const task = await Task.findById(taskId);

    if (!task) {
        throw new NotFoundError('Task not found');
    }

    // Check if user has access through project
    await validateProjectAccess(task.projectId, userId);

    // Check if assignee exists in task
    if (!task.assignees.includes(assigneeId)) {
        throw new NotFoundError('User is not assigned to this task');
    }

    task.assignees = task.assignees.filter(
        (id) => id.toString() !== assigneeId.toString()
    );
    await task.save();

    return await Task.findById(task._id)
        .populate('assignees', 'firstName lastName email avatar')
        .populate('columnId', 'name orderIndex')
        .populate('projectId', 'name');
};

