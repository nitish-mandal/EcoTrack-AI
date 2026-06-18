import { Router, Response } from 'express';
import { prisma } from '../config/database';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(protect);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

    const { period = 'monthly' } = req.query;
    const now = new Date();
    let startDate: Date;
    if (period === 'weekly') startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    else if (period === 'annual') startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    else startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const records = await prisma.carbonRecord.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalCO2 = records.reduce((sum, r) => sum + r.dailyCO2, 0);
    const avgDaily = totalCO2 / (records.length || 1);

    res.json({ success: true, data: { records, totalCO2, avgDaily, period, recordCount: records.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate report', error });
  }
});

export default router;
