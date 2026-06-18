import { Router, Response } from 'express';
import User from '../models/User';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/global', protect, async (_req, res: Response) => {
  try {
    const users = await User.find().sort({ ecoPoints: -1 }).limit(50).select('name avatar ecoPoints sustainabilityRank city treesPlanted carbonSaved');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard', error });
  }
});

router.get('/city', protect, async (req: AuthRequest, res: Response) => {
  try {
    const me = await User.findById(req.user?.id);
    const users = await User.find({ city: me?.city }).sort({ ecoPoints: -1 }).limit(20).select('name avatar ecoPoints city');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch city leaderboard', error });
  }
});

export default router;
