'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Leaf, Eye, EyeOff, Mail, Lock, User, ArrowRight, Check, Shield, TreePine, Star, Sparkles } from 'lucide-react';
import { useAuthStore, useThemeStore } from '@/store';
import { authAPI } from '@/services/api';
import toast from 'react-hot-toast';

const panelPerks = [
  { icon: TreePine, title: 'Free Tree Planting', desc: 'Every point you earn funds real tree planting' },
  { icon: Sparkles, title: 'AI Insights Engine', desc: 'Personalized sustainability recommendations' },
  { icon: Star, title: 'No Credit Card', desc: 'Start completely free, upgrade anytime' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { isDark } = useThemeStore();
  const router = useRouter();

  const strength = (() => {
    const p = form.password;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength] || '';
  const strengthColor = ['', '#EF4444', '#F59E0B', '#3B82F6', '#22C55E'][strength] || '#E2E8F0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const res = await authAPI.register({ name: form.name, email: form.email, password: form.password });
      const { token, user } = res.data;
      if (token && user) {
        setAuth(user, token);
        toast.success('Welcome to EcoTrack! 🌱');
        router.push('/dashboard');
      } else {
        toast.success('Registration successful! Please verify your email.');
        router.push('/login');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="auth-page">
        {/* ─ Left Panel ─────────────────────────── */}
        <div className="auth-panel">
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #071A0E 0%, #0C2418 30%, #071525 100%)' }} />
          <div style={{ position: 'absolute', top: '-10%', right: '-20%', width: 500, height: 500, background: 'rgba(34,197,94,0.15)', borderRadius: '50%', filter: 'blur(80px)' }} className="animate-blob" />
          <div style={{ position: 'absolute', bottom: '-10%', left: '-20%', width: 400, height: 400, background: 'rgba(134,239,172,0.1)', borderRadius: '50%', filter: 'blur(80px)' }} className="animate-blob-3" />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(134,239,172,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            style={{ position: 'relative', zIndex: 10, padding: '48px', maxWidth: 440, width: '100%' }}
          >
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 56 }}>
              <div style={{ width: 42, height: 42, background: 'linear-gradient(135deg,#22C55E,#16A34A)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(34,197,94,0.35)' }}>
                <Leaf size={22} color="white" strokeWidth={2.5} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>EcoTrack</span>
            </Link>

            <div style={{ marginBottom: 48 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,2.8rem)', fontWeight: 900, color: 'white', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 16 }}>
                Join the climate<br />
                <span style={{ background: 'linear-gradient(135deg,#22C55E,#86EFAC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>revolution</span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', lineHeight: 1.7, maxWidth: 320 }}>
                2.5 million users already tracking and reducing their carbon footprint with EcoTrack.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {panelPerks.map((perk, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                  style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <perk.icon size={18} color="#4ADE80" />
                  </div>
                  <div>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', marginBottom: 3 }}>{perk.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', lineHeight: 1.5 }}>{perk.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social proof */}
            <div style={{ marginTop: 48, padding: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                {Array(5).fill(0).map((_, i) => <Star key={i} size={14} color="#F59E0B" fill="#F59E0B" />)}
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, marginLeft: 4 }}>4.9/5</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', lineHeight: 1.6, fontStyle: 'italic' }}>"EcoTrack completely changed how I think about my daily choices. Reduced my footprint by 30% in 4 months."</p>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 600, marginTop: 10 }}>— Sarah Chen, Climate Advocate</div>
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
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#22C55E,#16A34A)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Leaf size={20} color="white" />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>EcoTrack</span>
              </Link>
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)', marginBottom: 6, letterSpacing: '-0.02em' }}>Create your account</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 28, fontWeight: 500 }}>Start tracking and reducing your carbon footprint for free</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Full name */}
              <div className="input-group">
                <User className="input-icon" size={18} />
                <input
                  type="text" placeholder="Full name" required
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="form-input"
                />
              </div>

              {/* Email */}
              <div className="input-group">
                <Mail className="input-icon" size={18} />
                <input
                  type="email" placeholder="Email address" required
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="form-input"
                />
              </div>

              {/* Password */}
              <div>
                <div className="input-group">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showPass ? 'text' : 'password'} placeholder="Create password" required
                    value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    className="form-input"
                    style={{ paddingRight: 48 }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Strength meter */}
                {form.password && (
                  <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div className="strength-bar">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="strength-segment" style={{ background: i <= strength ? strengthColor : 'var(--border)' }} />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: strengthColor }}>{strengthLabel} password</span>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="input-group">
                <Lock className="input-icon" size={18} />
                <input
                  type="password" placeholder="Confirm password" required
                  value={form.confirm} onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                  className="form-input"
                  style={{ borderColor: form.confirm && form.confirm !== form.password ? '#EF4444' : undefined }}
                />
                {form.confirm && form.confirm === form.password && (
                  <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: '#22C55E' }}>
                    <Check size={18} strokeWidth={3} />
                  </div>
                )}
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', justifyContent: 'center', marginTop: 6, fontSize: '0.95rem' }}
              >
                {loading ? (
                  <span style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin-slow 0.8s linear infinite' }} />
                ) : (
                  <>Create Account <ArrowRight size={18} /></>
                )}
              </motion.button>

              <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
                By creating an account, you agree to our{' '}
                <a href="#" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Terms of Service</a>{' '}
                and{' '}
                <a href="#" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Privacy Policy</a>
              </p>
            </form>

            {/* Divider */}
            <div className="divider-text" style={{ margin: '20px 0' }}>or sign up with</div>

            {/* Social */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn-social">
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </button>
            </div>

            {/* Switch */}
            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 24, fontWeight: 500 }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 800, textDecoration: 'none' }}>Sign in</Link>
            </p>

            {/* Security */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 20, padding: '10px 16px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <Shield size={14} color="var(--primary)" />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>256-bit encrypted · SOC 2 Type II · GDPR compliant</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
