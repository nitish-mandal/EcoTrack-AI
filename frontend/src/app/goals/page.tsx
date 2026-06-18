'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Trash2, Edit3, Check, X, Calendar, TrendingUp, Award } from 'lucide-react';
import { goalsAPI } from '@/services/api';
import DashboardLayout from '@/components/DashboardLayout';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface Goal {
  _id: string;
  title: string;
  category: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  status: 'active' | 'completed' | 'failed';
  description?: string;
}

const MOCK_GOALS: Goal[] = [
  { _id: '1', title: 'Reduce car usage by 20%', category: 'transport', target: 20, current: 14, unit: '%', deadline: '2026-07-01', status: 'active', description: 'Cut down driving distance by choosing public transport' },
  { _id: '2', title: 'Plant 20 trees this month', category: 'nature', target: 20, current: 12, unit: 'trees', deadline: '2026-06-30', status: 'active', description: 'Plant trees in the local community garden' },
  { _id: '3', title: 'Switch to renewable energy', category: 'energy', target: 100, current: 60, unit: '%', deadline: '2026-08-01', status: 'active', description: 'Transition home to solar energy' },
  { _id: '4', title: 'Zero plastic waste week', category: 'waste', target: 7, current: 7, unit: 'days', deadline: '2026-06-10', status: 'completed', description: 'Complete one week without any single-use plastic' },
];

