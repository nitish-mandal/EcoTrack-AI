import { Response } from 'express';
import User from '../models/User';
import CarbonRecord from '../models/CarbonRecord';
import Goal from '../models/Goal';
import Challenge from '../models/Challenge';
import TreePlantation from '../models/TreePlantation';
import { AuthRequest } from '../middleware/auth';

export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Carbon records for charts
    const monthlyRecords = await CarbonRecord.find({ userId, createdAt: { $gte: thirtyDaysAgo } }).sort({ createdAt: 1 });
    const weeklyRecords = await CarbonRecord.find({ userId, createdAt: { $gte: sevenDaysAgo } }).sort({ createdAt: 1 });

    // Goals
    const activeGoals = await Goal.find({ userId, status: 'active' });
    const completedGoals = await Goal.countDocuments({ userId, status: 'completed' });

    // Challenges
    const activeChallenges = await Challenge.find({ participants: userId, status: 'active' });

    // Trees
    const trees = await TreePlantation.find({ userId });
    const totalTrees = trees.reduce((sum, t) => sum + t.count, 0);
    const totalCO2Absorbed = trees.reduce((sum, t) => sum + t.totalCo2Absorbed, 0);

    // Leaderboard rank placeholder
    const allUsers = await User.find().sort({ ecoPoints: -1 }).select('_id');
    const rank = allUsers.findIndex(u => u._id.toString() === userId) + 1;

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
    const activityBreakdown = latestRecord ? {
      transportation: (latestRecord.transportation.car * 0.21 + latestRecord.transportation.flight * 0.255 + latestRecord.transportation.bus * 0.089),
      energy: (latestRecord.energy.electricity * 0.82 + latestRecord.energy.ac * 1.5),
      food: (latestRecord.food.meat * 7.2 + latestRecord.food.mixed * 5.0),
      waste: (latestRecord.waste.plastic * 6.0),
      shopping: (latestRecord.shopping.clothing * 15.0 + latestRecord.shopping.electronics * 70.0),
    } : { transportation: 35, energy: 25, food: 20, waste: 10, shopping: 10 };

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
