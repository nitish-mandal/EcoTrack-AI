'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Leaf, CheckCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const userRaw = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      const messages: Record<string, string> = {
        google_failed: 'Google sign-in failed. Please try again.',
        github_failed: 'GitHub sign-in failed. Please try again.',
      };
      setErrorMsg(messages[error] || 'OAuth sign-in failed.');
      setStatus('error');
      setTimeout(() => router.replace('/login'), 3000);
      return;
    }

    if (!token || !userRaw) {
      setErrorMsg('Invalid authentication response.');
      setStatus('error');
      setTimeout(() => router.replace('/login'), 3000);
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userRaw));
      setAuth(user, token);
      setStatus('success');
      toast.success(`Welcome, ${user.name}! 🌱`);
      // Short delay so the success animation shows
      setTimeout(() => router.replace('/dashboard'), 1200);
    } catch {
      setErrorMsg('Failed to parse user data.');
      setStatus('error');
      setTimeout(() => router.replace('/login'), 3000);
    }
  }, [searchParams, setAuth, router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #071A0E 0%, #0A1F16 50%, #071525 100%)',
    }}>
      {/* Background blobs */}
      <div style={{ position: 'fixed', top: '-20%', left: '-20%', width: 500, height: 500, background: 'rgba(34,197,94,0.12)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-20%', right: '-20%', width: 400, height: 400, background: 'rgba(134,239,172,0.08)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 24,
          padding: '48px 40px',
          textAlign: 'center',
          maxWidth: 380,
          width: '100%',
          backdropFilter: 'blur(20px)',
          position: 'relative',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 42, height: 42, background: 'linear-gradient(135deg,#22C55E,#16A34A)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(34,197,94,0.35)' }}>
            <Leaf size={22} color="white" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>EcoTrack</span>
        </div>

        {/* Status icon */}
        {status === 'loading' && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ width: 56, height: 56, borderRadius: '50%', border: '3px solid rgba(34,197,94,0.2)', borderTopColor: '#22C55E', margin: '0 auto 24px' }}
          />
        )}

        {status === 'success' && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
            <CheckCircle size={56} color="#22C55E" style={{ margin: '0 auto 24px', display: 'block' }} />
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
            <XCircle size={56} color="#EF4444" style={{ margin: '0 auto 24px', display: 'block' }} />
          </motion.div>
        )}

        {/* Message */}
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', color: 'white', marginBottom: 10 }}>
          {status === 'loading' && 'Signing you in…'}
          {status === 'success' && 'Sign-in successful!'}
          {status === 'error' && 'Sign-in failed'}
        </h2>

        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', lineHeight: 1.6 }}>
          {status === 'loading' && 'Please wait while we set up your account.'}
          {status === 'success' && 'Redirecting to your dashboard…'}
          {status === 'error' && (errorMsg || 'Redirecting back to login…')}
        </p>
      </motion.div>
    </div>
  );
}
