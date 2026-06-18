'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TreePine, Plus, MapPin, X, Cloud, Leaf } from 'lucide-react';
import { treesAPI } from '@/services/api';
import DashboardLayout from '@/components/DashboardLayout';
import toast from 'react-hot-toast';

interface Tree {
  _id: string;
  species: string;
  count: number;
  location: string;
  notes?: string;
  totalCo2Absorbed: number;
  createdAt: string;
  imageUrl?: string;
}

const MOCK_TREES: Tree[] = [
  { _id: '1', species: 'Neem', count: 5, location: 'Bengaluru Community Garden', notes: 'Planted during World Environment Day', totalCo2Absorbed: 10.5, createdAt: '2026-06-05', imageUrl: '' },
  { _id: '2', species: 'Peepal', count: 3, location: 'Home Backyard', notes: 'Sacred tree for air purification', totalCo2Absorbed: 7.8, createdAt: '2026-05-20', imageUrl: '' },
  { _id: '3', species: 'Mango', count: 4, location: 'School Campus', totalCo2Absorbed: 8.4, createdAt: '2026-04-15', imageUrl: '' },
];

const SPECIES = ['Neem', 'Peepal', 'Mango', 'Banyan', 'Teak', 'Bamboo', 'Oak', 'Pine', 'Eucalyptus', 'Other'];
const treeEmojis: Record<string, string> = {
  Neem: '🌿', Peepal: '🌳', Mango: '🥭', Banyan: '🌲', Teak: '🪵',
  Bamboo: '🎋', Oak: '🌳', Pine: '🌲', Eucalyptus: '🌿', Other: '🌱',
};

