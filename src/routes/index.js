import { Router } from 'express';

import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import folderRoutes from './folder.routes.js';
import projectRoutes from './project.routes.js';
import columnRoutes from './column.routes.js';
import taskRoutes from './task.routes.js';

import { rateLimit } from '#src/middlewares/rate.limiter.js';

const router = Router();

router.use('/auth', rateLimit('auth'), authRoutes);
router.use('/users', rateLimit('user'), userRoutes);
router.use('/folders', rateLimit('folder'), folderRoutes);
router.use('/projects', rateLimit('project'), projectRoutes);
router.use('/columns', rateLimit('column'), columnRoutes);
router.use('/tasks', rateLimit('task'), taskRoutes);

export default router;