import { Router, Response } from 'express';
import User from '../models/User';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(protect);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile', error });
  }
});

router.put('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, bio, city, avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.user?.id, { name, bio, city, avatar }, { new: true });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile', error });
  }
});

export default router;
