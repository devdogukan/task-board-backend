import { Router } from 'express';
import * as folderController from '#src/controllers/folder.controller.js';
import { authMiddleware } from '#src/middlewares/auth.middleware.js';
import { validate } from '#src/validation/middlewares/validate.js';
import {
    createFolderSchema,
    updateFolderSchema,
    folderIdSchema,
    addMemberSchema,
    removeMemberSchema,
} from '#src/validation/schemas/folder.schema.js';

const router = Router();

router.post(
    '/',
    authMiddleware,
    validate(createFolderSchema),
    folderController.createFolder,
);

router.get(
    '/',
    authMiddleware,
    folderController.getFolders,
);

router.get(
    '/:id',
    authMiddleware,
    validate(folderIdSchema, 'params'),
    folderController.getFolderById,
);

router.put(
    '/:id',
    authMiddleware,
    validate(folderIdSchema, 'params'),
    validate(updateFolderSchema),
    folderController.updateFolder,
);

router.delete(
    '/:id',
    authMiddleware,
    validate(folderIdSchema, 'params'),
    folderController.deleteFolder,
);

router.post(
    '/:id/members',
    authMiddleware,
    validate(folderIdSchema, 'params'),
    validate(addMemberSchema),
    folderController.addMember,
);

router.delete(
    '/:id/members/:userId',
    authMiddleware,
    validate(removeMemberSchema, 'params'),
    folderController.removeMember,
);

export default router;

