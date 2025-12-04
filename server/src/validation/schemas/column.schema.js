import Joi from 'joi';
import { ObjectId } from 'mongodb';

export const createColumnSchema = Joi.object({
    name: Joi.string().required().min(1).max(50).messages({
        'string.empty': 'Column name is required',
        'any.required': 'Column name is required',
        'string.min': 'Column name must be at least 1 character long',
        'string.max': 'Column name must be at most 50 characters long',
    }),
});

export const updateColumnSchema = Joi.object({
    name: Joi.string().optional().min(1).max(50).messages({
        'string.min': 'Column name must be at least 1 character long',
        'string.max': 'Column name must be at most 50 characters long',
    }),
}).min(1).messages({
    'object.min': 'At least one field must be provided for update',
});

export const columnIdSchema = Joi.object({
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

export const reorderColumnSchema = Joi.object({
    orderIndex: Joi.number().integer().min(0).required().messages({
        'number.base': 'Order index must be a number',
        'number.integer': 'Order index must be an integer',
        'number.min': 'Order index must be at least 0',
        'any.required': 'Order index is required',
    }),
});

