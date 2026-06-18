import { Router } from 'express';
import { getChallenges, joinChallenge, completeChallenge, createChallenge } from '../controllers/challengeController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();
router.get('/', protect, getChallenges);
router.post('/:id/join', protect, joinChallenge);
router.post('/:id/complete', protect, completeChallenge);
router.post('/', protect, adminOnly, createChallenge);

export default router;
