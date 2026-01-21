import { Router } from 'express';
import healthRoutes from './health.routes';
import quizzRoutes from './quizz.routes';
import usersRoutes from './users.routes';
import authRoutes from './auth.routes';

const router = Router();

// Mount routes
router.use('/', healthRoutes);
router.use('/quizz', quizzRoutes);
router.use('/users', usersRoutes);
router.use('/auth', authRoutes);

export default router;

