'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Leaf, Zap, TreePine, Target, Award, Globe, TrendingDown, TrendingUp,
  BarChart3, Activity, ArrowUp, ArrowDown, Calendar, Flame
} from 'lucide-react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, BarElement, Tooltip, Legend, Filler
} from 'chart.js';
import { dashboardAPI } from '@/services/api';
import { useAuthStore, useThemeStore } from '@/store';
import DashboardLayout from '@/components/DashboardLayout';
import { cn } from '@/lib/utils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend, Filler);

interface DashboardData {
  user: {
    name: string;
    ecoPoints: number;
    environmentalScore: number;
    sustainabilityRank: string;
    badges: string[];
    carbonSaved: number;
    totalCarbonFootprint: number;
    streak: number;
  };
  stats: {
    globalRank: number;
    treesPlanted: number;
    co2Absorbed: number;
    activeGoals: number;
    completedGoals: number;
    activeChallenges: number;
  };
  charts: {
    carbonTrend: Array<{ date: string; daily: number; monthly: number }>;
    monthlyEmissions: Array<{ date: string; value: number }>;
    activityBreakdown: { transportation: number; energy: number; food: number; waste: number; shopping: number };
  };
  goals: Array<{ _id: string; title: string; target: number; current: number; unit: string; deadline: string }>;
  challenges: Array<{ _id: string; title: string; category: string; endDate: string }>;
}

const mockData: DashboardData = {
  user: { name: 'Eco User', ecoPoints: 1250, environmentalScore: 72, sustainabilityRank: 'Carbon Reducer', badges: ['🌱', '⚡', '♻️'], carbonSaved: 45.2, totalCarbonFootprint: 8.4, streak: 7 },
  stats: { globalRank: 142, treesPlanted: 12, co2Absorbed: 24, activeGoals: 3, completedGoals: 8, activeChallenges: 2 },
  charts: {
    carbonTrend: [1,2,3,4,5,6,7].map((d, i) => ({ date: `Day ${d}`, daily: 8 - i * 0.3 + Math.random(), monthly: 240 - i * 9 })),
    monthlyEmissions: [1,2,3,4,5,6,7].map((d, i) => ({ date: `Day ${d}`, value: 7 + Math.random() * 4 })),
    activityBreakdown: { transportation: 35, energy: 25, food: 20, waste: 10, shopping: 10 },
  },
  goals: [
    { _id: '1', title: 'Reduce car usage by 20%', target: 20, current: 14, unit: '%', deadline: '2026-07-01' },
    { _id: '2', title: 'Plant 20 trees this month', target: 20, current: 12, unit: 'trees', deadline: '2026-06-30' },
    { _id: '3', title: 'Switch to renewable energy', target: 100, current: 60, unit: '%', deadline: '2026-08-01' },
  ],
  challenges: [
    { _id: '1', title: 'No Plastic Week', category: 'waste', endDate: '2026-06-25' },
    { _id: '2', title: 'Walk to Work Challenge', category: 'transport', endDate: '2026-06-30' },
  ],
};

