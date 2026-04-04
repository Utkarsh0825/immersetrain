'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import ThemeToggleButton from '@/components/ThemeToggleButton';

type Variant = 'sign-in' | 'sign-up';

export default function AuthShell({ variant }: { variant: Variant }) {
  const t = useThemeStyles();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const isSignUp = variant === 'sign-up';

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: t.bg,
        color: t.text,
        fontFamily: 'var(--font-satoshi)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: t.isDark
            ? 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(91,76,255,0.22), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(0,212,255,0.08), transparent 50%)'
            : 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(91,76,255,0.12), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(0,212,255,0.06), transparent 50%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          opacity: t.isDark ? 0.04 : 0.06,
          backgroundImage: `linear-gradient(${t.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} 1px, transparent 1px), linear-gradient(90deg, ${t.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
        }}
      />

      <header
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 28px',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-clash)',
            fontSize: 20,
            fontWeight: 700,
            color: t.text,
            textDecoration: 'none',
            letterSpacing: '-0.02em',
          }}
        >
          ImmerseTrain
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ThemeToggleButton />
          <Link
            href="/"
            style={{ fontSize: 14, fontWeight: 500, color: t.textSecondary, textDecoration: 'none' }}
          >
            Back to home
          </Link>
        </div>
      </header>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px 80px',
          minHeight: 'calc(100vh - 88px)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: '100%',
            maxWidth: 420,
            padding: '40px 36px',
            borderRadius: 20,
            background: t.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.72)',
            border: `1px solid ${t.border}`,
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: t.isDark
              ? '0 24px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)'
              : '0 24px 80px rgba(15,15,20,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #5B4CFF, #00D4FF)',
              marginBottom: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 32px rgba(91,76,255,0.35)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 1L14.5 5V11L8 15L1.5 11V5L8 1Z"
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-clash)',
              fontSize: 28,
              fontWeight: 700,
              margin: '0 0 8px',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
            }}
          >
            {isSignUp ? 'Create your workspace' : 'Welcome back'}
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: t.textSecondary, margin: '0 0 32px' }}>
            {isSignUp
              ? 'Start building immersive 360° training scenarios for your team.'
              : 'Sign in to manage scenarios, analytics, and learner progress.'}
          </p>

          <form onSubmit={onSubmit}>
            {!isSignUp ? null : (
              <label style={{ display: 'block', marginBottom: 18 }}>
                <span
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: t.textMuted,
                    marginBottom: 8,
                  }}
                >
                  Full name
                </span>
                <input
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Alex Rivera"
                  style={inputStyle(t)}
                />
              </label>
            )}
            <label style={{ display: 'block', marginBottom: 18 }}>
              <span
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: t.textMuted,
                  marginBottom: 8,
                }}
              >
                Work email
              </span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                style={inputStyle(t)}
              />
            </label>
            <label style={{ display: 'block', marginBottom: 28 }}>
              <span
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: t.textMuted,
                  marginBottom: 8,
                }}
              >
                Password
              </span>
              <input
                name="password"
                type="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                placeholder="Enter password"
                style={inputStyle(t)}
              />
            </label>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                padding: '15px 24px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, #5B4CFF 0%, #4338ca 100%)',
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                fontFamily: 'var(--font-clash)',
                cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(91,76,255,0.4)',
                marginBottom: 20,
              }}
            >
              {isSignUp ? 'Create account' : 'Continue to dashboard'}
            </motion.button>
          </form>

          <p
            style={{
              fontSize: 13,
              color: t.textMuted,
              textAlign: 'center',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Demo mode — no password required. You will be taken to the dashboard.
          </p>

          <div
            style={{
              marginTop: 28,
              paddingTop: 28,
              borderTop: `1px solid ${t.border}`,
              textAlign: 'center',
              fontSize: 14,
              color: t.textSecondary,
            }}
          >
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <Link href="/sign-in" style={{ color: '#5B4CFF', fontWeight: 600, textDecoration: 'none' }}>
                  Sign in
                </Link>
              </>
            ) : (
              <>
                New to ImmerseTrain?{' '}
                <Link href="/sign-up" style={{ color: '#5B4CFF', fontWeight: 600, textDecoration: 'none' }}>
                  Start free trial
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function inputStyle(t: { border: string; text: string; isDark: boolean }): React.CSSProperties {
  return {
    width: '100%',
    boxSizing: 'border-box',
    padding: '14px 16px',
    borderRadius: 12,
    border: `1px solid ${t.border}`,
    background: t.isDark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.9)',
    color: t.text,
    fontSize: 15,
    fontFamily: 'var(--font-satoshi)',
    outline: 'none',
  };
}
