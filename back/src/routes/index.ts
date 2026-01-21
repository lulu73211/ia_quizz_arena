import { Router } from 'express';
import healthRoutes from './health.routes';

const router = Router();

// Mount routes
router.use('/', healthRoutes);

// Add more routes here as needed:
// router.use('/quizz', quizzRoutes);
// router.use('/users', userRoutes);

export default router;
