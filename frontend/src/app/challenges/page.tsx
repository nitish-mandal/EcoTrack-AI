'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Check, Users, Clock, Flame, Zap, Trophy } from 'lucide-react';
import { challengesAPI } from '@/services/api';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface Challenge {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  duration: number;
  participants: string[];
  endDate: string;
  status: 'active' | 'upcoming' | 'completed';
  joined?: boolean;
}

const MOCK_CHALLENGES: Challenge[] = [
  { _id: '1', title: 'No Plastic Week', description: 'Go 7 days without using any single-use plastic bags, straws, or packaging.', category: 'waste', difficulty: 'medium', points: 150, duration: 7, participants: ['u1','u2','u3'], endDate: '2026-06-25', status: 'active', joined: true },
  { _id: '2', title: 'Walk to Work Challenge', description: 'Walk or cycle to work/school for 5 consecutive days instead of using a vehicle.', category: 'transport', difficulty: 'easy', points: 100, duration: 5, participants: ['u1','u2'], endDate: '2026-06-30', status: 'active', joined: true },
  { _id: '3', title: 'Zero Food Waste Month', description: 'Plan meals, compost scraps, and reduce food waste to zero for an entire month.', category: 'food', difficulty: 'hard', points: 300, duration: 30, participants: ['u3'], endDate: '2026-06-30', status: 'active', joined: false },
  { _id: '4', title: 'Energy Saving Week', description: 'Reduce your electricity consumption by at least 20% compared to your usual usage.', category: 'energy', difficulty: 'medium', points: 200, duration: 7, participants: ['u1','u2','u3','u4'], endDate: '2026-07-07', status: 'upcoming', joined: false },
  { _id: '5', title: 'Plant 10 Trees', description: 'Plant 10 trees in your community, school, or home garden this month.', category: 'nature', difficulty: 'medium', points: 250, duration: 30, participants: ['u1'], endDate: '2026-07-15', status: 'upcoming', joined: false },
  { _id: '6', title: 'Meatless Month', description: 'Commit to a plant-based diet for the entire month and reduce food emissions.', category: 'food', difficulty: 'hard', points: 400, duration: 30, participants: ['u1','u2','u3','u4','u5'], endDate: '2026-05-31', status: 'completed', joined: false },
];