const CATEGORIES = ['transport', 'energy', 'food', 'waste', 'nature', 'shopping'];
const CATEGORY_COLORS: Record<string, string> = {
  transport: '#3B82F6', energy: '#F59E0B', food: '#EF4444',
  waste: '#8B5CF6', nature: '#22C55E', shopping: '#EC4899',
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>(MOCK_GOALS);
  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [form, setForm] = useState({ title: '', category: 'transport', target: 0, unit: '%', deadline: '', description: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await goalsAPI.getAll();
        if (res.data.data?.length) setGoals(res.data.data);
      } catch { /* use mock */ }
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editGoal) {
        await goalsAPI.update(editGoal._id, form);
        setGoals(prev => prev.map(g => g._id === editGoal._id ? { ...g, ...form } : g));
        toast.success('Goal updated!');
      } else {
        const res = await goalsAPI.create({ ...form, current: 0 });
        setGoals(prev => [...prev, res.data.data]);
        toast.success('Goal created! 🎯 +10 Eco Points');
      }
    } catch {
      if (editGoal) {
        setGoals(prev => prev.map(g => g._id === editGoal._id ? { ...g, ...form } : g));
      } else {
        setGoals(prev => [...prev, { _id: Date.now().toString(), ...form, current: 0, status: 'active' }]);
      }
      toast.success(editGoal ? 'Goal updated!' : 'Goal created! 🎯');
    } finally {
      setLoading(false);
      setShowForm(false);
      setEditGoal(null);
      setForm({ title: '', category: 'transport', target: 0, unit: '%', deadline: '', description: '' });
    }
  };

  const handleDelete = async (id: string) => {
    try { await goalsAPI.delete(id); } catch { /* local */ }
    setGoals(prev => prev.filter(g => g._id !== id));
    toast.success('Goal removed');
  };

  const handleProgress = async (goal: Goal, delta: number) => {
    const newVal = Math.min(goal.target, Math.max(0, goal.current + delta));
    try { await goalsAPI.updateProgress(goal._id, newVal); } catch { /* local */ }
    setGoals(prev => prev.map(g => {
      if (g._id !== goal._id) return g;
      const updated = { ...g, current: newVal };
      if (newVal >= g.target && g.status === 'active') {
        toast.success(`🎉 Goal completed: "${g.title}"`);
        updated.status = 'completed';
      }
      return updated;
    }));
  };

  const filtered = goals.filter(g => filter === 'all' || g.status === filter);
  const stats = {
    active: goals.filter(g => g.status === 'active').length,
    completed: goals.filter(g => g.status === 'completed').length,
    avgProgress: goals.filter(g => g.status === 'active').reduce((s, g) => s + (g.current / g.target) * 100, 0) / Math.max(1, goals.filter(g => g.status === 'active').length),
  };

  const inputStyle = { width: '100%', padding: '13px 16px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '0.875rem', outline: 'none', fontFamily: 'var(--font)', transition: 'border-color 0.2s' };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 className="page-title">My Goals</h1>
            <p className="page-subtitle">Set, track, and celebrate your sustainability milestones</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditGoal(null); setForm({ title: '', category: 'transport', target: 0, unit: '%', deadline: '', description: '' }); }}
            className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', fontSize: '0.875rem' }}>
            <Plus style={{ width: 16, height: 16 }} /> New Goal
          </button>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            { icon: Target, label: 'Active', value: stats.active, color: '#22C55E' },
            { icon: Award, label: 'Completed', value: stats.completed, color: '#F59E0B' },
            { icon: TrendingUp, label: 'Avg Progress', value: `${stats.avgProgress.toFixed(0)}%`, color: '#3B82F6' },
          ].map(s => (
            <div key={s.label} className="glass-card" style={{ borderRadius: 20, padding: '24px', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <s.icon style={{ width: 22, height: 22, color: s.color }} />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.875rem', fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Filter ── */}
        <div style={{ display: 'flex', gap: 10 }}>
          {(['all', 'active', 'completed'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '9px 20px', borderRadius: 12, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s',
                background: filter === f ? 'linear-gradient(135deg,#22C55E,#16A34A)' : 'var(--white)',
                color: filter === f ? 'white' : 'var(--text-muted)',
                boxShadow: filter === f ? '0 4px 14px rgba(34,197,94,0.3)' : '0 1px 3px rgba(0,0,0,0.06)',
                border: filter === f ? 'none' : '1px solid var(--border)',
              } as React.CSSProperties}>
              {f}
            </button>
          ))}
        </div>

        {/* ── Goals List ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AnimatePresence>
            {filtered.map(goal => {
              const pct = Math.min(100, (goal.current / goal.target) * 100);
              const color = CATEGORY_COLORS[goal.category] || '#22C55E';
              const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000);
              return (
                <motion.div key={goal._id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-card"
                  style={{ borderRadius: 20, padding: '24px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 0 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}18`, flexShrink: 0 }}>
                        <Target style={{ width: 22, height: 22, color }} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text)', fontSize: '1rem', marginBottom: 4 }}>{goal.title}</h3>
                        {goal.description && <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 8 }}>{goal.description}</p>}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: 99, background: `${color}18`, color, fontWeight: 600, textTransform: 'capitalize' }}>{goal.category}</span>
                          {goal.status === 'completed' ? (
                            <span style={{ fontSize: '0.75rem', color: '#22C55E', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}><Check style={{ width: 12, height: 12 }} /> Completed</span>
                          ) : daysLeft >= 0 ? (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Calendar style={{ width: 12, height: 12 }} /> {daysLeft}d left</span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 600 }}>Overdue</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      {goal.status === 'active' && (
                        <button onClick={() => { setEditGoal(goal); setForm({ title: goal.title, category: goal.category, target: goal.target, unit: goal.unit, deadline: goal.deadline, description: goal.description || '' }); setShowForm(true); }}
                          className="glass-card" style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer', border: 'none' }}>
                          <Edit3 style={{ width: 14, height: 14 }} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(goal._id)}
                        className="glass-card" style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer', border: 'none' }}>
                        <Trash2 style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{goal.current} / {goal.target} {goal.unit}</span>
                      <span style={{ fontWeight: 700, color }}>{pct.toFixed(0)}%</span>
                    </div>
                    <div className="progress-bar">
                      <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }}
                        style={{ background: `linear-gradient(90deg, ${color}, ${color}99)` }} />
                    </div>
                  </div>

                  {goal.status === 'active' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Update progress:</span>
                      <button onClick={() => handleProgress(goal, -1)}
                        className="glass-card" style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', cursor: 'pointer', fontWeight: 700, border: 'none', fontSize: '1rem' }}>−</button>
                      <button onClick={() => handleProgress(goal, 1)}
                        className="glass-card" style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700, border: 'none', fontSize: '1rem' }}>+</button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)' }}>
              <Target style={{ width: 56, height: 56, margin: '0 auto 16px', opacity: 0.35 }} />
              <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 6 }}>No goals yet</p>
              <p style={{ fontSize: '0.875rem' }}>Create your first sustainability goal!</p>
            </div>
          )}
        </div>

        {/* ── Form Modal ── */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
              onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                style={{ background: 'var(--white)', borderRadius: 24, padding: '32px', width: '100%', maxWidth: 480, boxShadow: '0 32px 80px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)' }}>{editGoal ? 'Edit Goal' : 'New Goal'}</h2>
                  <button onClick={() => setShowForm(false)} style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <X style={{ width: 16, height: 16 }} />
                  </button>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <input type="text" placeholder="Goal title" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} style={inputStyle} />
                  <textarea placeholder="Description (optional)" rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ ...inputStyle, resize: 'none' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={inputStyle}>
                      {CATEGORIES.map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>)}
                    </select>
                    <input type="text" placeholder="Unit (%, km, trees)" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} style={inputStyle} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 6, display: 'block', fontWeight: 600 }}>Target Value</label>
                      <input type="number" min={1} value={form.target || ''} onChange={e => setForm(p => ({ ...p, target: parseFloat(e.target.value) || 0 }))} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 6, display: 'block', fontWeight: 600 }}>Deadline</label>
                      <input type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} required style={inputStyle} />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, opacity: loading ? 0.7 : 1 }}>
                    {loading ? <span style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite', display: 'inline-block' }} /> : <><Check style={{ width: 16, height: 16 }} /> {editGoal ? 'Update Goal' : 'Create Goal'}</>}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
}
