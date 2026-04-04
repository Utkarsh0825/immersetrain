'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, Shield, Eye, Brain } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import ThemeToggleButton from '@/components/ThemeToggleButton';

const FEATURES = [
  { icon: Eye, label: '360° Immersive Video' },
  { icon: Brain, label: 'Adaptive Quiz System' },
  { icon: Shield, label: 'Real-World Scenarios' },
];

export default function DemoPage() {
  const t = useThemeStyles();
  const router = useRouter();
  const [entered, setEntered] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    if (!launching) return;
    if (countdown <= 0) {
      router.push('/train/subway-tour-001');
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [launching, countdown, router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: t.bg,
        color: t.text,
        fontFamily: 'var(--font-satoshi)',
        display: 'flex',
        flexDirection: 'column',
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
            ? 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(91,76,255,0.2), transparent 50%), radial-gradient(ellipse 50% 40% at 100% 20%, rgba(0,212,255,0.08), transparent 45%)'
            : 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(91,76,255,0.1), transparent 50%), radial-gradient(ellipse 50% 40% at 100% 20%, rgba(0,212,255,0.05), transparent 45%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          opacity: t.isDark ? 0.05 : 0.07,
          backgroundImage: `linear-gradient(${t.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'} 1px, transparent 1px), linear-gradient(90deg, ${t.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'} 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
          pointerEvents: 'none',
        }}
      />

      {/* Nav bar */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: t.navBg,
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid ' + t.navBorder,
        }}
      >
        <Link href="/" style={{ fontFamily: 'var(--font-clash)', fontSize: 20, fontWeight: 700, color: t.text, textDecoration: 'none' }}>
          ImmerseTrain
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ThemeToggleButton />
          <Link
            href="/"
            style={{
              fontSize: 14,
              color: t.textSecondary,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 500,
            }}
          >
            Back to site <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '100px 24px 60px',
        }}
      >
        <AnimatePresence mode="wait">
          {!entered && !launching ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              style={{ textAlign: 'center', maxWidth: 640 }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 18px',
                  borderRadius: 999,
                  background: 'rgba(91,76,255,0.12)',
                  border: '1px solid rgba(91,76,255,0.25)',
                  marginBottom: 32,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#5B4CFF',
                  letterSpacing: '0.04em',
                }}
              >
                <motion.span
                  aria-hidden
                  animate={{ scale: [1, 1.15, 1], opacity: [0.85, 1, 0.85] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00D4FF, #5B4CFF)',
                    boxShadow: '0 0 12px rgba(0,212,255,0.6)',
                  }}
                />
                LIVE DEMO
              </motion.div>

              <h1
                style={{
                  fontFamily: 'var(--font-clash)',
                  fontSize: 'clamp(32px, 6vw, 56px)',
                  fontWeight: 700,
                  lineHeight: 1.1,
                  margin: '0 0 20px',
                  letterSpacing: '-0.03em',
                }}
              >
                Experience Immersive{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #5B4CFF, #00D4FF)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Training
                </span>
              </h1>

              <p
                style={{
                  fontSize: 18,
                  lineHeight: 1.6,
                  color: t.textSecondary,
                  margin: '0 0 36px',
                  maxWidth: 520,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              >
                Step into a 360° workplace scenario. Answer situational questions
                as they appear. See how immersive training outperforms slide decks.
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: 16,
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  marginBottom: 40,
                }}
              >
                {FEATURES.map((f) => (
                  <div
                    key={f.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 16px',
                      borderRadius: 12,
                      background: t.surface,
                      border: '1px solid ' + t.border,
                      fontSize: 13,
                      color: t.textSecondary,
                    }}
                  >
                    <f.icon size={16} style={{ color: '#5B4CFF' }} />
                    {f.label}
                  </div>
                ))}
              </div>

              <motion.button
                onClick={() => {
                  setEntered(true);
                  setTimeout(() => setLaunching(true), 600);
                }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '16px 36px',
                  borderRadius: 999,
                  background: '#5B4CFF',
                  color: 'white',
                  fontSize: 17,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 0 40px rgba(91,76,255,0.4)',
                  fontFamily: 'var(--font-clash)',
                  letterSpacing: '-0.01em',
                }}
              >
                <Play size={20} fill="white" />
                Launch Demo Scenario
              </motion.button>

              <p style={{ marginTop: 16, fontSize: 13, color: t.textMuted }}>
                ~30 seconds · 10 questions · Works in any browser
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="launching"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 22 }}
              style={{ textAlign: 'center' }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: 64,
                  height: 64,
                  border: '3px solid rgba(91,76,255,0.2)',
                  borderTopColor: '#5B4CFF',
                  borderRadius: '50%',
                  margin: '0 auto 28px',
                }}
              />
              <h2
                style={{
                  fontFamily: 'var(--font-clash)',
                  fontSize: 32,
                  fontWeight: 700,
                  marginBottom: 12,
                  color: t.text,
                }}
              >
                Entering scenario
              </h2>
              <p style={{ color: t.textFaint, fontSize: 16 }}>
                Preparing your 360° environment
              </p>
              {launching && countdown > 0 && (
                <motion.p
                  key={countdown}
                  initial={{ opacity: 0, scale: 1.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    marginTop: 24,
                    fontFamily: 'var(--font-clash)',
                    fontSize: 48,
                    fontWeight: 700,
                    color: '#5B4CFF',
                  }}
                >
                  {countdown}
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom info */}
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          fontSize: 12,
          color: t.textMuted,
          borderTop: '1px solid ' + t.navBorder,
        }}
      >
        This demo uses a sample workplace scenario. In production, you film your own environment.
      </div>
    </div>
  );
}
