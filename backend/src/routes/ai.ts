import { Router } from 'express';
import { chat, getDailyTip, getChatHistory, predictEmissions } from '../controllers/aiController';
import { protect } from '../middleware/auth';

const router = Router();
router.post('/chat', protect, chat);
router.get('/tip', getDailyTip);
router.get('/history', protect, getChatHistory);
router.post('/predict', protect, predictEmissions);

export default router;
