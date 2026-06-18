import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getChallenges = async (_req: Request, res: Response): Promise<void> => {
  try {
    const challenges = await prisma.challenge.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Populate participants in-memory
    const allUserIds = Array.from(new Set(challenges.flatMap(c => c.participants)));
    const users = await prisma.user.findMany({
      where: { id: { in: allUserIds } },
      select: { id: true, name: true, avatar: true },
    });

    const userMap = new Map(users.map(u => [u.id, u]));

    const populatedChallenges = challenges.map(c => ({
      ...c,
      participants: c.participants.map(pId => userMap.get(pId)).filter(Boolean),
    }));

    res.json({ success: true, data: populatedChallenges });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch challenges', error });
  }
};

export const joinChallenge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const challenge = await prisma.challenge.findUnique({
      where: { id: req.params.id },
    });
    if (!challenge) { res.status(404).json({ success: false, message: 'Challenge not found' }); return; }
    
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

    if (challenge.participants.includes(userId)) {
      res.status(400).json({ success: false, message: 'Already joined this challenge' }); return;
    }

    const updatedChallenge = await prisma.challenge.update({
      where: { id: challenge.id },
      data: {
        participants: {
          set: [...challenge.participants, userId],
        },
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        ecoPoints: { increment: 10 },
      },
    });

    res.json({ success: true, message: 'Joined challenge!', data: updatedChallenge });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to join challenge', error });
  }
};

export const completeChallenge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const challenge = await prisma.challenge.findUnique({
      where: { id: req.params.id },
    });
    if (!challenge) { res.status(404).json({ success: false, message: 'Challenge not found' }); return; }
    
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

    let updatedChallenge = challenge;
    if (!challenge.completedBy.includes(userId)) {
      updatedChallenge = await prisma.challenge.update({
        where: { id: challenge.id },
        data: {
          completedBy: {
            set: [...challenge.completedBy, userId],
          },
        },
      });

      const user = await prisma.user.findUnique({ where: { id: userId } });
      const badges = user?.badges || [];
      const updatedBadges = badges.includes(challenge.badge) ? badges : [...badges, challenge.badge];

      await prisma.user.update({
        where: { id: userId },
        data: {
          ecoPoints: { increment: challenge.ecoPointsReward },
          badges: { set: updatedBadges },
        },
      });
    }
    
    res.json({ success: true, message: 'Challenge completed!', data: updatedChallenge });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to complete challenge', error });
  }
};

export const createChallenge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, type, duration, startDate, endDate, badge, ecoPointsReward, status, imageUrl, difficulty, category, rules } = req.body;
    
    const challenge = await prisma.challenge.create({
      data: {
        title,
        description,
        type,
        duration: Number(duration),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        badge,
        ecoPointsReward: Number(ecoPointsReward || 100),
        status: status || 'upcoming',
        imageUrl,
        difficulty: difficulty || 'medium',
        category,
        rules: rules || [],
      },
    });
    res.status(201).json({ success: true, data: challenge });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create challenge', error });
  }
};
