import { Router, Response } from 'express';
import { prisma } from '../config/database';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/global', protect, async (_req, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { ecoPoints: 'desc' },
      take: 50,
      select: {
        id: true,
        name: true,
        avatar: true,
        ecoPoints: true,
        sustainabilityRank: true,
        city: true,
        treesPlanted: true,
        carbonSaved: true,
      },
    });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard', error });
  }
});

router.get('/city', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

    const me = await prisma.user.findUnique({ where: { id: userId } });
    if (!me?.city) {
      res.json({ success: true, data: [] });
      return;
    }

    const users = await prisma.user.findMany({
      where: { city: me.city },
      orderBy: { ecoPoints: 'desc' },
      take: 20,
      select: {
        id: true,
        name: true,
        avatar: true,
        ecoPoints: true,
        city: true,
      },
    });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch city leaderboard', error });
  }
});

export default router;
