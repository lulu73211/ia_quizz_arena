import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  getProfile,
  updateProfile,
  getLeaderboard,
  updateScore,
} from '../controllers/users.controller';

const router = Router();

// Public routes
router.get('/leaderboard', getLeaderboard);

// Protected routes (require authentication)
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/score', authMiddleware, updateScore);

export default router;