function StatCard({ icon: Icon, label, value, sub, color, trend }: { icon: React.ElementType; label: string; value: string | number; sub?: string; color: string; trend?: 'up' | 'down' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card card-hover"
      style={{ borderRadius: 20, padding: '24px', display: 'flex', flexDirection: 'column', gap: 0 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}18`, flexShrink: 0 }}>
          <Icon style={{ width: 22, height: 22, color }} />
        </div>
        {trend && (
          <span className={cn('text-xs font-semibold flex items-center gap-1 px-2.5 py-1.5 rounded-full',
            trend === 'down' ? 'bg-green-50 text-green-600 dark:bg-green-900/30' : 'bg-red-50 text-red-500 dark:bg-red-900/30')}>
            {trend === 'down' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
            {trend === 'down' ? 'Reduced' : 'Up'}
          </span>
        )}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 6, fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: 4 }}>{sub}</div>}
    </motion.div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>(mockData);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const { isDark } = useThemeStore();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await dashboardAPI.get();
        setData(res.data.data);
      } catch {
        // use mock data
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: isDark ? '#1e293b' : '#fff', titleColor: isDark ? '#f8fafc' : '#0f172a', bodyColor: '#64748b', borderColor: 'rgba(34,197,94,0.2)', borderWidth: 1, padding: 12, cornerRadius: 10 },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } },
      y: { grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }, ticks: { color: '#94a3b8', font: { size: 11 } } },
    },
  };

  const lineData = {
    labels: data.charts.carbonTrend.map(d => d.date),
    datasets: [{
      label: 'Daily CO₂ (kg)', data: data.charts.carbonTrend.map(d => d.daily),
      borderColor: '#22C55E', backgroundColor: 'rgba(34,197,94,0.08)', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#22C55E', borderWidth: 2.5,
    }],
  };

  const barData = {
    labels: data.charts.monthlyEmissions.map(d => d.date),
    datasets: [{
      label: 'Emissions (kg)', data: data.charts.monthlyEmissions.map(d => d.value),
      backgroundColor: 'rgba(34,197,94,0.75)', borderRadius: 8, borderSkipped: false,
    }],
  };

  const breakdown = data.charts.activityBreakdown;
  const doughnutData = {
    labels: ['Transportation', 'Energy', 'Food', 'Waste', 'Shopping'],
    datasets: [{
      data: [breakdown.transportation, breakdown.energy, breakdown.food, breakdown.waste, breakdown.shopping],
      backgroundColor: ['#22C55E', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6'],
      borderWidth: 0, hoverOffset: 8,
    }],
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 className="page-title">Welcome back, {data.user.name?.split(' ')[0]} 👋</h1>
            <p className="page-subtitle">Here's your sustainability overview for today</p>
          </div>
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 10, borderRadius: 14, padding: '10px 18px' }}>
            <Flame style={{ width: 20, height: 20, color: '#F97316' }} />
            <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem' }}>{data.user.streak} day streak</span>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          <StatCard icon={Zap} label="Eco Points" value={data.user.ecoPoints.toLocaleString()} sub="Keep earning!" color="#F59E0B" />
          <StatCard icon={Activity} label="Carbon Score" value={`${data.user.environmentalScore}/100`} sub={data.user.sustainabilityRank} color="#22C55E" trend="down" />
          <StatCard icon={Globe} label="Global Rank" value={`#${data.stats.globalRank}`} sub="Top performers" color="#3B82F6" />
          <StatCard icon={TreePine} label="Trees Planted" value={data.stats.treesPlanted} sub={`${data.stats.co2Absorbed}kg CO₂ absorbed`} color="#84CC16" />
        </div>

        {/* ── Charts Row 1: Line + Doughnut ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
          <div style={{ display: 'grid', gap: 24 }} className="lg:grid-cols-3">
            {/* Line chart - 2/3 width */}
            <div className="glass-card" style={{ borderRadius: 20, padding: '24px', gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 className="section-title">Carbon Trend (7 days)</h3>
                <span style={{ fontSize: '0.75rem', background: 'rgba(34,197,94,0.1)', color: '#16A34A', padding: '5px 12px', borderRadius: 99, fontWeight: 600 }}>kg CO₂/day</span>
              </div>
              <div style={{ height: 240 }}>
                <Line data={lineData} options={chartDefaults as object} />
              </div>
            </div>

            {/* Doughnut - 1/3 width */}
            <div className="glass-card" style={{ borderRadius: 20, padding: '24px' }}>
              <h3 className="section-title" style={{ marginBottom: 20 }}>Activity Breakdown</h3>
              <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Doughnut data={doughnutData} options={{ ...chartDefaults as object, cutout: '65%', plugins: { legend: { display: false } } }} />
              </div>
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {doughnutData.labels.map((l, i) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: doughnutData.datasets[0].backgroundColor[i], flexShrink: 0 }} />
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{l}</span>
                    </div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-2)' }}>{doughnutData.datasets[0].data[i]}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Charts Row 2: Bar + Goals ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {/* Bar chart */}
          <div className="glass-card" style={{ borderRadius: 20, padding: '24px', flex: '2 1 300px' }}>
            <h3 className="section-title" style={{ marginBottom: 20 }}>Weekly Emissions (kg CO₂)</h3>
            <div style={{ height: 220 }}>
              <Bar data={barData} options={chartDefaults as object} />
            </div>
          </div>

          {/* Active Goals */}
          <div className="glass-card" style={{ borderRadius: 20, padding: '24px', flex: '1 1 260px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 className="section-title">Active Goals</h3>
              <a href="/goals" style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>View all →</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {data.goals.slice(0, 3).map(g => {
                const pct = Math.min(100, Math.round((g.current / g.target) * 100));
                return (
                  <div key={g._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-2)', fontWeight: 600, paddingRight: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</span>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 700, flexShrink: 0 }}>{pct}%</span>
                    </div>
                    <div className="progress-bar">
                      <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.3 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Bottom: Badges & Challenges ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          <div className="glass-card" style={{ borderRadius: 20, padding: '24px' }}>
            <h3 className="section-title" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award style={{ width: 18, height: 18, color: '#F59E0B' }} /> Your Badges
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {(data.user.badges?.length ?? 0) > 0 ? (data.user.badges ?? []).map((b, i) => (
                <span key={i} className="glass-card" style={{ fontSize: '1.75rem', width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.12)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>{b}</span>
              )) : (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Complete challenges to earn badges!</p>
              )}
            </div>
          </div>

          <div className="glass-card" style={{ borderRadius: 20, padding: '24px' }}>
            <h3 className="section-title" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar style={{ width: 18, height: 18, color: 'var(--primary)' }} /> Active Challenges
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.challenges.map(c => (
                <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14, background: 'var(--bg)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, animation: 'pulse-green 2s ease-in-out infinite' }} />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>{c.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Ends {new Date(c.endDate).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
              {data.challenges.length === 0 && (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Join a challenge to get started!</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
