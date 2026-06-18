'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { 
  Leaf, Menu, X, Sun, Moon, ArrowRight, Shield, BarChart3,
  TreePine, Globe, Target, Calculator, Award, Sparkles,
  CheckCircle2, ChevronRight, Zap, Star, Quote, Users,
  TrendingDown, Building2, Heart, Play
} from 'lucide-react';
import { useThemeStore } from '@/store';

// ─── Animated Counter ───────────────────────────────────────────
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const step = to / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, to);
      setCount(Math.floor(current));
      if (current >= to) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, to]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── Navbar ─────────────────────────────────────────────────────
function Navbar() {
  const { isDark, toggleTheme } = useThemeStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-container">
          {/* Logo */}
          <Link href="/" className="nav-logo">
            <div className="nav-logo-icon">
              <Leaf size={20} color="white" strokeWidth={2.5} />
            </div>
            <span className="logo-text">EcoTrack</span>
          </Link>

          {/* Desktop Links */}
          <div className="nav-links" style={{ display: 'flex' }} id="desktop-nav">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#impact" className="nav-link">Impact</a>
            <a href="#testimonials" className="nav-link">Reviews</a>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={toggleTheme}
              style={{
                width: 38, height: 38,
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--white)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                transition: 'all 0.2s',
              }}
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <Link href="/login" className="btn btn-ghost btn-sm" id="signin-link">Sign In</Link>
            <Link href="/register" className="btn btn-primary btn-sm">Get Started Free</Link>
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(true)}
              style={{
                width: 38, height: 38, borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--white)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text)',
              }}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        <style>{`
          #desktop-nav { display: none; }
          #signin-link { display: none; }
          .mobile-menu-btn { display: flex; }
          @media (min-width: 768px) {
            #desktop-nav { display: flex !important; }
            #signin-link { display: inline-flex !important; }
            .mobile-menu-btn { display: none !important; }
          }
        `}</style>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="mobile-menu">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <div className="nav-logo">
              <div className="nav-logo-icon">
                <Leaf size={18} color="white" />
              </div>
              <span className="logo-text">EcoTrack</span>
            </div>
            <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}>
              <X size={26} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[['#features','Features'],['#how-it-works','How It Works'],['#impact','Impact'],['#testimonials','Reviews']].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMobileOpen(false)}
                style={{ padding: '14px 16px', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', textDecoration: 'none', borderRadius: 10, transition: 'background 0.2s' }}
              >{label}</a>
            ))}
          </div>
          <div style={{ height: 1, background: 'var(--border)', margin: '20px 0' }} />
          <Link href="/login" onClick={() => setMobileOpen(false)} className="btn btn-ghost btn-lg" style={{ marginBottom: 12, justifyContent: 'center' }}>Sign In</Link>
          <Link href="/register" onClick={() => setMobileOpen(false)} className="btn btn-primary btn-lg" style={{ justifyContent: 'center' }}>Get Started Free</Link>
        </div>
      )}
    </>
  );
}

// ─── Feature Card ────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, color }: { icon: any; title: string; desc: string; color: string }) {
  return (
    <motion.div
      className="card-feature"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -6 }}
    >
      <div className="icon-box" style={{ marginBottom: 20, background: color, borderRadius: 14 }}>
        <Icon size={24} color="white" strokeWidth={2} />
      </div>
      <h3 className="text-h3" style={{ marginBottom: 10, color: 'var(--text)' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, flex: 1 }}>{desc}</p>
      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
        Learn more <ChevronRight size={16} />
      </div>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────
