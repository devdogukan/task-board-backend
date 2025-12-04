import Joi from 'joi';
import { ObjectId } from 'mongodb';

export const createProjectSchema = Joi.object({
    name: Joi.string().required().min(1).max(100).messages({
        'string.empty': 'Project name is required',
        'any.required': 'Project name is required',
        'string.min': 'Project name must be at least 1 character long',
        'string.max': 'Project name must be at most 100 characters long',
    }),
    description: Joi.string().required().min(1).max(500).messages({
        'string.empty': 'Project description is required',
        'any.required': 'Project description is required',
        'string.min': 'Project description must be at least 1 character long',
        'string.max': 'Project description must be at most 500 characters long',
    }),
});

export const updateProjectSchema = Joi.object({
    name: Joi.string().optional().min(1).max(100).messages({
        'string.min': 'Project name must be at least 1 character long',
        'string.max': 'Project name must be at most 100 characters long',
    }),
    description: Joi.string().optional().min(1).max(500).messages({
        'string.min': 'Project description must be at least 1 character long',
        'string.max': 'Project description must be at most 500 characters long',
    }),
}).min(1).messages({
    'object.min': 'At least one field must be provided for update',
});

export const projectIdSchema = Joi.object({
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

export const folderIdSchema = Joi.object({
    folderId: Joi.string()
        .custom((value, helpers) => {
            if (!ObjectId.isValid(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        })
        .required()
        .messages({
            'any.invalid': 'Folder ID must be a valid MongoDB ObjectId',
            'any.required': 'Folder ID is required',
        }),
});

export const updateProjectStatusSchema = Joi.object({
    status: Joi.string().valid('active', 'archived', 'completed').required().messages({
        'any.only': 'Status must be one of: active, archived, completed',
        'any.required': 'Status is required',
    }),
});

export const addMemberSchema = Joi.object({
    memberId: Joi.string()
        .custom((value, helpers) => {
            if (!ObjectId.isValid(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        })
        .required()
        .messages({
            'any.invalid': 'Member ID must be a valid MongoDB ObjectId',
            'any.required': 'Member ID is required',
        }),
});

export const removeMemberSchema = Joi.object({
    id: Joi.string()
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

