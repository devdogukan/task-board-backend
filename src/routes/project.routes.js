import { Router } from 'express';
import * as projectController from '#src/controllers/project.controller.js';
import { authMiddleware } from '#src/middlewares/auth.middleware.js';
import { validate } from '#src/validation/middlewares/validate.js';
import {
    createProjectSchema,
    updateProjectSchema,
    projectIdSchema,
    folderIdSchema,
    updateProjectStatusSchema,
    addMemberSchema,
    removeMemberSchema,
} from '#src/validation/schemas/project.schema.js';

const router = Router();

router.post(
    '/folders/:folderId/projects',
    authMiddleware,
    validate(folderIdSchema, 'params'),
    validate(createProjectSchema),
    projectController.createProject,
);

router.get(
    '/folders/:folderId/projects',
    authMiddleware,
    validate(folderIdSchema, 'params'),
    projectController.getProjectsByFolder,
);

router.get(
    '/:id',
    authMiddleware,
    validate(projectIdSchema, 'params'),
    projectController.getProjectById,
);

router.put(
    '/:id',
    authMiddleware,
    validate(projectIdSchema, 'params'),
    validate(updateProjectSchema),
    projectController.updateProject,
);

router.delete(
    '/:id',
    authMiddleware,
    validate(projectIdSchema, 'params'),
    projectController.deleteProject,
);

router.patch(
    '/:id/status',
    authMiddleware,
    validate(projectIdSchema, 'params'),
    validate(updateProjectStatusSchema),
    projectController.updateProjectStatus,
);

router.post(
    '/:id/members',
    authMiddleware,
    validate(projectIdSchema, 'params'),
    validate(addMemberSchema),
    projectController.addMember,
);

router.delete(
    '/:id/members/:userId',
    authMiddleware,
    validate(removeMemberSchema, 'params'),
    projectController.removeMember,
);

export default router;