export default function LandingPage() {
  const { isDark } = useThemeStore();
  const [diet, setDiet] = useState('average');
  const [miles, setMiles] = useState(200);
  const [energy, setEnergy] = useState(400);
  const footprint = Math.round(miles * 0.4 + energy * 0.38 + { vegan: 55, vegetarian: 95, average: 165, heavy: 265 }[diet as 'vegan' | 'vegetarian' | 'average' | 'heavy']!);

  const features = [
    { icon: Calculator, title: 'Carbon Calculator', desc: 'Precise, real-time footprint tracking across transport, energy, food, and lifestyle using certified emission factors.', color: 'linear-gradient(135deg,#22C55E,#16A34A)' },
    { icon: Sparkles, title: 'AI-Powered Insights', desc: 'Our GPT-based assistant scans your activity logs and delivers hyper-personalized, actionable recommendations.', color: 'linear-gradient(135deg,#7C3AED,#6D28D9)' },
    { icon: Target, title: 'Smart Goals', desc: 'Set meaningful climate targets, track progress in real-time, and earn EcoPoints for every milestone you hit.', color: 'linear-gradient(135deg,#F59E0B,#D97706)' },
    { icon: TreePine, title: 'Real Tree Planting', desc: 'Convert your EcoPoints into physical tree planting through Eden Reforestation. Every action has real impact.', color: 'linear-gradient(135deg,#059669,#047857)' },
    { icon: Globe, title: 'Global Leaderboard', desc: 'Compete with users worldwide. Join teams, complete challenges, and climb the sustainability rankings.', color: 'linear-gradient(135deg,#0EA5E9,#0284C7)' },
    { icon: Shield, title: 'Certified Offsets', desc: 'Purchase gold-standard verified carbon offsets from vetted global projects to achieve true carbon neutrality.', color: 'linear-gradient(135deg,#EC4899,#DB2777)' },
  ];

  const stats = [
    { value: 2500000, suffix: '+', label: 'Active Users' },
    { value: 48000, suffix: ' tons', label: 'CO₂ Reduced' },
    { value: 1240000, suffix: '+', label: 'Trees Planted' },
    { value: 98, suffix: '%', label: 'Satisfaction' },
  ];

  const testimonials = [
    { name: 'Sarah Chen', role: 'Sustainability Director, Apex Corp', quote: 'EcoTrack transformed how our entire company thinks about emissions. We cut our footprint by 34% in just 6 months. The AI insights are remarkably accurate.', rating: 5, initials: 'SC' },
    { name: 'Marcus Rivera', role: 'Climate Activist & Cyclist', quote: 'Finally, an app that actually makes carbon tracking fun and motivating. The leaderboard feature alone helped me recruit 12 friends to join.', rating: 5, initials: 'MR' },
    { name: 'Priya Sharma', role: 'Co-Founder, GreenScale Ventures', quote: 'The verified carbon offset marketplace is the most transparent I\'ve used. We now use EcoTrack for all our corporate ESG reporting.', rating: 5, initials: 'PS' },
  ];

  const leaderboard = [
    { rank: 1, name: 'Olivia Park', pts: '21,340', trees: 213, badge: '🏆' },
    { rank: 2, name: 'Ethan Williams', pts: '18,920', trees: 189, badge: '🥈' },
    { rank: 3, name: 'Aisha Johnson', pts: '16,450', trees: 164, badge: '🥉' },
    { rank: 4, name: 'Carlos Mendez', pts: '14,100', trees: 141, badge: '⭐' },
    { rank: 5, name: 'Sophie Laurent', pts: '12,870', trees: 128, badge: '⭐' },
  ];

  return (
    <div className={isDark ? 'dark' : ''} style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section style={{ position: 'relative', paddingTop: 'clamp(100px,14vw,160px)', paddingBottom: 'clamp(60px,8vw,100px)', overflow: 'hidden' }} className="gradient-bg-hero">
        {/* Ambient blobs */}
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: 500, height: 500, background: 'rgba(34,197,94,0.12)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} className="animate-blob" />
        <div style={{ position: 'absolute', top: '30%', right: '-10%', width: 400, height: 400, background: 'rgba(134,239,172,0.1)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} className="animate-blob-2" />
        <div className="dot-pattern" style={{ position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            style={{ textAlign: 'center', maxWidth: 820, margin: '0 auto' }}
          >
            {/* Badge */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
              <span className="badge badge-green" style={{ marginBottom: 28, display: 'inline-flex' }}>
                <span style={{ width: 7, height: 7, background: 'var(--primary)', borderRadius: '50%', position: 'relative' }}>
                  <span className="animate-ping" style={{ position: 'absolute', inset: 0, background: 'var(--primary)', borderRadius: '50%', display: 'block' }} />
                </span>
                EcoTrack 2.0 — AI-Powered Sustainability
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 className="text-hero" style={{ color: 'var(--text)', marginBottom: 24 }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              Your carbon footprint,<br />
              <span className="gradient-text">measured & reduced.</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              style={{ fontSize: 'clamp(1rem,2.5vw,1.2rem)', color: 'var(--text-muted)', maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.75 }}>
              Measure your environmental impact with precision, reduce emissions with AI-guided actions, and offset what remains. Join 2.5M climate leaders.
            </motion.p>

            {/* CTAs */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', marginBottom: 56 }}>
              <Link href="/register" className="btn btn-primary btn-xl" style={{ gap: 10 }}>
                Start for Free <ArrowRight size={20} />
              </Link>
              <a href="#how-it-works" className="btn btn-ghost btn-xl" style={{ gap: 10 }}>
                <Play size={18} fill="currentColor" /> Watch Demo
              </a>
            </motion.div>

            {/* Trust Badges */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
              style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20, color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
              {['No credit card required','14-day free trial','SOC 2 Certified','GDPR Compliant'].map(t => (
                <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={15} color="var(--primary)" /> {t}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Floating Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }}
            style={{ marginTop: 60, maxWidth: 900, margin: '60px auto 0', position: 'relative' }}
          >
            <div style={{
              background: 'white',
              borderRadius: 24,
              boxShadow: '0 32px 80px rgba(0,0,0,0.14), 0 8px 24px rgba(0,0,0,0.06)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}>
              {/* Browser chrome */}
              <div style={{ background: '#F1F5F9', padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['#FF5F57','#FFBD2E','#28CA41'].map(c => <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />)}
                </div>
                <div style={{ flex: 1, background: 'white', borderRadius: 6, padding: '5px 12px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: 280, margin: '0 auto', border: '1px solid var(--border)' }}>
                  app.ecotrack.io/dashboard
                </div>
              </div>
              {/* Dashboard preview */}
              <div style={{ background: '#F8FAFC', padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 16 }}>
                {[
                  { label: 'Carbon Score', value: '6.2 t', change: '-18%', good: true },
                  { label: 'EcoPoints', value: '4,820', change: '+340', good: true },
                  { label: 'Trees Planted', value: '48', change: '+6', good: true },
                  { label: 'CO₂ Saved', value: '2.1 t', change: 'this month', good: true },
                ].map(card => (
                  <div key={card.label} style={{ background: 'white', borderRadius: 14, padding: '16px 18px', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{card.label}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>{card.value}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>{card.change}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badges */}
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'absolute', top: -20, right: -20, background: 'white', borderRadius: 14, padding: '12px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: '1.2rem' }}>🌱</span> 48 Trees Planted
            </motion.div>
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              style={{ position: 'absolute', bottom: -18, left: -10, background: 'white', borderRadius: 14, padding: '12px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8rem', fontWeight: 700 }}>
              <TrendingDown size={18} color="var(--primary)" /> Carbon reduced 18%
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS STRIP ─────────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--white)', padding: '48px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 32, textAlign: 'center' }} className="stats-grid">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="stat-number gradient-text"><Counter to={s.value} suffix={s.suffix} /></div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: 6 }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
          <style>{`@media(min-width:640px){ .stats-grid { grid-template-columns: repeat(4,1fr) !important; gap: 48px !important; } }`}</style>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────── */}
      <section id="features" className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto 64px' }}>
            <span className="section-label" style={{ marginBottom: 16, display: 'inline-flex' }}>
              <Zap size={13} /> Platform Features
            </span>
            <h2 className="text-h1" style={{ color: 'var(--text)', marginBottom: 16 }}>Everything you need to go green</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.75 }}>A complete toolkit built for individuals, teams, and enterprises serious about reducing their environmental impact.</p>
          </div>
          <div className="grid-3">
            {features.map((f, i) => <FeatureCard key={i} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS / CALCULATOR ───────────────────────────── */}
      <section id="how-it-works" className="section" style={{ background: 'var(--white)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 60, alignItems: 'center' }} className="two-col-grid">
            <style>{`@media(min-width:1024px){ .two-col-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
            <div style={{ maxWidth: 520 }}>
              <span className="section-label" style={{ marginBottom: 16, display: 'inline-flex' }}>
                <Calculator size={13} /> Live Calculator
              </span>
              <h2 className="text-h1" style={{ color: 'var(--text)', marginBottom: 16 }}>See your impact in real-time</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.75 }}>Adjust sliders to calculate your monthly carbon footprint instantly. Create an account for detailed historical tracking and trend analysis.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)' }}>Driving Distance</span>
                    <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--primary)' }}>{miles} miles/mo</span>
                  </div>
                  <input type="range" min={0} max={1000} value={miles} onChange={e => setMiles(+e.target.value)}
                    style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer', height: 6 }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)' }}>Electricity Usage</span>
                    <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--primary)' }}>{energy} kWh/mo</span>
                  </div>
                  <input type="range" min={0} max={1000} value={energy} onChange={e => setEnergy(+e.target.value)}
                    style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer', height: 6 }} />
                </div>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', display: 'block', marginBottom: 10 }}>Diet Type</span>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[['vegan','🌿 Vegan'],['vegetarian','🥗 Vegetarian'],['average','🍽️ Average'],['heavy','🥩 Meat Heavy']].map(([id, label]) => (
                      <button key={id} onClick={() => setDiet(id)}
                        style={{
                          padding: '8px 14px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                          border: '2px solid', transition: 'all 0.2s',
                          borderColor: diet === id ? 'var(--primary)' : 'var(--border)',
                          background: diet === id ? 'rgba(34,197,94,0.1)' : 'var(--bg)',
                          color: diet === id ? 'var(--primary-dark)' : 'var(--text-muted)',
                        }}
                      >{label}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Result Card */}
            <motion.div whileHover={{ scale: 1.02 }} style={{
              background: 'linear-gradient(135deg, var(--dark) 0%, #0C1929 100%)',
              borderRadius: 28,
              padding: '48px 40px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 32px 80px rgba(0,0,0,0.2)',
            }}>
              <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'rgba(34,197,94,0.15)', borderRadius: '50%', filter: 'blur(40px)' }} />
              <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, background: 'rgba(134,239,172,0.1)', borderRadius: '50%', filter: 'blur(40px)' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Your Monthly Footprint</div>
                <motion.div
                  key={footprint}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{ fontFamily: 'var(--font-display)', fontSize: 72, fontWeight: 900, color: 'white', lineHeight: 1, marginBottom: 8 }}
                >
                  {footprint}
                </motion.div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: 32 }}>kg CO₂ / month</div>

                <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 16, padding: 20, marginBottom: 32 }}>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 6 }}>That equals charging</div>
                  <div style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem' }}>{(footprint * 122).toLocaleString()} smartphones</div>
                </div>

                <Link href="/register" className="btn btn-white btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                  Get Personalized Plan <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── AI INSIGHTS ──────────────────────────────────────────── */}
      <section className="section gradient-bg-soft" style={{ background: 'var(--bg-2)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 60, alignItems: 'center' }} className="two-col-grid-rev">
            <style>{`@media(min-width:1024px){ .two-col-grid-rev { grid-template-columns: 1fr 1fr !important; } }`}</style>
            <div>
              <span className="section-label" style={{ marginBottom: 16, display: 'inline-flex' }}>
                <Sparkles size={13} /> AI Intelligence
              </span>
              <h2 className="text-h1" style={{ color: 'var(--text)', marginBottom: 16 }}>Personalized guidance,<br />powered by AI</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.75 }}>EcoBot analyzes your specific habits and generates tailored recommendations — not generic tips, but precise, impactful actions ranked by your biggest opportunities.</p>
              <Link href="/register" className="btn btn-primary btn-lg" style={{ gap: 8 }}>
                Try AI Assistant <Sparkles size={18} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { cat: '🚗 Transport', tip: 'Switching from driving to cycling twice a week could save you 48 kg CO₂ per month and improve your score by 22%.', pts: '+120 pts', urgency: 'High Impact' },
                { cat: '⚡ Energy', tip: 'Your electricity usage peaks on weekday evenings. Shifting to off-peak hours and switching to LED saves 31 kg CO₂/month.', pts: '+85 pts', urgency: 'Medium Impact' },
                { cat: '🥗 Diet', tip: 'Replacing red meat with plant-based alternatives twice a week reduces your diet footprint by 18% — that\'s 30 kg CO₂ saved monthly.', pts: '+95 pts', urgency: 'High Impact' },
              ].map((ins, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 20px', boxShadow: 'var(--shadow-sm)', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '1.5rem', lineHeight: 1, marginTop: 2 }}>{ins.cat.split(' ')[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{ins.cat.substring(2)}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-dark)', background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: 99 }}>{ins.urgency}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', marginLeft: 'auto' }}>{ins.pts}</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.65, fontWeight: 500 }}>{ins.tip}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── LEADERBOARD ──────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--white)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 60, alignItems: 'center' }}>
            <div>
              <span className="section-label" style={{ marginBottom: 16, display: 'inline-flex' }}>
                <Award size={13} /> Global Rankings
              </span>
              <h2 className="text-h1" style={{ color: 'var(--text)', marginBottom: 16 }}>Compete.<br />Collaborate. Win.</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.75 }}>Turn climate action into friendly competition. Challenge friends, join local groups, and climb the global leaderboard while doing real good.</p>
              <Link href="/register" className="btn btn-outline btn-lg">View Full Leaderboard</Link>
            </div>
            <div style={{ background: 'var(--bg)', borderRadius: 24, padding: 24, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)' }}>🌍 Global — This Week</h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--white)', padding: '4px 12px', borderRadius: 8, border: '1px solid var(--border)' }}>Live</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {leaderboard.map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                    <div className="leaderboard-item" style={{ background: i === 0 ? 'linear-gradient(135deg,rgba(34,197,94,0.08),rgba(134,239,172,0.05))' : 'transparent', borderRadius: 12, border: i === 0 ? '1px solid rgba(34,197,94,0.2)' : '1px solid transparent' }}>
                      <span style={{ width: 28, textAlign: 'center', fontSize: '1.1rem' }}>{item.badge}</span>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,var(--primary),var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.8rem' }}>
                        {item.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)' }}>{item.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{item.trees} trees 🌳</div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--primary)' }}>{item.pts} pts</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── IMPACT ───────────────────────────────────────────────── */}
      <section id="impact" className="section gradient-bg-dark" style={{ background: 'var(--dark)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto 64px' }}>
            <span className="badge badge-dark" style={{ marginBottom: 16, display: 'inline-flex' }}>
              <TreePine size={13} /> Real-World Impact
            </span>
            <h2 className="text-h1" style={{ color: 'white', marginBottom: 16 }}>We plant real trees.<br /><span className="gradient-text-warm">Every. Single. Day.</span></h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.75 }}>Partnered with Eden Reforestation Projects, every action you take funds verified tree planting across 8 countries. Each tree absorbs approximately 22 kg of CO₂ per year.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20 }}>
            {[
              { num: '1.24M+', label: 'Trees Planted', icon: '🌳' },
              { num: '27,280 t', label: 'CO₂ Sequestered', icon: '💨' },
              { num: '8', label: 'Countries Active', icon: '🌍' },
              { num: '100%', label: 'Certified Projects', icon: '✅' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '28px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>{s.icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', marginBottom: 6 }}>{s.num}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <section id="testimonials" className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 64px' }}>
            <span className="section-label" style={{ marginBottom: 16, display: 'inline-flex' }}>
              <Heart size={13} /> Testimonials
            </span>
            <h2 className="text-h1" style={{ color: 'var(--text)', marginBottom: 16 }}>Loved by climate leaders worldwide</h2>
          </div>
          <div className="grid-3">
            {testimonials.map((t, i) => (
              <motion.div key={i} className="testimonial-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
                  {Array(t.rating).fill(0).map((_, j) => <Star key={j} size={16} color="#F59E0B" fill="#F59E0B" />)}
                </div>
                <Quote size={28} color="var(--border)" style={{ marginBottom: 12 }} />
                <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.75, fontStyle: 'italic', marginBottom: 24, flex: 1 }}>{t.quote}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 20, borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,var(--primary),var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.9rem' }}>{t.initials}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text)' }}>{t.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--white)', paddingBottom: 40 }}>
        <div className="container">
          <motion.div whileInView={{ opacity: 1 }} initial={{ opacity: 0 }} viewport={{ once: true }}
            style={{
              background: 'linear-gradient(135deg, #0F2D18 0%, #0A1F10 40%, #0F1729 100%)',
              borderRadius: 32,
              padding: 'clamp(48px,8vw,80px) clamp(32px,6vw,80px)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 40px 100px rgba(0,0,0,0.3)',
            }}>
            <div style={{ position: 'absolute', top: '20%', left: '10%', width: 300, height: 300, background: 'rgba(34,197,94,0.15)', borderRadius: '50%', filter: 'blur(60px)' }} />
            <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 250, height: 250, background: 'rgba(134,239,172,0.1)', borderRadius: '50%', filter: 'blur(60px)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.15)', color: 'var(--accent)', border: '1px solid rgba(134,239,172,0.2)', borderRadius: 99, padding: '6px 16px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 24 }}>
                <Leaf size={13} /> Free Forever Tier Available
              </span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 900, color: 'white', marginBottom: 16, letterSpacing: '-0.02em' }}>Start reducing your<br /><span className="gradient-text-warm">carbon footprint today</span></h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.05rem', maxWidth: 500, margin: '0 auto 40px', lineHeight: 1.75 }}>Join 2.5 million users who have already taken action. No credit card required. Start free, upgrade when you're ready.</p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/register" className="btn btn-primary btn-xl" style={{ gap: 10, fontSize: '1.05rem' }}>
                  Create Free Account <ArrowRight size={20} />
                </Link>
                <Link href="/login" className="btn btn-xl" style={{ background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
                  Sign In
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="footer" style={{ padding: '64px 0 32px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40, marginBottom: 56 }}>
            <div style={{ gridColumn: 'span 1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div className="nav-logo-icon"><Leaf size={18} color="white" /></div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>EcoTrack</span>
              </div>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.75, maxWidth: 240 }}>AI-powered carbon footprint tracking and real-world reforestation platform.</p>
            </div>
            <div>
              <div className="footer-heading">Platform</div>
              {['Carbon Calculator','AI Assistant','Smart Goals','Tree Planting','Leaderboard','Offsets'].map(l => <a key={l} href="#" className="footer-link">{l}</a>)}
            </div>
            <div>
              <div className="footer-heading">Company</div>
              {['About Us','Blog','Press Kit','Partners','Eden Projects','Careers'].map(l => <a key={l} href="#" className="footer-link">{l}</a>)}
            </div>
            <div>
              <div className="footer-heading">Support</div>
              {['Documentation','API Reference','Community','Help Center','Privacy Policy','Terms of Service'].map(l => <a key={l} href="#" className="footer-link">{l}</a>)}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <p style={{ fontSize: '0.825rem' }}>© {new Date().getFullYear()} EcoTrack Inc. All rights reserved.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Twitter','GitHub','LinkedIn','Discord'].map(s => (
                <a key={s} href="#" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s' }}>{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
