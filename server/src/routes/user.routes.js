import { Router } from 'express';
import * as userController from '#src/controllers/user.controller.js';
import { authMiddleware } from '#src/middlewares/auth.middleware.js';
import { validate } from '#src/validation/middlewares/validate.js';
import {
    getUserByIdSchema,
    updateUserSchema,
    deleteUserSchema,
} from '#src/validation/schemas/user.schema.js';
import { paginationSchema } from '#src/validation/schemas/pagination.schema.js';

const router = Router();

router.get(
    '/',
    authMiddleware,
    validate(paginationSchema, 'query'),
    userController.getAllUsers,
);

router.get(
    '/:id',
    authMiddleware,
    validate(getUserByIdSchema, 'params'),
    userController.getUserById,
);

router.put(
    '/:id',
    authMiddleware,
    validate(getUserByIdSchema, 'params'),
    validate(updateUserSchema),
    userController.updateUser,
);

router.delete(
    '/:id',
    authMiddleware,
    validate(deleteUserSchema, 'params'),
    userController.deleteUser,
);

export default router;

