import Joi from 'joi';

export const createFolderSchema = Joi.object({
    name: Joi.string().required().min(1).max(100).messages({
        'string.empty': 'Folder name is required',
        'any.required': 'Folder name is required',
        'string.min': 'Folder name must be at least 1 character long',
        'string.max': 'Folder name must be at most 100 characters long',
    }),
    description: Joi.string().required().min(1).max(500).messages({
        'string.empty': 'Folder description is required',
        'any.required': 'Folder description is required',
        'string.min': 'Folder description must be at least 1 character long',
        'string.max': 'Folder description must be at most 500 characters long',
    }),
});

export const updateFolderSchema = Joi.object({
    name: Joi.string().optional().min(1).max(100).messages({
        'string.min': 'Folder name must be at least 1 character long',
        'string.max': 'Folder name must be at most 100 characters long',
    }),
    description: Joi.string().optional().min(1).max(500).messages({
        'string.min': 'Folder description must be at least 1 character long',
        'string.max': 'Folder description must be at most 500 characters long',
    }),
}).min(1).messages({
    'object.min': 'At least one field must be provided for update',
});

export const folderIdSchema = Joi.object({
    id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'ID must be a valid MongoDB ObjectId',
            'string.empty': 'ID is required',
            'any.required': 'ID is required',
        }),
});

export const addMemberSchema = Joi.object({
    memberId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Member ID must be a valid MongoDB ObjectId',
            'string.empty': 'Member ID is required',
            'any.required': 'Member ID is required',
        }),
});

export const removeMemberSchema = Joi.object({
    id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Folder ID must be a valid MongoDB ObjectId',
            'string.empty': 'Folder ID is required',
            'any.required': 'Folder ID is required',
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

