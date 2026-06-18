'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf, LayoutDashboard, Calculator, Bot, Target, TreePine,
  Users, BarChart3, Award, BookOpen, Bell, User, LogOut,
  Menu, X, Sun, Moon, ChevronRight, Zap, CheckCheck, Trophy, Flame, Star
} from 'lucide-react';
import { useAuthStore, useThemeStore, useUIStore } from '@/store';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Calculator, label: 'Calculator', href: '/calculator' },
  { icon: Bot, label: 'AI Assistant', href: '/ai' },
  { icon: Target, label: 'Goals', href: '/goals' },
  { icon: TreePine, label: 'Trees', href: '/trees' },
  { icon: Award, label: 'Challenges', href: '/challenges' },
  { icon: Users, label: 'Community', href: '/community' },
  { icon: BarChart3, label: 'Reports', href: '/reports' },
  { icon: BookOpen, label: 'Learn', href: '/learning' },
  { icon: Award, label: 'Leaderboard', href: '/leaderboard' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Notification data
  const [notifications, setNotifications] = useState([
    { id: '1', icon: Trophy, color: '#F59E0B', title: '🏆 Challenge Completed!', body: 'You finished "Walk to Work" — +100 Eco Points earned!', time: '2 min ago', unread: true },
    { id: '2', icon: Flame, color: '#EF4444', title: '🔥 7-Day Streak!', body: 'You\'ve logged activity 7 days in a row. Keep it up!', time: '1 hr ago', unread: true },
    { id: '3', icon: Star, color: '#8B5CF6', title: '⭐ New Badge Unlocked', body: 'You earned the "Carbon Reducer" badge for reducing CO₂ by 20%.', time: '3 hrs ago', unread: true },
    { id: '4', icon: Zap, color: '#22C55E', title: '🌱 Goal Progress', body: '"Plant 20 Trees" is 60% complete. 8 more to go!', time: 'Yesterday', unread: false },
  ]);
  const unreadCount = notifications.filter(n => n.unread).length;
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile && !sidebarOpen) setSidebarOpen(true);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [pathname, isMobile]);

  if (!isAuthenticated) {
    router.replace('/login');
    return null;
  }

  const handleLogout = () => { logout(); router.push('/'); };

  const pageTitle = pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard';


  return (
    <div className={isDark ? 'dark' : ''} style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Mobile Backdrop ───────────────────── */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 35 }}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ──────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -296, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -296, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="sidebar"
          >
            {/* Logo Header */}
            <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#22C55E,#16A34A)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(34,197,94,0.3)' }}>
                  <Leaf size={19} color="white" strokeWidth={2.5} />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>EcoTrack</span>
              </Link>
              {isMobile && (
                <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                  <X size={20} />
                </button>
              )}
            </div>

            {/* User Card */}
            <div style={{ padding: '18px 16px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 16, padding: '14px 16px' }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg,#22C55E,#16A34A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <Zap size={11} fill="currentColor" /> {(user as any)?.ecoPoints || 0} EcoPoints
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 12px 8px' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.09em', padding: '10px 6px 8px', marginBottom: 2 }}>Navigation</div>
              {/* Use sidebar-nav-group for consistent gap-4 spacing */}
              <div className="sidebar-nav-group">
                {navItems.map(item => {
                  const active = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href} className="sidebar-nav-item" style={{
                      background: active ? 'linear-gradient(135deg,rgba(34,197,94,0.12),rgba(134,239,172,0.06))' : 'transparent',
                      color: active ? 'var(--primary-dark)' : 'var(--text-muted)',
                    }}>
                      {active && (
                        <motion.div layoutId="nav-active" style={{
                          position: 'absolute', inset: 0, borderRadius: 12,
                          background: 'linear-gradient(135deg,rgba(34,197,94,0.12),rgba(134,239,172,0.06))',
                          border: '1px solid rgba(34,197,94,0.18)',
                        }} />
                      )}
                      <item.icon size={17} style={{ position: 'relative', zIndex: 1, flexShrink: 0 }} />
                      <span style={{ position: 'relative', zIndex: 1, flex: 1 }}>{item.label}</span>
                      {active && <ChevronRight size={14} style={{ position: 'relative', zIndex: 1, opacity: 0.6 }} />}
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Bottom Actions */}
            <div style={{ padding: '12px 12px 20px', borderTop: '1px solid var(--border)' }}>
              <div className="sidebar-nav-group">
                <Link href="/profile" className="sidebar-nav-item" style={{ color: pathname === '/profile' ? 'var(--primary-dark)' : 'var(--text-muted)' }}>
                  <User size={17} /> <span>Profile</span>
                </Link>
                <button onClick={handleLogout} className="sidebar-nav-item" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}>
                  <LogOut size={17} /> <span>Sign Out</span>
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main Content ──────────────────────── */}
      <div style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        marginLeft: sidebarOpen && !isMobile ? 312 : 0,   /* 280px sidebar + 16px left offset + 16px gap */
        transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Topbar */}
        <header className="topbar">
          <button onClick={toggleSidebar} style={{
            width: 42, height: 42, borderRadius: 11,
            border: '1px solid var(--border)', background: 'var(--white)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text)', flexShrink: 0,
          }}>
            <Menu size={19} />
          </button>

          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.125rem', color: 'var(--text)', textTransform: 'capitalize', letterSpacing: '-0.01em' }}>
              {pageTitle}
            </h1>
          </div>

          {/* Topbar Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={toggleTheme} style={{
              width: 40, height: 40, borderRadius: 11, border: '1px solid var(--border)',
              background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)',
            }}>
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <div style={{ position: 'relative' }} ref={notifRef}>
              <button onClick={() => setNotifOpen(!notifOpen)} style={{
                width: 40, height: 40, borderRadius: 11, border: '1px solid var(--border)',
                background: notifOpen ? 'var(--bg-2)' : 'var(--white)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-muted)', position: 'relative',
              }}>
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 6, right: 6, width: 8, height: 8,
                    borderRadius: '50%', background: '#EF4444',
                    border: '1.5px solid var(--white)',
                  }} />
                )}
              </button>

              {/* ── Notification Dropdown ── */}
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.18 }}
                    style={{
                      position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                      width: 340, background: 'var(--white)',
                      borderRadius: 18, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                      border: '1px solid var(--border)', zIndex: 100, overflow: 'hidden',
                    }}
                  >
                    {/* Header */}
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text)' }}>Notifications</div>
                        {unreadCount > 0 && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{unreadCount} unread</div>}
                      </div>
                      <button onClick={markAllRead}
                        style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <CheckCheck size={14} /> Mark all read
                      </button>
                    </div>

                    {/* Notification list */}
                    <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                      {notifications.map(n => (
                        <div key={n.id}
                          style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'flex-start', background: n.unread ? 'rgba(34,197,94,0.03)' : 'transparent', cursor: 'pointer', transition: 'background 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = n.unread ? 'rgba(34,197,94,0.03)' : 'transparent'; }}
                          onClick={() => markRead(n.id)}
                        >
                          <div style={{ width: 38, height: 38, borderRadius: 11, background: `${n.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <n.icon style={{ width: 17, height: 17, color: n.color }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: n.unread ? 700 : 500, color: 'var(--text)', lineHeight: 1.4 }}>{n.title}</div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.4 }}>{n.body}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: 5 }}>{n.time}</div>
                          </div>
                          {n.unread && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', flexShrink: 0, marginTop: 5 }} />}
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div style={{ padding: '12px 20px', textAlign: 'center' }}>
                      <Link href="/challenges" onClick={() => setNotifOpen(false)}
                        style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
                        View all activity →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/profile" style={{
              width: 40, height: 40, borderRadius: 11,
              background: 'linear-gradient(135deg,#22C55E,#16A34A)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 800, fontSize: '0.9rem',
              textDecoration: 'none', boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{ maxWidth: 1280, margin: '0 auto' }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
