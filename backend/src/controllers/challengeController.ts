import { Request, Response } from 'express';
import Challenge from '../models/Challenge';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getChallenges = async (_req: Request, res: Response): Promise<void> => {
  try {
    const challenges = await Challenge.find().sort({ createdAt: -1 }).populate('participants', 'name avatar');
    res.json({ success: true, data: challenges });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch challenges', error });
  }
};

export const joinChallenge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) { res.status(404).json({ success: false, message: 'Challenge not found' }); return; }
    const userId = req.user?.id;
    if (challenge.participants.some(p => p.toString() === userId)) {
      res.status(400).json({ success: false, message: 'Already joined this challenge' }); return;
    }
    challenge.participants.push(userId as any);
    await challenge.save();
    await User.findByIdAndUpdate(userId, { $inc: { ecoPoints: 10 } });
    res.json({ success: true, message: 'Joined challenge!', data: challenge });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to join challenge', error });
  }
};

export const completeChallenge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) { res.status(404).json({ success: false, message: 'Challenge not found' }); return; }
    const userId = req.user?.id as any;
    if (!challenge.completedBy.includes(userId)) {
      challenge.completedBy.push(userId);
      await challenge.save();
      await User.findByIdAndUpdate(userId, {
        $inc: { ecoPoints: challenge.ecoPointsReward },
        $addToSet: { badges: challenge.badge },
      });
    }
    res.json({ success: true, message: 'Challenge completed!', data: challenge });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to complete challenge', error });
  }
};

export const createChallenge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const challenge = await Challenge.create(req.body);
    res.status(201).json({ success: true, data: challenge });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create challenge', error });
  }
};