const DIFFICULTY_COLORS = { easy: '#22C55E', medium: '#F59E0B', hard: '#EF4444' };
const CATEGORY_COLORS: Record<string, string> = { waste: '#8B5CF6', transport: '#3B82F6', food: '#EF4444', energy: '#F59E0B', nature: '#22C55E', shopping: '#EC4899' };

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>(MOCK_CHALLENGES);
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('active');
  const { user } = useAuthStore();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await challengesAPI.getAll();
        if (res.data.data?.length) setChallenges(res.data.data);
      } catch { /* use mock */ }
    };
    load();
  }, []);

  const handleJoin = async (challenge: Challenge) => {
    try { await challengesAPI.join(challenge._id); } catch { /* local */ }
    setChallenges(prev => prev.map(c => c._id === challenge._id ? { ...c, joined: true, participants: [...c.participants, 'me'] } : c));
    toast.success(`Joined "${challenge.title}"! 🎯 Good luck!`);
  };

  const handleComplete = async (challenge: Challenge) => {
    try { await challengesAPI.complete(challenge._id); } catch { /* local */ }
    setChallenges(prev => prev.map(c => c._id === challenge._id ? { ...c, status: 'completed', joined: false } : c));
    toast.success(`🏆 Challenge completed! +${challenge.points} Eco Points earned!`);
  };

  const filtered = challenges.filter(c => filter === 'all' || c.status === filter);
  const myJoined = challenges.filter(c => c.joined).length;

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* ── Header ── */}
        <div>
          <h1 className="page-title">Challenges</h1>
          <p className="page-subtitle">Join community challenges and earn Eco Points</p>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            { icon: Flame, label: 'Active Joined', value: myJoined, color: '#EF4444' },
            { icon: Trophy, label: 'Completed', value: MOCK_CHALLENGES.filter(c => c.status === 'completed').length, color: '#F59E0B' },
            { icon: Zap, label: 'Points Available', value: filtered.filter(c => !c.joined && c.status === 'active').reduce((s, c) => s + c.points, 0), color: '#22C55E' },
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

        {/* ── Filter Tabs ── */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {(['all', 'active', 'upcoming', 'completed'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '9px 20px', borderRadius: 12, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s',
                background: filter === f ? 'linear-gradient(135deg,#22C55E,#16A34A)' : 'var(--white)',
                color: filter === f ? 'white' : 'var(--text-muted)',
                boxShadow: filter === f ? '0 4px 14px rgba(34,197,94,0.3)' : '0 1px 3px rgba(0,0,0,0.06)',
                border: filter === f ? 'none' : '1px solid var(--border)',
              } as React.CSSProperties}>
              {f} ({challenges.filter(c => f === 'all' || c.status === f).length})
            </button>
          ))}
        </div>

        {/* ── Challenge Cards Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          <AnimatePresence>
            {filtered.map((c, i) => {
              const daysLeft = Math.ceil((new Date(c.endDate).getTime() - Date.now()) / 86400000);
              return (
                <motion.div key={c._id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="glass-card card-hover"
                  style={{ borderRadius: 20, padding: '24px', border: c.joined ? '1.5px solid rgba(34,197,94,0.3)' : undefined }}
                >
                  {/* Card header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: `${CATEGORY_COLORS[c.category]}18`, color: CATEGORY_COLORS[c.category], textTransform: 'capitalize' }}>{c.category}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: `${DIFFICULTY_COLORS[c.difficulty]}15`, color: DIFFICULTY_COLORS[c.difficulty], textTransform: 'capitalize' }}>{c.difficulty}</span>
                        {c.joined && <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}><Check style={{ width: 12, height: 12 }} /> Joined</span>}
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text)', fontSize: '1rem' }}>{c.title}</h3>
                    </div>
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg,#22C55E,#86EFAC,#16A34A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{c.points}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>pts</div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 20 }}>{c.description}</p>

                  {/* Meta info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 20, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Clock style={{ width: 13, height: 13 }} /> {c.duration} days</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Users style={{ width: 13, height: 13 }} /> {c.participants.length} joined</span>
                    {c.status === 'active' && daysLeft >= 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: daysLeft <= 3 ? '#EF4444' : 'inherit' }}><Flame style={{ width: 13, height: 13 }} /> {daysLeft}d left</span>}
                    {c.status === 'upcoming' && <span style={{ color: '#3B82F6', fontWeight: 600 }}>Starting soon</span>}
                    {c.status === 'completed' && <span style={{ color: '#22C55E', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}><Check style={{ width: 13, height: 13 }} /> Ended</span>}
                  </div>

                  {/* Actions */}
                  {c.status === 'active' && (
                    <div style={{ display: 'flex', gap: 10 }}>
                      {!c.joined ? (
                        <button onClick={() => handleJoin(c)} className="btn-primary" style={{ flex: 1, padding: '10px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <Zap style={{ width: 14, height: 14 }} /> Join Challenge
                        </button>
                      ) : (
                        <>
                          <button onClick={() => handleComplete(c)} className="btn-primary" style={{ flex: 1, padding: '10px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            <Trophy style={{ width: 14, height: 14 }} /> Mark Complete
                          </button>
                          <button className="btn-outline" style={{ padding: '10px 16px', fontSize: '0.875rem' }}>Leave</button>
                        </>
                      )}
                    </div>
                  )}
                  {c.status === 'upcoming' && (
                    <button onClick={() => handleJoin(c)} className="btn-outline" style={{ width: '100%', padding: '10px', fontSize: '0.875rem' }}>Notify Me</button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)' }}>
            <Award style={{ width: 56, height: 56, margin: '0 auto 16px', opacity: 0.35 }} />
            <p style={{ fontWeight: 600, fontSize: '1rem' }}>No challenges in this category</p>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
