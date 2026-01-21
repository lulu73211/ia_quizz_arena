import { Router } from 'express';
import { getQuizzQuestions } from '../controllers/quizz.controller';

const router = Router();

router.post('/generate', getQuizzQuestions);

export default router;
