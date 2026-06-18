import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';

// CO2 emission factors (kg CO2 per unit)
const EMISSION_FACTORS = {
  car: 0.21,           // per km
  bike: 0.0,           // zero emissions
  bus: 0.089,          // per km
  train: 0.041,        // per km
  metro: 0.035,        // per km
  flight: 0.255,       // per km
  electricity: 0.82,   // per kWh (India grid avg)
  ac: 1.5,             // per hour
  appliances: 0.3,     // per kWh
  vegetarian: 3.8,     // per day kg CO2
  vegan: 2.9,          // per day
  mixed: 5.0,          // per day
  meat: 7.2,           // per day
  plastic: 6.0,        // per kg
  organic: 0.5,        // per kg
  recyclable: 1.0,     // per kg
  clothing: 15.0,      // per item
  electronics: 70.0,   // per item
  water: 0.001,        // per liter
};

export const calculate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { transportation, energy, food, waste, shopping, water } = req.body;

    const transportCO2 =
      (transportation?.car || 0) * EMISSION_FACTORS.car +
      (transportation?.bike || 0) * EMISSION_FACTORS.bike +
      (transportation?.bus || 0) * EMISSION_FACTORS.bus +
      (transportation?.train || 0) * EMISSION_FACTORS.train +
      (transportation?.metro || 0) * EMISSION_FACTORS.metro +
      (transportation?.flight || 0) * EMISSION_FACTORS.flight;

    const energyCO2 =
      (energy?.electricity || 0) * EMISSION_FACTORS.electricity +
      (energy?.ac || 0) * EMISSION_FACTORS.ac +
      (energy?.appliances || 0) * EMISSION_FACTORS.appliances;

    const foodCO2 =
      (food?.vegetarian || 0) * EMISSION_FACTORS.vegetarian +
      (food?.vegan || 0) * EMISSION_FACTORS.vegan +
      (food?.mixed || 0) * EMISSION_FACTORS.mixed +
      (food?.meat || 0) * EMISSION_FACTORS.meat;

    const wasteCO2 =
      (waste?.plastic || 0) * EMISSION_FACTORS.plastic +
      (waste?.organic || 0) * EMISSION_FACTORS.organic +
      (waste?.recyclable || 0) * EMISSION_FACTORS.recyclable;

    const shoppingCO2 =
      (shopping?.clothing || 0) * EMISSION_FACTORS.clothing +
      (shopping?.electronics || 0) * EMISSION_FACTORS.electronics;

    const waterCO2 = (water?.daily || 0) * EMISSION_FACTORS.water;

    const dailyCO2 = transportCO2 + energyCO2 + foodCO2 + wasteCO2 + shoppingCO2 + waterCO2;
    const weeklyCO2 = dailyCO2 * 7;
    const monthlyCO2 = dailyCO2 * 30;
    const annualCO2 = dailyCO2 * 365;

    if (!req.user?.id) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

    const record = await prisma.carbonRecord.create({
      data: {
        userId: req.user.id,
        transportation: transportation || {},
        energy: energy || {},
        food: food || {},
        waste: waste || {},
        shopping: shopping || {},
        water: water || {},
        dailyCO2,
        weeklyCO2,
        monthlyCO2,
        annualCO2,
      },
    });

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        totalCarbonFootprint: { increment: dailyCO2 },
        ecoPoints: { increment: 10 },
      },
    });

    res.status(201).json({
      success: true,
      data: {
        record,
        breakdown: { transportCO2, energyCO2, foodCO2, wasteCO2, shoppingCO2, waterCO2 },
        summary: { dailyCO2, weeklyCO2, monthlyCO2, annualCO2 },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Calculation failed', error });
  }
};

export const getHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    if (!req.user?.id) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

    const records = await prisma.carbonRecord.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: (Number(page) - 1) * Number(limit),
    });

    const total = await prisma.carbonRecord.count({
      where: { userId: req.user.id },
    });

    res.json({ success: true, data: records, pagination: { page: Number(page), limit: Number(limit), total } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch history', error });
  }
};

export const getSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const records = await prisma.carbonRecord.findMany({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: { createdAt: 'asc' },
    });

    const dailyTrend = records.map(r => ({ date: r.date, value: r.dailyCO2 }));
    const totalMonthly = records.reduce((sum, r) => sum + r.monthlyCO2, 0);

    // Category breakdown from latest record
    const latest = records[records.length - 1];
    let breakdown = {};
    if (latest) {
      const trans = latest.transportation as any;
      const energy = latest.energy as any;
      const food = latest.food as any;
      const waste = latest.waste as any;

      breakdown = {
        transportation: ((trans?.car || 0) + (trans?.bus || 0) + (trans?.train || 0) + (trans?.flight || 0)) * EMISSION_FACTORS.car,
        energy: (energy?.electricity || 0) + (energy?.ac || 0),
        food: (food?.meat || 0) + (food?.mixed || 0),
        waste: (waste?.plastic || 0) + (waste?.organic || 0),
      };
    }

    res.json({ success: true, data: { dailyTrend, totalMonthly, breakdown, recordCount: records.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get summary', error });
  }
};
