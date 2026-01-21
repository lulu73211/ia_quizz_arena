import { Router } from 'express';
import { getHealth, getWelcome } from '../controllers/health.controller';

const router = Router();

router.get('/', getWelcome);
router.get('/health', getHealth);

export default router;
