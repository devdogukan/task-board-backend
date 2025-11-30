import Joi from 'joi';

export const registerSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Email must be a valid email address',
        'string.empty': 'Email is required',
        'any.required': 'Email is required',
    }),
    firstName: Joi.string().required().messages({
        'string.empty': 'First name is required',
        'any.required': 'First name is required',
        'string.pattern.base': 'First name must be a string',
    }),
    lastName: Joi.string().required().messages({
        'string.empty': 'Last name is required',
        'any.required': 'Last name is required',
        'string.pattern.base': 'Last name must be a string',
    }),
    password: Joi.string().required().min(6).max(32).messages({
        'string.empty': 'Password is required',
        'any.required': 'Password is required',
        'string.pattern.base': 'Password must be a string',
        'string.min': 'Password must be at least 6 characters long',
        'string.max': 'Password must be at most 32 characters long',
    }),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Email must be a valid email address',
        'string.empty': 'Email is required',
        'any.required': 'Email is required',
    }),
    password: Joi.string().required().min(6).max(32).messages({
        'string.empty': 'Password is required',
        'any.required': 'Password is required',
        'string.pattern.base': 'Password must be a string',
        'string.min': 'Password must be at least 6 characters long',
        'string.max': 'Password must be at most 32 characters long',
    }),
});

export const getUserByIdSchema = Joi.object({
    id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'ID must be a valid MongoDB ObjectId',
            'string.empty': 'ID is required',
            'any.required': 'ID is required',
        }),
});

export const updateUserSchema = Joi.object({
    email: Joi.string().email().optional().messages({
        'string.email': 'Email must be a valid email address',
    }),
    firstName: Joi.string().optional().messages({
        'string.empty': 'First name cannot be empty',
    }),
    lastName: Joi.string().optional().messages({
        'string.empty': 'Last name cannot be empty',
    }),
    avatar: Joi.string().allow(null).optional().messages({
        'string.empty': 'Avatar cannot be empty',
    }),
}).min(1).messages({
    'object.min': 'At least one field must be provided for update',
});

export const deleteUserSchema = Joi.object({
    id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'ID must be a valid MongoDB ObjectId',
            'string.empty': 'ID is required',
            'any.required': 'ID is required',
        }),
});
