import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  register,
  verifyToken,
  getUserById,
  deleteAccount,
} from '../controllers/auth.controller';

const router = Router();

// Public routes
router.get('/user/:uid', getUserById);

// Protected routes (require Firebase token)
router.post('/register', authMiddleware, register);
router.get('/verify', authMiddleware, verifyToken);
router.delete('/account', authMiddleware, deleteAccount);

export default router;
