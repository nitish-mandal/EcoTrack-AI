import { Router, Response } from 'express';
import User from '../models/User';
import CarbonRecord from '../models/CarbonRecord';
import Challenge from '../models/Challenge';
import LearningContent from '../models/LearningContent';
import { protect, adminOnly, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(protect, adminOnly);

// User management
router.get('/users', async (_req, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users', error });
  }
});

router.delete('/users/:id', async (req, res: Response) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user', error });
  }
});

router.patch('/users/:id/role', async (req, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update role', error });
  }
});

// Analytics
router.get('/analytics', async (_req, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRecords = await CarbonRecord.countDocuments();
    const totalChallenges = await Challenge.countDocuments();
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt');
    const totalCO2 = await CarbonRecord.aggregate([{ $group: { _id: null, total: { $sum: '$dailyCO2' } } }]);
    res.json({
      success: true,
      data: {
        totalUsers, totalRecords, totalChallenges,
        totalCO2Tracked: totalCO2[0]?.total || 0,
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
    const content = await LearningContent.create(req.body);
    res.status(201).json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create content', error });
  }
});

router.put('/content/:id', async (req, res: Response) => {
  try {
    const content = await LearningContent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update content', error });
  }
});

export default router;
