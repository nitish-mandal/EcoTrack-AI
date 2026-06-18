'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Bell, Key, LogOut, Check, Zap, Camera, Trash2, Lock } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      updateUser({ name: form.name, email: form.email });
      setForm(p => ({ ...p, currentPassword: '', newPassword: '' }));
      toast.success('Profile updated successfully!');
      setLoading(false);
    }, 1000);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px', borderRadius: 12,
    border: '1.5px solid var(--border)', background: 'var(--bg)',
    color: 'var(--text)', fontSize: '0.875rem', outline: 'none',
    fontFamily: 'var(--font)', transition: 'border-color 0.2s',
  };
  const inputIconStyle: React.CSSProperties = { ...inputStyle, paddingLeft: 44 };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 1024, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* ── Header ── */}
        <div>
          <h1 className="page-title">Profile Settings</h1>
          <p className="page-subtitle">Manage your account information and preferences</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 28 }} className="md:grid-cols-3">

          {/* ── Left Col: Avatar & Status ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Avatar Card */}
            <div className="glass-card" style={{ borderRadius: 20, padding: '32px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(135deg,#22C55E,#16A34A)', opacity: 0.15 }} />
              <div style={{ position: 'relative' }}>
                <div style={{ width: 88, height: 88, margin: '0 auto 16px', borderRadius: '50%', background: 'var(--white)', padding: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg,#22C55E,#16A34A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'white', fontWeight: 800, position: 'relative' }}
                    onMouseEnter={e => { (e.currentTarget.querySelector('.cam-overlay') as HTMLElement)!.style.opacity = '1'; }}
                    onMouseLeave={e => { (e.currentTarget.querySelector('.cam-overlay') as HTMLElement)!.style.opacity = '0'; }}>
                    {user?.name?.charAt(0) || 'U'}
                    <div className="cam-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', cursor: 'pointer' }}>
                      <Camera style={{ width: 20, height: 20, color: 'white' }} />
                    </div>
                  </div>
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{user?.name}</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 16 }}>{user?.email}</p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(245,158,11,0.12)', color: '#92400E', padding: '6px 16px', borderRadius: 99, fontSize: '0.875rem', fontWeight: 700 }}>
                  <Zap style={{ width: 14, height: 14 }} /> {user?.ecoPoints || 0} Eco Points
                </div>
              </div>
            </div>

            {/* Status Card */}
            <div className="glass-card" style={{ borderRadius: 20, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-2)', fontWeight: 500 }}>
                  <Shield style={{ width: 16, height: 16, color: '#22C55E' }} /> Account Status
                </span>
                <span style={{ fontWeight: 700, color: '#22C55E', fontSize: '0.875rem' }}>Active</span>
              </div>
              <div style={{ height: 1, background: 'var(--border)' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-2)', fontWeight: 500 }}>
                  <Bell style={{ width: 16, height: 16, color: '#3B82F6' }} /> Notifications
                </span>
                <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.875rem' }}>Enabled</span>
              </div>
            </div>

            {/* Sign Out */}
            <button onClick={() => logout()}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 14, border: '1.5px solid rgba(239,68,68,0.3)', color: '#EF4444', background: 'transparent', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s', fontFamily: 'var(--font)' }}>
              <LogOut style={{ width: 16, height: 16 }} /> Sign Out
            </button>
          </div>

          {/* ── Right Col: Forms ── */}
          <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Personal Info */}
            <div className="glass-card" style={{ borderRadius: 20, padding: '28px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>Personal Information</h3>
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 8, display: 'block', fontWeight: 600 }}>Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <User style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)' }} />
                      <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={inputIconStyle} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 8, display: 'block', fontWeight: 600 }}>Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)' }} />
                      <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} style={inputIconStyle} />
                    </div>
                  </div>
                </div>

                {/* Change Password */}
                <div style={{ paddingTop: 20, marginTop: 4, borderTop: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Key style={{ width: 15, height: 15, color: 'var(--primary)' }} /> Change Password
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    <div>
                      <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 8, display: 'block', fontWeight: 600 }}>Current Password</label>
                      <div style={{ position: 'relative' }}>
                        <Lock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)' }} />
                        <input type="password" placeholder="••••••••" value={form.currentPassword} onChange={e => setForm(p => ({ ...p, currentPassword: e.target.value }))} style={inputIconStyle} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 8, display: 'block', fontWeight: 600 }}>New Password</label>
                      <div style={{ position: 'relative' }}>
                        <Lock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)' }} />
                        <input type="password" placeholder="••••••••" value={form.newPassword} onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))} style={inputIconStyle} />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="submit" disabled={loading} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', fontSize: '0.9rem', opacity: loading ? 0.7 : 1 }}>
                    {loading ? <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite', display: 'inline-block' }} /> : <><Check style={{ width: 16, height: 16 }} /> Save Changes</>}
                  </button>
                </div>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="glass-card" style={{ borderRadius: 20, padding: '28px', borderColor: 'rgba(239,68,68,0.2)' }}>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#EF4444', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Trash2 style={{ width: 18, height: 18 }} /> Danger Zone
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>Permanently delete your account and all associated data. This action cannot be undone.</p>
              <button onClick={() => toast.error('Account deletion requested')}
                style={{ padding: '10px 20px', background: 'rgba(239,68,68,0.08)', color: '#EF4444', borderRadius: 10, border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'var(--font)', transition: 'all 0.2s' }}>
                Delete Account
              </button>
            </div>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
