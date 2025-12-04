import Joi from 'joi';
import { ObjectId } from 'mongodb';

export const createTaskSchema = Joi.object({
    columnId: Joi.string()
        .custom((value, helpers) => {
            if (!ObjectId.isValid(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        })
        .required()
        .messages({
            'any.invalid': 'Column ID must be a valid MongoDB ObjectId',
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
    assignees: Joi.array().items(Joi.string().custom((value, helpers) => {
        if (!ObjectId.isValid(value)) {
            return helpers.error('any.invalid');
        }
        return value;
    })).optional().messages({
        'array.items': 'Assignees must be an array of valid MongoDB ObjectIds',
        'any.invalid': 'Assignees must be an array of valid MongoDB ObjectIds',
    }),
});

export const updateTaskSchema = Joi.object({
    columnId: Joi.string()
        .custom((value, helpers) => {
            if (!ObjectId.isValid(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        })
        .required()
        .messages({
            'any.invalid': 'Column ID must be a valid MongoDB ObjectId',
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
    assignees: Joi.array().items(Joi.string().custom((value, helpers) => {
        if (!ObjectId.isValid(value)) {
            return helpers.error('any.invalid');
        }
        return value;
    })).optional().messages({
        'array.items': 'Assignees must be an array of valid MongoDB ObjectIds',
        'any.invalid': 'Assignees must be an array of valid MongoDB ObjectIds',
    }),
}).min(1).messages({
    'object.min': 'At least one field must be provided for update',
});

export const taskIdSchema = Joi.object({
    id: Joi.string()
        .custom((value, helpers) => {
            if (!ObjectId.isValid(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        })
        .required()
        .messages({
            'any.invalid': 'ID must be a valid MongoDB ObjectId',
            'any.required': 'ID is required',
        }),
});

export const projectIdSchema = Joi.object({
    projectId: Joi.string()
        .custom((value, helpers) => {
            if (!ObjectId.isValid(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        })
        .required()
        .messages({
            'any.invalid': 'Project ID must be a valid MongoDB ObjectId',
            'any.required': 'Project ID is required',
        }),
});

export const moveTaskSchema = Joi.object({
    columnId: Joi.string()
        .custom((value, helpers) => {
            if (!ObjectId.isValid(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        })
        .required()
        .messages({
            'any.invalid': 'Column ID must be a valid MongoDB ObjectId',
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
        .custom((value, helpers) => {
            if (!ObjectId.isValid(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        })
        .required()
        .messages({
            'any.invalid': 'Assignee ID must be a valid MongoDB ObjectId',
            'any.required': 'Assignee ID is required',
        }),
});

export const removeAssigneeSchema = Joi.object({
    id: Joi.string()
        .custom((value, helpers) => {
            if (!ObjectId.isValid(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        })
        .required()
        .messages({
            'any.invalid': 'Task ID must be a valid MongoDB ObjectId',
            'any.required': 'Task ID is required',
        }),
    userId: Joi.string()
        .custom((value, helpers) => {
            if (!ObjectId.isValid(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        })
        .required()
        .messages({
            'any.invalid': 'User ID must be a valid MongoDB ObjectId',
            'any.required': 'User ID is required',
        }),
});

export const getTasksQuerySchema = Joi.object({
    columnId: Joi.string()
        .custom((value, helpers) => {
            if (!ObjectId.isValid(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        })
        .optional()
        .messages({
            'any.invalid': 'Column ID must be a valid MongoDB ObjectId',
        }),
    assigneeId: Joi.string()
        .custom((value, helpers) => {
            if (!ObjectId.isValid(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        })
        .optional()
        .messages({
            'any.invalid': 'Assignee ID must be a valid MongoDB ObjectId',
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

