import Joi from 'joi';

export const createTaskSchema = Joi.object({
    columnId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Column ID must be a valid MongoDB ObjectId',
            'string.empty': 'Column ID is required',
            'any.required': 'Column ID is required',
        }),
    title: Joi.string().required().min(1).max(200).messages({
        'string.empty': 'Task title is required',
        'any.required': 'Task title is required',
        'string.min': 'Task title must be at least 1 character long',
        'string.max': 'Task title must be at most 200 characters long',
    }),
    description: Joi.string().required().min(1).max(2000).messages({
        'string.empty': 'Task description is required',
        'any.required': 'Task description is required',
        'string.min': 'Task description must be at least 1 character long',
        'string.max': 'Task description must be at most 2000 characters long',
    }),
    priority: Joi.string().valid('low', 'medium', 'high').optional().messages({
        'any.only': 'Priority must be one of: low, medium, high',
    }),
    dueDate: Joi.date().optional().allow(null).messages({
        'date.base': 'Due date must be a valid date',
    }),
});

export const updateTaskSchema = Joi.object({
    columnId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Column ID must be a valid MongoDB ObjectId',
        }),
    title: Joi.string().optional().min(1).max(200).messages({
        'string.min': 'Task title must be at least 1 character long',
        'string.max': 'Task title must be at most 200 characters long',
    }),
    description: Joi.string().optional().min(1).max(2000).messages({
        'string.min': 'Task description must be at least 1 character long',
        'string.max': 'Task description must be at most 2000 characters long',
    }),
    priority: Joi.string().valid('low', 'medium', 'high').optional().messages({
        'any.only': 'Priority must be one of: low, medium, high',
    }),
    dueDate: Joi.date().optional().allow(null).messages({
        'date.base': 'Due date must be a valid date',
    }),
}).min(1).messages({
    'object.min': 'At least one field must be provided for update',
});

export const taskIdSchema = Joi.object({
    id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'ID must be a valid MongoDB ObjectId',
            'string.empty': 'ID is required',
            'any.required': 'ID is required',
        }),
});

export const projectIdSchema = Joi.object({
    projectId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Project ID must be a valid MongoDB ObjectId',
            'string.empty': 'Project ID is required',
            'any.required': 'Project ID is required',
        }),
});

export const moveTaskSchema = Joi.object({
    columnId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Column ID must be a valid MongoDB ObjectId',
            'string.empty': 'Column ID is required',
            'any.required': 'Column ID is required',
        }),
});

export const reorderTaskSchema = Joi.object({
    orderIndex: Joi.number().integer().min(0).required().messages({
        'number.base': 'Order index must be a number',
        'number.integer': 'Order index must be an integer',
        'number.min': 'Order index must be at least 0',
        'any.required': 'Order index is required',
    }),
});

export const addAssigneeSchema = Joi.object({
    assigneeId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Assignee ID must be a valid MongoDB ObjectId',
            'string.empty': 'Assignee ID is required',
            'any.required': 'Assignee ID is required',
        }),
});

export const removeAssigneeSchema = Joi.object({
    id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Task ID must be a valid MongoDB ObjectId',
            'string.empty': 'Task ID is required',
            'any.required': 'Task ID is required',
        }),
    userId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'User ID must be a valid MongoDB ObjectId',
            'string.empty': 'User ID is required',
            'any.required': 'User ID is required',
        }),
});

export const getTasksQuerySchema = Joi.object({
    columnId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Column ID must be a valid MongoDB ObjectId',
        }),
    assigneeId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Assignee ID must be a valid MongoDB ObjectId',
        }),
    priority: Joi.string().valid('low', 'medium', 'high').optional().messages({
        'any.only': 'Priority must be one of: low, medium, high',
    }),
    dueDateFrom: Joi.date().optional().messages({
        'date.base': 'Due date from must be a valid date',
    }),
    dueDateTo: Joi.date().optional().messages({
        'date.base': 'Due date to must be a valid date',
    }),
});

