import { Router, Response } from 'express';
import { prisma } from '../config/database';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();
router.use(protect, adminOnly);

// User management
router.get('/users', async (_req, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users', error });
  }
});

router.delete('/users/:id', async (req, res: Response) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user', error });
  }
});

router.patch('/users/:id/role', async (req, res: Response) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: req.body.role },
    });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update role', error });
  }
});

// Analytics
router.get('/analytics', async (_req, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalRecords = await prisma.carbonRecord.count();
    const totalChallenges = await prisma.challenge.count();

    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    const totalCO2Aggregate = await prisma.carbonRecord.aggregate({
      _sum: {
        dailyCO2: true,
      },
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalRecords,
        totalChallenges,
        totalCO2Tracked: totalCO2Aggregate._sum.dailyCO2 || 0,
        recentUsers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch analytics', error });
  }
});

// Content management
router.post('/content', async (req, res: Response) => {
  try {
    const { title, topic, type, content, imageUrl, videoUrl, readTime, difficulty, quiz, ecoPointsReward, published } = req.body;
    
    const learningContent = await prisma.learningContent.create({
      data: {
        title,
        topic,
        type,
        content,
        imageUrl,
        videoUrl,
        readTime: readTime ? Number(readTime) : undefined,
        difficulty: difficulty || 'beginner',
        quiz: quiz || [],
        ecoPointsReward: ecoPointsReward ? Number(ecoPointsReward) : undefined,
        published: published !== undefined ? published : true,
      },
    });
    res.status(201).json({ success: true, data: learningContent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create content', error });
  }
});

router.put('/content/:id', async (req, res: Response) => {
  try {
    const { title, topic, type, content, imageUrl, videoUrl, readTime, difficulty, quiz, ecoPointsReward, published } = req.body;
    
    const learningContent = await prisma.learningContent.update({
      where: { id: req.params.id },
      data: {
        title,
        topic,
        type,
        content,
        imageUrl,
        videoUrl,
        readTime: readTime !== undefined ? (readTime ? Number(readTime) : null) : undefined,
        difficulty,
        quiz,
        ecoPointsReward: ecoPointsReward !== undefined ? Number(ecoPointsReward) : undefined,
        published,
      },
    });
    res.json({ success: true, data: learningContent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update content', error });
  }
});

export default router;
