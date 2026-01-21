import { Router } from 'express';
import { 
  generateQuizzQuestions, 
  getMyQuizzes, 
  getQuizById, 
  deleteQuiz 
} from '../controllers/quizz.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Generate a new quiz (requires authentication)
router.post('/generate', authMiddleware, generateQuizzQuestions);

// Get all quizzes owned by the current user (requires authentication)
router.get('/my-quizzes', authMiddleware, getMyQuizzes);

// Get a specific quiz by ID (public)
router.get('/:id', getQuizById);

// Delete a quiz (requires authentication, only owner)
router.delete('/:id', authMiddleware, deleteQuiz);

export default router;
