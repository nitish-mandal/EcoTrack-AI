'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, PlayCircle, HelpCircle, ChevronRight, Award } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import toast from 'react-hot-toast';

const MODULES = [
  { id: '1', title: 'Climate Change 101', type: 'video', duration: '5 min', points: 20, icon: PlayCircle, color: '#3B82F6', description: 'Understand the basics of global warming and its causes.' },
  { id: '2', title: 'The Ultimate Recycling Guide', type: 'article', duration: '8 min read', points: 30, icon: BookOpen, color: '#22C55E', description: 'Learn exactly what can and cannot be recycled in your bin.' },
  { id: '3', title: 'Carbon Footprint Quiz', type: 'quiz', duration: '10 Qs', points: 50, icon: HelpCircle, color: '#F59E0B', description: 'Test your knowledge on daily emissions and carbon footprints.' },
  { id: '4', title: 'Sustainable Diets', type: 'article', duration: '6 min read', points: 25, icon: BookOpen, color: '#EF4444', description: 'How food choices impact the environment and how to eat greener.' },
];

export default function LearningPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'article' | 'quiz'>('all');
  const [activeQuiz, setActiveQuiz] = useState(false);

  const filtered = MODULES.filter(m => activeTab === 'all' || m.type === activeTab);

  const startQuiz = () => {
    setActiveQuiz(true);
    toast('Starting quiz...', { icon: '📝' });
    setTimeout(() => {
      setActiveQuiz(false);
      toast.success('Quiz completed! +50 Eco Points 🎉');
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 className="page-title">Learning Center</h1>
            <p className="page-subtitle">Read, watch, and quiz yourself to earn Eco Points</p>
          </div>
          {/* Filter tabs */}
          <div style={{ display: 'flex', background: 'var(--bg-2)', borderRadius: 14, padding: 4, gap: 2 }}>
            {(['all', 'video', 'article', 'quiz'] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                style={{ padding: '8px 18px', borderRadius: 11, fontSize: '0.875rem', fontWeight: 600, textTransform: 'capitalize', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  background: activeTab === t ? 'var(--white)' : 'transparent',
                  color: activeTab === t ? 'var(--primary-dark)' : 'var(--text-muted)',
                  boxShadow: activeTab === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ── Module Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          <AnimatePresence>
            {filtered.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="glass-card card-hover" style={{ borderRadius: 20, padding: '28px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: `${m.color}18`, color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <m.icon style={{ width: 24, height: 24 }} />
                  </div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, padding: '5px 12px', borderRadius: 99, background: 'rgba(245,158,11,0.1)', color: '#92400E', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Award style={{ width: 12, height: 12, color: '#F59E0B' }} /> {m.points} pts
                  </span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text)', marginBottom: 10 }}>{m.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.65, flex: 1, marginBottom: 24 }}>{m.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 18 }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>{m.duration}</span>
                  <button onClick={() => m.type === 'quiz' ? startQuiz() : toast.success('Content opened!')}
                    style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', transition: 'gap 0.2s' }}>
                    {m.type === 'quiz' ? 'Start Quiz' : 'View Content'} <ChevronRight style={{ width: 16, height: 16 }} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* ── Scholar Progress Banner ── */}
        <div className="glass-card" style={{ borderRadius: 20, padding: '32px', background: 'linear-gradient(135deg, rgba(34,197,94,0.06) 0%, rgba(59,130,246,0.06) 100%)', border: '1.5px solid rgba(34,197,94,0.15)' }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--white)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', flexShrink: 0 }}>
              🎓
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Eco Scholar Path</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>Complete 3 more modules this week to unlock the "Eco Scholar" badge and a 200 point bonus!</p>
            </div>
            <div style={{ minWidth: 180 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.8125rem', fontWeight: 600 }}>
                <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                <span style={{ color: 'var(--primary)' }}>40%</span>
              </div>
              <div style={{ height: 10, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: '40%' }} transition={{ duration: 1, delay: 0.3 }}
                  style={{ height: '100%', background: 'linear-gradient(90deg,#22C55E,#16A34A)', borderRadius: 99 }} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
