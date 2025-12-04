import { Router } from 'express';
import * as authController from '#src/controllers/auth.controller.js';
import { authMiddleware } from '#src/middlewares/auth.middleware.js';
import { validate } from '#src/validation/middlewares/validate.js';
import {
    registerSchema,
    loginSchema,
} from '#src/validation/schemas/user.schema.js';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.get('/me', authMiddleware, authController.getCurrentUser);

export default router;
