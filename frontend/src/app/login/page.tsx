'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Leaf, Mail, Lock, ArrowRight, Eye, EyeOff, Check, Shield, Users, TreePine, TrendingDown } from 'lucide-react';
import { useAuthStore, useThemeStore } from '@/store';
import { authAPI } from '@/services/api';
import toast from 'react-hot-toast';

const OAUTH_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

const panelStats = [
  { icon: Users, value: '2.5M+', label: 'Active Users' },
  { icon: TreePine, value: '1.24M+', label: 'Trees Planted' },
  { icon: TrendingDown, value: '48K tons', label: 'CO₂ Reduced' },
];

const perks = [
  'Real-time carbon footprint tracking',
  'AI-powered personalized insights',
  'Global leaderboard & challenges',
];

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { isDark } = useThemeStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Show error toast if OAuth provider returned an error
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'google_failed') toast.error('Google sign-in failed. Please try again.');
    if (error === 'github_failed') toast.error('GitHub sign-in failed. Please try again.');
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const { token, user } = res.data;
      setAuth(user, token);
      toast.success(`Welcome back, ${user.name}! 🌱`);
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="auth-page">
        {/* ─ Left Panel ─────────────────────────── */}
        <div className="auth-panel">
          {/* Animated background */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #071A0E 0%, #0A1F16 50%, #071525 100%)' }} />
          <div style={{ position: 'absolute', top: '-20%', left: '-20%', width: 500, height: 500, background: 'rgba(34,197,94,0.15)', borderRadius: '50%', filter: 'blur(80px)' }} className="animate-blob" />
          <div style={{ position: 'absolute', bottom: '-20%', right: '-20%', width: 400, height: 400, background: 'rgba(134,239,172,0.1)', borderRadius: '50%', filter: 'blur(80px)' }} className="animate-blob-2" />
          
          {/* Dot pattern */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(134,239,172,0.1) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            style={{ position: 'relative', zIndex: 10, padding: '48px', maxWidth: 440, width: '100%' }}
          >
            {/* Logo */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 56 }}>
              <div style={{ width: 42, height: 42, background: 'linear-gradient(135deg,#22C55E,#16A34A)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(34,197,94,0.35)' }}>
                <Leaf size={22} color="white" strokeWidth={2.5} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>EcoTrack</span>
            </Link>

            <div style={{ marginBottom: 48 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,2.8rem)', fontWeight: 900, color: 'white', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 16 }}>
                Welcome back<br />
                <span style={{ background: 'linear-gradient(135deg,#22C55E,#86EFAC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>to EcoTrack</span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', lineHeight: 1.7, maxWidth: 320 }}>
                Continue your sustainability journey. Every logged action creates real-world impact.
              </p>
            </div>

            {/* Perks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 48 }}>
              {perks.map((perk, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={13} color="#4ADE80" strokeWidth={3} />
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', fontWeight: 600 }}>{perk}</span>
                </div>
              ))}
            </div>

            {/* Stats strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {panelStats.map((s, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px 12px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.05rem', color: 'white', marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ─ Right Form ─────────────────────────── */}
        <div className="auth-form-section">
          <motion.div
            className="auth-card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Mobile logo */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#22C55E,#16A34A)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Leaf size={20} color="white" />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>EcoTrack</span>
              </Link>
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)', marginBottom: 6, letterSpacing: '-0.02em' }}>Sign in</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 32, fontWeight: 500 }}>Enter your credentials to access your dashboard</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Email */}
              <div className="input-group">
                <Mail className="input-icon" size={18} />
                <input
                  type="email" placeholder="Email address" required
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="form-input"
                />
              </div>

              {/* Password */}
              <div className="input-group">
                <Lock className="input-icon" size={18} />
                <input
                  type={showPass ? 'text' : 'password'} placeholder="Password" required
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="form-input"
                  style={{ paddingRight: 48 }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Forgot password */}
              <div style={{ textAlign: 'right', marginTop: -8 }}>
                <Link href="/forgot-password" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>Forgot password?</Link>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', justifyContent: 'center', marginTop: 8, fontSize: '0.95rem' }}
              >
                {loading ? (
                  <span style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin-slow 0.8s linear infinite' }} />
                ) : (
                  <>Sign In <ArrowRight size={18} /></>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="divider-text" style={{ margin: '24px 0' }}>or</div>

            {/* Social login */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                className="btn-social"
                onClick={() => { window.location.href = `${OAUTH_BASE}/api/auth/google`; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </button>
              <button
                type="button"
                className="btn-social"
                onClick={() => { window.location.href = `${OAUTH_BASE}/api/auth/github`; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                Continue with GitHub
              </button>
            </div>

            {/* Switch */}
            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 28, fontWeight: 500 }}>
              Don't have an account?{' '}
              <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 800, textDecoration: 'none' }}>Create one free</Link>
            </p>

            {/* Security note */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 24, padding: '12px 16px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <Shield size={14} color="var(--primary)" />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>256-bit encrypted · SOC 2 Type II certified</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
