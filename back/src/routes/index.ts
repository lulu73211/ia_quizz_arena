import { Router } from 'express';
import healthRoutes from './health.routes';
import quizzRoutes from './quizz.routes';

const router = Router();

// Mount routes
router.use('/', healthRoutes);
router.use('/quizz', quizzRoutes);

export default router;

