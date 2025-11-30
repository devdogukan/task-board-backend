import { Router } from 'express';
import * as taskController from '#src/controllers/task.controller.js';
import { authMiddleware } from '#src/middlewares/auth.middleware.js';
import { validate } from '#src/validation/middlewares/validate.js';
import {
    createTaskSchema,
    updateTaskSchema,
    taskIdSchema,
    projectIdSchema,
    moveTaskSchema,
    reorderTaskSchema,
    addAssigneeSchema,
    removeAssigneeSchema,
    getTasksQuerySchema,
} from '#src/validation/schemas/task.schema.js';

const router = Router();

router.post(
    '/projects/:projectId/tasks',
    authMiddleware,
    validate(projectIdSchema, 'params'),
    validate(createTaskSchema),
    taskController.createTask,
);

router.get(
    '/projects/:projectId/tasks',
    authMiddleware,
    validate(projectIdSchema, 'params'),
    validate(getTasksQuerySchema, 'query'),
    taskController.getTasksByProject,
);

router.get(
    '/:id',
    authMiddleware,
    validate(taskIdSchema, 'params'),
    taskController.getTaskById,
);

router.put(
    '/:id',
    authMiddleware,
    validate(taskIdSchema, 'params'),
    validate(updateTaskSchema),
    taskController.updateTask,
);

router.delete(
    '/:id',
    authMiddleware,
    validate(taskIdSchema, 'params'),
    taskController.deleteTask,
);

router.patch(
    '/:id/move',
    authMiddleware,
    validate(taskIdSchema, 'params'),
    validate(moveTaskSchema),
    taskController.moveTask,
);

router.patch(
    '/:id/reorder',
    authMiddleware,
    validate(taskIdSchema, 'params'),
    validate(reorderTaskSchema),
    taskController.reorderTask,
);

router.post(
    '/:id/assignees',
    authMiddleware,
    validate(taskIdSchema, 'params'),
    validate(addAssigneeSchema),
    taskController.addAssignee,
);

router.delete(
    '/:id/assignees/:userId',
    authMiddleware,
    validate(removeAssigneeSchema, 'params'),
    taskController.removeAssignee,
);

export default router;

