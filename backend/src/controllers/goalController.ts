import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getGoals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.user?.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: goals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch goals', error });
  }
};

export const createGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, type, description, target, unit, deadline, milestones, reminder, reminderFrequency } = req.body;
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

    const goal = await prisma.goal.create({
      data: {
        userId,
        title,
        type,
        description,
        target: Number(target),
        unit: unit || 'kg CO₂',
        deadline: new Date(deadline),
        milestones: milestones || [],
        reminder: reminder || false,
        reminderFrequency: reminderFrequency || 'weekly',
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { ecoPoints: { increment: 5 } },
    });

    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create goal', error });
  }
};

export const updateGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

    const goal = await prisma.goal.findFirst({
      where: { id: req.params.id, userId },
    });
    if (!goal) { res.status(404).json({ success: false, message: 'Goal not found' }); return; }

    const { title, type, description, target, unit, deadline, status, milestones, reminder, reminderFrequency } = req.body;
    const newCurrent = req.body.current !== undefined ? Number(req.body.current) : goal.current;
    const newTarget = target !== undefined ? Number(target) : goal.target;
    
    let finalStatus = status || goal.status;
    let completedAt = goal.completedAt;

    if (newCurrent >= newTarget && finalStatus === 'active') {
      finalStatus = 'completed';
      completedAt = new Date();
      await prisma.user.update({
        where: { id: userId },
        data: { ecoPoints: { increment: 50 } },
      });
    }

    const updated = await prisma.goal.update({
      where: { id: goal.id },
      data: {
        title: title || goal.title,
        type: type || goal.type,
        description: description !== undefined ? description : goal.description,
        target: newTarget,
        current: newCurrent,
        unit: unit || goal.unit,
        deadline: deadline ? new Date(deadline) : goal.deadline,
        status: finalStatus,
        milestones: milestones || goal.milestones,
        reminder: reminder !== undefined ? reminder : goal.reminder,
        reminderFrequency: reminderFrequency || goal.reminderFrequency,
        completedAt,
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update goal', error });
  }
};

export const deleteGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

    const goal = await prisma.goal.findFirst({
      where: { id: req.params.id, userId },
    });
    if (!goal) { res.status(404).json({ success: false, message: 'Goal not found' }); return; }

    await prisma.goal.delete({
      where: { id: goal.id },
    });

    res.json({ success: true, message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete goal', error });
  }
};

export const updateProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

    const goal = await prisma.goal.findFirst({
      where: { id: req.params.id, userId },
    });
    if (!goal) { res.status(404).json({ success: false, message: 'Goal not found' }); return; }

    const current = Number(req.body.current);
    const existingMilestones = (goal.milestones as any[]) || [];
    
    const updatedMilestones = existingMilestones.map((m: any) => ({
      ...m,
      achieved: current >= m.value,
      achievedAt: !m.achieved && current >= m.value ? new Date() : m.achievedAt,
    }));

    let finalStatus = goal.status;
    let completedAt = goal.completedAt;

    if (current >= goal.target && finalStatus === 'active') {
      finalStatus = 'completed';
      completedAt = new Date();
      await prisma.user.update({
        where: { id: userId },
        data: { ecoPoints: { increment: 50 } },
      });
    }

    const updated = await prisma.goal.update({
      where: { id: goal.id },
      data: {
        current,
        milestones: updatedMilestones,
        status: finalStatus,
        completedAt,
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update progress', error });
  }
};
