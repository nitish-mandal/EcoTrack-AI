import { Router, Response } from 'express';
import multer from 'multer';
import { prisma } from '../config/database';
import cloudinary from '../config/cloudinary';
import { protect, AuthRequest } from '../middleware/auth';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

    const trees = await prisma.treePlantation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    
    const totalTrees = trees.reduce((s, t) => s + t.count, 0);
    const totalCO2 = trees.reduce((s, t) => s + t.totalCo2Absorbed, 0);
    res.json({ success: true, data: { trees, totalTrees, totalCO2 } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch trees', error });
  }
});

router.post('/', protect, upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

    let imageUrl = '';
    if (req.file) {
      const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'ecotrack/trees' }, (err, result) => {
          if (err || !result) reject(err); else resolve(result);
        });
        stream.end(req.file!.buffer);
      });
      imageUrl = result.secure_url;
    }

    const { species, count, location, notes } = req.body;
    const co2PerTree = 21; // kg CO2 per year
    const totalCo2Absorbed = parseInt(count) * co2PerTree;

    const tree = await prisma.treePlantation.create({
      data: {
        userId,
        species,
        count: parseInt(count),
        location,
        imageUrl,
        notes,
        co2AbsorbedPerYear: co2PerTree,
        totalCo2Absorbed,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        treesPlanted: { increment: parseInt(count) },
        ecoPoints: { increment: parseInt(count) * 5 },
        carbonSaved: { increment: totalCo2Absorbed },
      },
    });

    res.status(201).json({ success: true, data: tree });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add tree', error });
  }
});

export default router;
