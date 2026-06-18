import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Carbon records for charts
    const monthlyRecords = await prisma.carbonRecord.findMany({
      where: { userId, createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: 'asc' },
    });

    const weeklyRecords = await prisma.carbonRecord.findMany({
      where: { userId, createdAt: { gte: sevenDaysAgo } },
      orderBy: { createdAt: 'asc' },
    });

    // Goals
    const activeGoals = await prisma.goal.findMany({
      where: { userId, status: 'active' },
    });

    const completedGoals = await prisma.goal.count({
      where: { userId, status: 'completed' },
    });

    // Challenges
    const activeChallenges = await prisma.challenge.findMany({
      where: {
        participants: { has: userId },
        status: 'active',
      },
    });

    // Trees
    const trees = await prisma.treePlantation.findMany({
      where: { userId },
    });
    const totalTrees = trees.reduce((sum, t) => sum + t.count, 0);
    const totalCO2Absorbed = trees.reduce((sum, t) => sum + t.totalCo2Absorbed, 0);

    // Leaderboard rank
    const allUsers = await prisma.user.findMany({
      orderBy: { ecoPoints: 'desc' },
      select: { id: true },
    });
    const rank = allUsers.findIndex(u => u.id === userId) + 1;

    // Carbon trend for line chart
    const carbonTrend = monthlyRecords.map(r => ({
      date: r.createdAt,
      daily: r.dailyCO2,
      monthly: r.monthlyCO2,
    }));

    // Monthly emissions for bar chart
    const monthlyEmissions = weeklyRecords.map(r => ({
      date: r.createdAt,
      value: r.dailyCO2,
    }));

    // Activity breakdown for pie chart
    const latestRecord = monthlyRecords[monthlyRecords.length - 1];
    let activityBreakdown = { transportation: 35, energy: 25, food: 20, waste: 10, shopping: 10 };
    if (latestRecord) {
      const trans = latestRecord.transportation as any;
      const energy = latestRecord.energy as any;
      const food = latestRecord.food as any;
      const waste = latestRecord.waste as any;
      const shopping = latestRecord.shopping as any;

      activityBreakdown = {
        transportation: ((trans?.car || 0) * 0.21 + (trans?.flight || 0) * 0.255 + (trans?.bus || 0) * 0.089),
        energy: ((energy?.electricity || 0) * 0.82 + (energy?.ac || 0) * 1.5),
        food: ((food?.meat || 0) * 7.2 + (food?.mixed || 0) * 5.0),
        waste: ((waste?.plastic || 0) * 6.0),
        shopping: ((shopping?.clothing || 0) * 15.0 + (shopping?.electronics || 0) * 70.0),
      };
    }

    res.json({
      success: true,
      data: {
        user: {
          name: user?.name,
          ecoPoints: user?.ecoPoints || 0,
          environmentalScore: user?.environmentalScore || 50,
          sustainabilityRank: user?.sustainabilityRank || 'Eco Beginner',
          badges: user?.badges || [],
          carbonSaved: user?.carbonSaved || 0,
          totalCarbonFootprint: user?.totalCarbonFootprint || 0,
          streak: user?.streak || 0,
        },
        stats: {
          globalRank: rank,
          treesPlanted: totalTrees,
          co2Absorbed: totalCO2Absorbed,
          activeGoals: activeGoals.length,
          completedGoals,
          activeChallenges: activeChallenges.length,
        },
        charts: { carbonTrend, monthlyEmissions, activityBreakdown },
        goals: activeGoals.slice(0, 3),
        challenges: activeChallenges.slice(0, 3),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load dashboard', error });
  }
};
