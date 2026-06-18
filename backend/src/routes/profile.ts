import { Router, Response } from 'express';
import { prisma } from '../config/database';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(protect);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile', error });
  }
});

router.put('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

    const { name, bio, city, avatar } = req.body;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, bio, city, avatar },
    });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile', error });
  }
});

export default router;
