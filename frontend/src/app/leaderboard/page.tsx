'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Globe, MapPin, Zap, TrendingUp, Users } from 'lucide-react';
import { leaderboardAPI } from '@/services/api';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/store';
import { cn } from '@/lib/utils';

interface LeaderUser {
  _id: string;
  name: string;
  ecoPoints: number;
  sustainabilityRank: string;
  badges: string[];
  carbonSaved?: number;
  treesPlanted?: number;
  city?: string;
}

const MOCK_GLOBAL: LeaderUser[] = [
  { _id: '1', name: 'Priya Sharma', ecoPoints: 8450, sustainabilityRank: 'Eco Champion', badges: ['🌟', '🌱', '⚡'], carbonSaved: 120, treesPlanted: 45, city: 'Bengaluru' },
  { _id: '2', name: 'James Mitchell', ecoPoints: 7200, sustainabilityRank: 'Eco Champion', badges: ['🏆', '🌿', '♻️'], carbonSaved: 98, treesPlanted: 32, city: 'Mumbai' },
  { _id: '3', name: 'Aisha Rahman', ecoPoints: 6800, sustainabilityRank: 'Carbon Reducer', badges: ['💚', '🦋'], carbonSaved: 87, treesPlanted: 28, city: 'Delhi' },
  { _id: '4', name: 'Carlos Mendez', ecoPoints: 5900, sustainabilityRank: 'Carbon Reducer', badges: ['🌍', '⚡'], carbonSaved: 74, treesPlanted: 21, city: 'Chennai' },
  { _id: '5', name: 'Sophie Chen', ecoPoints: 4750, sustainabilityRank: 'Eco Warrior', badges: ['🌱', '🔋'], carbonSaved: 62, treesPlanted: 18, city: 'Hyderabad' },
  { _id: '6', name: 'Rajan Patel', ecoPoints: 4200, sustainabilityRank: 'Eco Warrior', badges: ['♻️'], carbonSaved: 51, treesPlanted: 14, city: 'Pune' },
  { _id: '7', name: 'Min Jung', ecoPoints: 3800, sustainabilityRank: 'Eco Warrior', badges: ['🌿'], carbonSaved: 45, treesPlanted: 12, city: 'Kolkata' },
  { _id: '8', name: 'Maria Silva', ecoPoints: 3400, sustainabilityRank: 'Green Starter', badges: [], carbonSaved: 38, treesPlanted: 10, city: 'Jaipur' },
  { _id: '9', name: 'Ahmed Hassan', ecoPoints: 2900, sustainabilityRank: 'Green Starter', badges: [], carbonSaved: 30, treesPlanted: 8, city: 'Ahmedabad' },
  { _id: '10', name: 'Emma Wilson', ecoPoints: 2400, sustainabilityRank: 'Eco Beginner', badges: [], carbonSaved: 22, treesPlanted: 5, city: 'Surat' },
];

const RANK_CONFIG: Record<number, { icon: React.ElementType; color: string }> = {
  1: { icon: Crown, color: '#F59E0B' },
  2: { icon: Medal, color: '#94A3B8' },
  3: { icon: Medal, color: '#CD7C2F' },
};

