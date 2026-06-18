import { Router, Request, Response } from 'express';
import LearningContent from '../models/LearningContent';
import User from '../models/User';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const content = await LearningContent.find({ published: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch content', error });
  }
});

router.get('/:topic', async (req: Request, res: Response) => {
  try {
    const content = await LearningContent.find({ topic: req.params.topic, published: true });
    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch content', error });
  }
});

router.post('/quiz/submit', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { contentId, answers } = req.body;
    const content = await LearningContent.findById(contentId);
    if (!content || !content.quiz) { res.status(404).json({ success: false, message: 'Quiz not found' }); return; }
    let correct = 0;
    content.quiz.forEach((q, i) => { if (answers[i] === q.correctAnswer) correct++; });
    const score = Math.round((correct / content.quiz.length) * 100);
    const pointsEarned = score >= 70 ? content.ecoPointsReward : 0;
    if (pointsEarned > 0) await User.findByIdAndUpdate(req.user?.id, { $inc: { ecoPoints: pointsEarned } });
    res.json({ success: true, data: { score, correct, total: content.quiz.length, pointsEarned } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit quiz', error });
  }
});

export default router;
