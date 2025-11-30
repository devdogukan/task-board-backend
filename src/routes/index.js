import { Router } from 'express';

import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import folderRoutes from './folder.routes.js';
import projectRoutes from './project.routes.js';
import columnRoutes from './column.routes.js';
import taskRoutes from './task.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/folders', folderRoutes);
router.use('/projects', projectRoutes);
router.use('/columns', columnRoutes);
router.use('/tasks', taskRoutes);

export default router;