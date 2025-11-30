import { Router } from 'express';
import * as columnController from '#src/controllers/column.controller.js';
import { authMiddleware } from '#src/middlewares/auth.middleware.js';
import { validate } from '#src/validation/middlewares/validate.js';
import {
    createColumnSchema,
    updateColumnSchema,
    columnIdSchema,
    projectIdSchema,
    reorderColumnSchema,
} from '#src/validation/schemas/column.schema.js';

const router = Router();

router.post(
    '/projects/:projectId/columns',
    authMiddleware,
    validate(projectIdSchema, 'params'),
    validate(createColumnSchema),
    columnController.createColumn,
);

router.get(
    '/projects/:projectId/columns',
    authMiddleware,
    validate(projectIdSchema, 'params'),
    columnController.getColumnsByProject,
);

router.get(
    '/:id',
    authMiddleware,
    validate(columnIdSchema, 'params'),
    columnController.getColumnById,
);

router.put(
    '/:id',
    authMiddleware,
    validate(columnIdSchema, 'params'),
    validate(updateColumnSchema),
    columnController.updateColumn,
);

router.delete(
    '/:id',
    authMiddleware,
    validate(columnIdSchema, 'params'),
    columnController.deleteColumn,
);

router.patch(
    '/:id/reorder',
    authMiddleware,
    validate(columnIdSchema, 'params'),
    validate(reorderColumnSchema),
    columnController.reorderColumn,
);

export default router;