export default function TreesPage() {
  const [trees, setTrees] = useState<Tree[]>(MOCK_TREES);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ species: 'Neem', count: 1, location: '', notes: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await treesAPI.getAll();
        if (res.data.data?.length) setTrees(res.data.data);
      } catch { /* use mock */ }
    };
    load();
  }, []);

  const totalTrees = trees.reduce((s, t) => s + t.count, 0);
  const totalCO2 = trees.reduce((s, t) => s + t.totalCo2Absorbed, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, String(v)));
      const res = await treesAPI.add(formData);
      setTrees(prev => [res.data.data, ...prev]);
      toast.success(`🌱 ${form.count} ${form.species} tree${form.count > 1 ? 's' : ''} planted! +${form.count * 5} Eco Points`);
    } catch {
      const newTree: Tree = {
        _id: Date.now().toString(),
        species: form.species,
        count: form.count,
        location: form.location,
        notes: form.notes,
        totalCo2Absorbed: form.count * 2.1,
        createdAt: new Date().toISOString(),
      };
      setTrees(prev => [newTree, ...prev]);
      toast.success(`🌱 ${form.count} ${form.species} tree${form.count > 1 ? 's' : ''} added! +${form.count * 5} Eco Points`);
    } finally {
      setLoading(false);
      setShowForm(false);
      setForm({ species: 'Neem', count: 1, location: '', notes: '' });
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px', borderRadius: 12,
    border: '1.5px solid var(--border)', background: 'var(--bg)',
    color: 'var(--text)', fontSize: '0.875rem', outline: 'none',
    fontFamily: 'var(--font)', transition: 'border-color 0.2s',
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 className="page-title">Tree Plantation Tracker</h1>
            <p className="page-subtitle">Log your plantations and track CO₂ absorption</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', fontSize: '0.875rem' }}>
            <Plus style={{ width: 16, height: 16 }} /> Add Plantation
          </button>
        </div>

        {/* ── Impact Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
          {[
            { emoji: '🌱', label: 'Trees Planted', value: totalTrees, unit: 'trees', color: '#22C55E' },
            { emoji: '💨', label: 'CO₂ Absorbed', value: totalCO2.toFixed(1), unit: 'kg/year', color: '#3B82F6' },
            { emoji: '🌬️', label: 'Oxygen Produced', value: (totalTrees * 100).toLocaleString(), unit: 'kg/year', color: '#84CC16' },
          ].map(s => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="glass-card" style={{ borderRadius: 20, padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.25rem', marginBottom: 10 }}>{s.emoji}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.unit}</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-2)', marginTop: 6 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Visual Forest ── */}
        <div className="glass-card" style={{ borderRadius: 20, padding: '28px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.04 }}>
            {[...Array(20)].map((_, i) => (
              <div key={i} style={{ position: 'absolute', fontSize: '2.5rem', left: `${(i * 13) % 90}%`, top: `${(i * 17) % 80}%`, opacity: 0.4 }}>🌳</div>
            ))}
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text)', fontSize: '1rem', marginBottom: 20, position: 'relative' }}>Your Forest 🌲</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, position: 'relative' }}>
            {[...Array(Math.min(totalTrees, 50))].map((_, i) => (
              <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.02 }}
                style={{ fontSize: '1.75rem', cursor: 'default', display: 'inline-block', transition: 'transform 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}>🌳</motion.span>
            ))}
            {totalTrees > 50 && <span style={{ fontSize: '1.75rem', display: 'flex', alignItems: 'center', fontWeight: 800, color: 'var(--primary)' }}>+{totalTrees - 50}</span>}
            {totalTrees === 0 && <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No trees planted yet. Start your forest! 🌱</p>}
          </div>
        </div>

        {/* ── Plantation Records ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text)', fontSize: '1.0625rem' }}>Plantation Records</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <AnimatePresence>
              {trees.map((tree, i) => (
                <motion.div key={tree._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="glass-card" style={{ borderRadius: 20, padding: '20px 24px', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(34,197,94,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>
                    {treeEmojis[tree.species] || '🌱'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text)', fontSize: '1rem', marginBottom: 8 }}>{tree.species}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.8125rem', background: 'rgba(34,197,94,0.1)', color: '#16A34A', padding: '3px 10px', borderRadius: 99, fontWeight: 600 }}>{tree.count} tree{tree.count > 1 ? 's' : ''}</span>
                          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin style={{ width: 12, height: 12 }} /> {tree.location}</span>
                          <span style={{ fontSize: '0.8125rem', color: '#3B82F6', fontWeight: 600 }}>{tree.totalCo2Absorbed.toFixed(1)}kg CO₂/yr</span>
                        </div>
                        {tree.notes && <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 10, fontStyle: 'italic' }}>{tree.notes}</p>}
                      </div>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', flexShrink: 0 }}>{new Date(tree.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {trees.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)' }}>
                <TreePine style={{ width: 56, height: 56, margin: '0 auto 16px', opacity: 0.35 }} />
                <p style={{ fontWeight: 600, fontSize: '1rem' }}>No trees logged yet. Start planting!</p>
              </div>
            )}
          </div>
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
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)' }}>Log Plantation 🌱</h2>
                  <button onClick={() => setShowForm(false)} style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <X style={{ width: 16, height: 16 }} />
                  </button>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 8, display: 'block', fontWeight: 600 }}>Tree Species</label>
                    <select value={form.species} onChange={e => setForm(p => ({ ...p, species: e.target.value }))} style={inputStyle}>
                      {SPECIES.map(s => <option key={s} value={s}>{treeEmojis[s]} {s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 8, display: 'block', fontWeight: 600 }}>Number of Trees</label>
                    <input type="number" min={1} max={1000} value={form.count} onChange={e => setForm(p => ({ ...p, count: parseInt(e.target.value) || 1 }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 8, display: 'block', fontWeight: 600 }}>Location</label>
                    <div style={{ position: 'relative' }}>
                      <MapPin style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)' }} />
                      <input type="text" placeholder="e.g. Community Park, Bengaluru" required value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} style={{ ...inputStyle, paddingLeft: 44 }} />
                    </div>
                  </div>
                  <textarea placeholder="Notes (optional)" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={{ ...inputStyle, resize: 'none' }} />
                  <div style={{ padding: '14px 18px', borderRadius: 14, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', fontSize: '0.875rem', color: '#16A34A', lineHeight: 1.6 }}>
                    🎉 Planting {form.count} tree{form.count > 1 ? 's' : ''} will absorb ~{(form.count * 2.1).toFixed(1)}kg CO₂/year and earn you +{form.count * 5} Eco Points!
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, opacity: loading ? 0.7 : 1 }}>
                    {loading ? <span style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite', display: 'inline-block' }} /> : <><TreePine style={{ width: 16, height: 16 }} /> Log Plantation</>}
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
