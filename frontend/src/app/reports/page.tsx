'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download, Calendar, FileText, FileSpreadsheet, PieChart, Activity } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend } from 'chart.js';
import DashboardLayout from '@/components/DashboardLayout';
import toast from 'react-hot-toast';
import { useThemeStore } from '@/store';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

export default function ReportsPage() {
  const [period, setPeriod] = useState<'monthly' | 'annual'>('monthly');
  const { isDark } = useThemeStore();

  const handleExport = (type: 'pdf' | 'csv') => {
    toast.success(`Preparing ${type.toUpperCase()} report for download...`);
    setTimeout(() => toast.success('Download started!'), 1500);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: isDark ? '#1e293b' : '#fff', titleColor: isDark ? '#f8fafc' : '#0f172a', bodyColor: '#64748b', padding: 12, cornerRadius: 10 },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } },
      y: { grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }, ticks: { color: '#94a3b8', font: { size: 11 } } },
    },
  };

  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'CO₂ Emissions (kg)',
      data: [320, 310, 290, 250, 260, 240, 230, 210, 220, 190, 180, 175],
      borderColor: '#22C55E', backgroundColor: 'rgba(34,197,94,0.08)', fill: true, tension: 0.4, borderWidth: 2.5,
    }],
  };

  const barData = {
    labels: ['Transport', 'Energy', 'Food', 'Waste', 'Shopping'],
    datasets: [{
      label: 'Average vs You (kg CO₂)',
      data: [120, 80, 90, 30, 40],
      backgroundColor: 'rgba(59,130,246,0.7)',
      borderRadius: 6,
    }, {
      label: 'Your Emissions',
      data: [85, 60, 45, 20, 25],
      backgroundColor: 'rgba(34,197,94,0.75)',
      borderRadius: 6,
    }],
  };

  const kpiCards = [
    { label: 'Total Emissions', value: '2,850 kg', change: '-15%', trend: 'down', icon: Activity, color: '#22C55E' },
    { label: 'Average Monthly', value: '237 kg', change: '-5%', trend: 'down', icon: PieChart, color: '#3B82F6' },
    { label: 'Carbon Offset', value: '850 kg', change: '+20%', trend: 'up', icon: BarChart3, color: '#F59E0B' },
  ];

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 className="page-title">Analytics & Reports</h1>
            <p className="page-subtitle">Deep dive into your environmental impact over time</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => handleExport('csv')} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: '0.875rem' }}>
              <FileSpreadsheet style={{ width: 16, height: 16 }} /> Export CSV
            </button>
            <button onClick={() => handleExport('pdf')} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: '0.875rem' }}>
              <FileText style={{ width: 16, height: 16 }} /> Export PDF
            </button>
          </div>
        </div>

        {/* ── Controls Bar ── */}
        <div className="glass-card" style={{ borderRadius: 20, padding: '18px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Calendar style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
            <select style={{ background: 'transparent', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)', border: 'none', outline: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }}>
              <option>Year 2026</option>
              <option>Year 2025</option>
            </select>
          </div>
          <div style={{ display: 'flex', background: 'var(--bg-2)', borderRadius: 12, padding: 4, gap: 2 }}>
            <button onClick={() => setPeriod('monthly')}
              style={{ padding: '7px 20px', borderRadius: 9, fontSize: '0.875rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: period === 'monthly' ? 'var(--white)' : 'transparent',
                color: period === 'monthly' ? 'var(--text)' : 'var(--text-muted)',
                boxShadow: period === 'monthly' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
              Monthly
            </button>
            <button onClick={() => setPeriod('annual')}
              style={{ padding: '7px 20px', borderRadius: 9, fontSize: '0.875rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: period === 'annual' ? 'var(--white)' : 'transparent',
                color: period === 'annual' ? 'var(--text)' : 'var(--text-muted)',
                boxShadow: period === 'annual' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
              Annual
            </button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
          {kpiCards.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-card" style={{ borderRadius: 20, padding: '28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, padding: 20, opacity: 0.08 }}>
                <s.icon style={{ width: 64, height: 64, color: s.color }} />
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 10, fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 8 }}>{s.value}</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: s.trend === 'down' ? '#22C55E' : '#F59E0B' }}>{s.change} vs last year</div>
            </motion.div>
          ))}
        </div>

        {/* ── Charts ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
          <div className="glass-card" style={{ borderRadius: 20, padding: '28px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text)', marginBottom: 24, fontSize: '1rem' }}>Emissions Over Time</h3>
            <div style={{ height: 280 }}><Line data={lineData} options={chartOptions as any} /></div>
          </div>
          <div className="glass-card" style={{ borderRadius: 20, padding: '28px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text)', marginBottom: 24, fontSize: '1rem' }}>Category Comparison (vs Average)</h3>
            <div style={{ height: 280 }}><Bar data={barData} options={chartOptions as any} /></div>
          </div>
        </div>

        {/* ── AI Insights ── */}
        <div className="glass-card" style={{ borderRadius: 20, padding: '28px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text)', marginBottom: 24, fontSize: '1rem' }}>AI-Generated Insights</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: '✅', text: 'Your transport emissions dropped by 25% in Q2 after switching to public transit.', color: '#22C55E' },
              { icon: '⚠️', text: 'Home energy usage spiked in July, likely due to AC. Consider adjusting the thermostat.', color: '#F59E0B' },
              { icon: '💡', text: 'You are in the top 15% of lowest emitters in your city. Keep it up!', color: '#3B82F6' },
            ].map((insight, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, padding: '16px 20px', borderRadius: 14, background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '1.25rem', flexShrink: 0, lineHeight: 1.4 }}>{insight.icon}</span>
                <span style={{ fontSize: '0.9375rem', color: 'var(--text-2)', lineHeight: 1.6 }}>{insight.text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
