import { Router } from 'express';
import { calculate, getHistory, getSummary } from '../controllers/carbonController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);
router.post('/calculate', calculate);
router.get('/history', getHistory);
router.get('/summary', getSummary);

export default router;
