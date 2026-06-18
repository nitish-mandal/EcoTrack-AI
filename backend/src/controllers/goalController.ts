import { Response } from 'express';
import Goal from '../models/Goal';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getGoals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const goals = await Goal.find({ userId: req.user?.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: goals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch goals', error });
  }
};

export const createGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, type, description, target, unit, deadline, milestones, reminder, reminderFrequency } = req.body;
    const goal = await Goal.create({ userId: req.user?.id, title, type, description, target, unit, deadline, milestones, reminder, reminderFrequency });
    await User.findByIdAndUpdate(req.user?.id, { $inc: { ecoPoints: 5 } });
    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create goal', error });
  }
};

export const updateGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user?.id });
    if (!goal) { res.status(404).json({ success: false, message: 'Goal not found' }); return; }
    Object.assign(goal, req.body);
    if (goal.current >= goal.target && goal.status === 'active') {
      goal.status = 'completed';
      goal.completedAt = new Date();
      await User.findByIdAndUpdate(req.user?.id, { $inc: { ecoPoints: 50 } });
    }
    await goal.save();
    res.json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update goal', error });
  }
};

export const deleteGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user?.id });
    res.json({ success: true, message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete goal', error });
  }
};

export const updateProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user?.id });
    if (!goal) { res.status(404).json({ success: false, message: 'Goal not found' }); return; }
    goal.current = req.body.current;
    goal.milestones = goal.milestones.map((m: any) => ({
      ...(m.toObject ? m.toObject() : m),
      achieved: goal.current >= m.value,
      achievedAt: !m.achieved && goal.current >= m.value ? new Date() : m.achievedAt,
    }));
    if (goal.current >= goal.target) {
      goal.status = 'completed';
      goal.completedAt = new Date();
      await User.findByIdAndUpdate(req.user?.id, { $inc: { ecoPoints: 50 } });
    }
    await goal.save();
    res.json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update progress', error });
  }
};