export default function LeaderboardPage() {
  const [tab, setTab] = useState<'global' | 'city'>('global');
  const [data, setData] = useState<LeaderUser[]>(MOCK_GLOBAL);
  const { user } = useAuthStore();

  useEffect(() => {
    const load = async () => {
      try {
        const res = tab === 'global' ? await leaderboardAPI.global() : await leaderboardAPI.city();
        if (res.data.data?.length) setData(res.data.data);
      } catch { /* use mock */ }
    };
    load();
  }, [tab]);

  const myRank = data.findIndex(u => u.name === user?.name) + 1 || 0;
  const top3 = (data || []).slice(0, 3);

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* ── Header ── */}
        <div>
          <h1 className="page-title">Leaderboard</h1>
          <p className="page-subtitle">Compete with eco-warriors globally and climb the ranks</p>
        </div>

        {/* ── Your Rank Banner ── */}
        {myRank > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card" style={{ borderRadius: 20, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, border: '1.5px solid rgba(34,197,94,0.25)', background: 'rgba(34,197,94,0.04)' }}>
            <div className="gradient-bg" style={{ width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0, boxShadow: '0 4px 14px rgba(34,197,94,0.3)' }}>#{myRank}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9375rem' }}>Your Global Rank</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 3 }}>Keep earning Eco Points to climb higher!</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg,#22C55E,#16A34A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{user?.ecoPoints?.toLocaleString() || 0}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>Eco Points</div>
            </div>
          </motion.div>
        )}

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ key: 'global', icon: Globe, label: 'Global' }, { key: 'city', icon: MapPin, label: 'City' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as 'global' | 'city')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 12, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                background: tab === t.key ? 'linear-gradient(135deg,#22C55E,#16A34A)' : 'var(--white)',
                color: tab === t.key ? 'white' : 'var(--text-muted)',
                boxShadow: tab === t.key ? '0 4px 14px rgba(34,197,94,0.3)' : '0 1px 3px rgba(0,0,0,0.06)',
                border: tab === t.key ? 'none' : '1px solid var(--border)',
              } as React.CSSProperties}>
              <t.icon style={{ width: 15, height: 15 }} /> {t.label}
            </button>
          ))}
        </div>

        {/* ── Podium ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
        {[top3[1], top3[0], top3[2]].map((u, displayIdx) => {
            if (!u) return <div key={`podium-empty-${displayIdx}`} />;
            const rank = displayIdx === 0 ? 2 : displayIdx === 1 ? 1 : 3;
            const cfg = RANK_CONFIG[rank];
            const podiumHeights = [80, 112, 56];
            return (
              <motion.div key={`podium-${u._id}`} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: displayIdx * 0.1 }}
                className="glass-card" style={{ borderRadius: 20, padding: '24px 16px', textAlign: 'center', border: rank === 1 ? '1.5px solid rgba(245,158,11,0.3)' : '1.5px solid var(--border)' }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
                  <div className="gradient-bg" style={{ width: rank === 1 ? 60 : 52, height: rank === 1 ? 60 : 52, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: rank === 1 ? '1.3rem' : '1.1rem', boxShadow: '0 4px 14px rgba(34,197,94,0.3)' }}>
                    {u.name.charAt(0)}
                  </div>
                  <div style={{ position: 'absolute', top: -4, right: -4 }}>
                    <cfg.icon style={{ width: 18, height: 18, color: cfg.color }} />
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name.split(' ')[0]}</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 800, color: cfg.color, marginBottom: 8 }}>{u.ecoPoints.toLocaleString()} pts</div>
                {(u.badges?.length ?? 0) > 0 && <div style={{ fontSize: '1rem' }}>{u.badges!.slice(0, 2).join('')}</div>}
                <div style={{ width: '100%', borderRadius: '8px 8px 0 0', marginTop: 16, opacity: 0.25, background: cfg.color, height: podiumHeights[displayIdx] }} />
              </motion.div>
            );
          })}
        </div>

        {/* ── Full Rankings Table ── */}
        <div className="glass-card" style={{ borderRadius: 20, overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '48px 1fr 120px 100px 80px', gap: 0 }}>
            {['#', 'Name', 'Points', 'CO₂ Saved', 'Trees'].map((h, i) => (
              <span key={h} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: i >= 2 ? 'center' : 'left' }}>{h}</span>
            ))}
          </div>
          {data.map((u, i) => {
            const isMe = u.name === user?.name;
            return (
              <motion.div key={u._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                style={{ padding: '16px 24px', borderBottom: i < data.length - 1 ? '1px solid var(--border)' : 'none', display: 'grid', gridTemplateColumns: '48px 1fr 120px 100px 80px', alignItems: 'center', gap: 0, background: isMe ? 'rgba(34,197,94,0.04)' : 'transparent', transition: 'background 0.2s' }}
                onMouseEnter={e => { if (!isMe) e.currentTarget.style.background = 'var(--bg)'; }}
                onMouseLeave={e => { if (!isMe) e.currentTarget.style.background = 'transparent'; }}>
                <div style={{ fontSize: i < 3 ? '1.25rem' : '0.875rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="gradient-bg" style={{ width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.875rem', flexShrink: 0 }}>
                    {u.name.charAt(0)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isMe ? 'var(--primary)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.name} {isMe && <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>(You)</span>}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>{u.sustainabilityRank}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9375rem', background: 'linear-gradient(135deg,#22C55E,#16A34A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{u.ecoPoints.toLocaleString()}</span>
                </div>
                <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>{u.carbonSaved || 0}kg</div>
                <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>{u.treesPlanted || 0} 🌳</div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Global Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {[
            { icon: Users, label: 'Total Users', value: '2.5M+', color: '#3B82F6' },
            { icon: Zap, label: 'Points Earned', value: '48M+', color: '#F59E0B' },
            { icon: TrendingUp, label: 'CO₂ Saved', value: '48K tons', color: '#22C55E' },
          ].map(s => (
            <div key={s.label} className="glass-card" style={{ borderRadius: 20, padding: '24px', textAlign: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <s.icon style={{ width: 20, height: 20, color: s.color }} />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg,#22C55E,#16A34A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.value}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 6, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
}
