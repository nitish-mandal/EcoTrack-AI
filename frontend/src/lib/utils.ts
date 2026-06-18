import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCO2(value: number, unit = 'kg'): string {
  if (value >= 1000) return `${(value / 1000).toFixed(2)} t CO₂`;
  return `${value.toFixed(2)} ${unit} CO₂`;
}

export function formatNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}

export function getEcoRank(points: number): string {
  if (points >= 5000) return 'Sustainability Champion';
  if (points >= 2000) return 'Eco Warrior';
  if (points >= 1000) return 'Carbon Reducer';
  if (points >= 300) return 'Green Explorer';
  return 'Eco Beginner';
}

export function getRankColor(rank: string): string {
  const colors: Record<string, string> = {
    'Sustainability Champion': '#F59E0B',
    'Eco Warrior': '#8B5CF6',
    'Carbon Reducer': '#3B82F6',
    'Green Explorer': '#22C55E',
    'Eco Beginner': '#64748B',
  };
  return colors[rank] || '#64748B';
}

export function getCO2Level(daily: number): { level: string; color: string; description: string } {
  if (daily < 5) return { level: 'Excellent', color: '#22C55E', description: 'Below average — great job!' };
  if (daily < 10) return { level: 'Good', color: '#84CC16', description: 'Near average — keep improving!' };
  if (daily < 20) return { level: 'Average', color: '#F59E0B', description: 'Above average — room to improve.' };
  return { level: 'High', color: '#EF4444', description: 'Well above average — take action!' };
}

export function calculateProgress(current: number, target: number): number {
  return Math.min(Math.round((current / target) * 100), 100);
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

export const CATEGORY_COLORS = {
  transportation: '#3B82F6',
  energy: '#F59E0B',
  food: '#22C55E',
  waste: '#EF4444',
  shopping: '#8B5CF6',
  water: '#06B6D4',
};

export const ECO_TIPS = [
  '🚶 Walk or cycle for trips under 2km — saves ~0.5kg CO₂ each trip.',
  '🥗 Choose a plant-based meal today — reduces food emissions by 50%.',
  '💡 Switch off lights when leaving — saves up to 10% on electricity bills.',
  '♻️ Recycle one plastic bottle — prevents 0.06kg CO₂ from landfill.',
  '🌱 Plant a tree — it absorbs 21kg CO₂ per year on average.',
  '🚿 Reduce shower time by 2 mins — saves 10 liters of water.',
  '🛒 Bring a reusable bag — prevents 5kg CO₂ per year per bag.',
];

export const MOCK_CHART_DATA = {
  carbonTrend: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
    daily: Math.random() * 15 + 5,
    monthly: Math.random() * 400 + 150,
  })),
  activityBreakdown: {
    transportation: 35,
    energy: 25,
    food: 20,
    waste: 10,
    shopping: 10,
  },
};
