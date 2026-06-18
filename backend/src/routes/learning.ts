import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const content = await prisma.learningContent.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch content', error });
  }
});

router.get('/:topic', async (req: Request, res: Response) => {
  try {
    const content = await prisma.learningContent.findMany({
      where: { topic: req.params.topic, published: true },
    });
    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch content', error });
  }
});

router.post('/quiz/submit', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

    const { contentId, answers } = req.body;
    const content = await prisma.learningContent.findUnique({
      where: { id: contentId },
    });
    
    if (!content || !content.quiz) { res.status(404).json({ success: false, message: 'Quiz not found' }); return; }
    
    const quizList = (content.quiz as any[]) || [];
    let correct = 0;
    
    quizList.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    
    const score = Math.round((correct / quizList.length) * 100);
    const pointsEarned = score >= 70 ? content.ecoPointsReward : 0;
    
    if (pointsEarned > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { ecoPoints: { increment: pointsEarned } },
      });
    }
    
    res.json({ success: true, data: { score, correct, total: quizList.length, pointsEarned } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit quiz', error });
  }
});

export default router;
