'use client';

import { motion, type Variants } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useThemeStyles } from '@/hooks/useThemeStyles';

const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false });

/* ── Animation variants ──────────────────────────────────── */

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

const canvasVariants: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 90, damping: 18, delay: 0.3 },
  },
};

/* ── Styles (object maps) ────────────────────────────────── */

const section: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
};

const inner: React.CSSProperties = {
  display: 'flex',
  width: '100%',
  maxWidth: 1440,
  margin: '0 auto',
  padding: '120px 48px 80px',
  gap: 48,
};

const left: React.CSSProperties = { flex: '0 0 45%', display: 'flex', flexDirection: 'column', justifyContent: 'center' };
const right: React.CSSProperties = { flex: '0 0 55%', position: 'relative', minHeight: 520 };

const pill: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '6px 16px',
  borderRadius: 9999,
  background: 'rgba(91,76,255,0.12)',
  border: '1px solid rgba(91,76,255,0.25)',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.06em',
  color: '#a78bfa',
  marginBottom: 28,
  fontFamily: 'var(--font-satoshi)',
};

const headline: React.CSSProperties = {
  fontFamily: 'var(--font-clash)',
  fontSize: 'clamp(40px, 5.5vw, 72px)',
  fontWeight: 700,
  lineHeight: 1.05,
  letterSpacing: '-0.03em',
  margin: '0 0 24px',
  whiteSpace: 'pre-line',
};

const shimmerWord: React.CSSProperties = {
  background: 'linear-gradient(90deg, #5B4CFF 0%, #00D4FF 50%, #5B4CFF 100%)',
  backgroundSize: '200% 100%',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  animation: 'shimmer 3s linear infinite',
};

const sub: React.CSSProperties = {
  fontFamily: 'var(--font-satoshi)',
  fontSize: 18,
  lineHeight: 1.7,
  maxWidth: 480,
  margin: '0 0 32px',
};

const statPill: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 18px',
  borderRadius: 9999,
  fontSize: 14,
  fontWeight: 600,
  fontFamily: 'var(--font-satoshi)',
};

const ctaFilled: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '14px 32px',
  borderRadius: 9999,
  background: '#5B4CFF',
  color: '#fff',
  fontWeight: 700,
  fontSize: 15,
  textDecoration: 'none',
  fontFamily: 'var(--font-satoshi)',
  boxShadow: '0 0 40px rgba(91,76,255,0.35)',
  transition: 'transform 0.2s, box-shadow 0.2s',
};

const ctaOutline: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '14px 28px',
  borderRadius: 9999,
  background: 'transparent',
  fontWeight: 600,
  fontSize: 15,
  textDecoration: 'none',
  fontFamily: 'var(--font-satoshi)',
  transition: 'border-color 0.2s',
};

const muted: React.CSSProperties = {
  fontSize: 13,
  fontFamily: 'var(--font-satoshi)',
  marginTop: 20,
};

/* ── Responsive CSS injected once ────────────────────────── */

const responsiveCSS = `
  @media (max-width: 768px) {
    .hero-inner {
      flex-direction: column !important;
      padding: 100px 20px 40px !important;
      gap: 24px !important;
    }
    .hero-left { flex: 1 !important; }
    .hero-right { flex: 1 !important; min-height: 320px !important; }
  }
`;

/* ── Component ───────────────────────────────────────────── */

export default function HeroSection() {
  const t = useThemeStyles();

  return (
    <section style={{ ...section, background: t.bg }}>
      <style>{responsiveCSS}</style>

      <div className="hero-inner" style={inner}>
        {/* ── Left: copy ── */}
        <motion.div
          className="hero-left"
          style={left}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <span style={pill}>
              <span style={{ color: '#00D4FF', fontSize: 10 }}>●</span>
              IMMERSIVE TRAINING PLATFORM
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={itemVariants} style={{ ...headline, color: t.text }}>
            Training That
            <br />
            Feels{' '}
            <span style={shimmerWord}>Real</span>
            .
          </motion.h1>

          {/* Subheadline */}
          <motion.p variants={itemVariants} style={{ ...sub, color: t.textSecondary }}>
            Replace slide decks and paper manuals with 360° immersive scenarios.
            Your team trains faster, remembers more, costs you less.
          </motion.p>

          {/* Stat pills */}
          <motion.div variants={itemVariants} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
            <span style={{ ...statPill, background: t.surface, border: `1px solid ${t.border}`, color: t.text }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5B4CFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              4x Faster Learning
            </span>
            <span style={{ ...statPill, background: t.surface, border: `1px solid ${t.border}`, color: t.text }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}><path d="M12 2a7 7 0 0 1 7 7c0 4-3 6-3 9H8c0-3-3-5-3-9a7 7 0 0 1 7-7z" /><path d="M9 21h6" /><path d="M10 24h4" /></svg>
              75% Better Retention
            </span>
          </motion.div>

          {/* CTAs */}
          <motion.div variants={itemVariants} style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link href="/sign-up" style={ctaFilled}>
              Start Free Trial
            </Link>
            <Link href="/demo" style={{ ...ctaOutline, border: `1px solid ${t.borderBright}`, color: t.text }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 6 }}><polygon points="5,3 19,12 5,21" /></svg>
              Watch Demo
            </Link>
          </motion.div>

          {/* Sub-CTA */}
          <motion.p variants={itemVariants} style={{ ...muted, color: t.textMuted }}>
            No credit card required · First scenario free · Works in any browser
          </motion.p>
        </motion.div>

        {/* ── Right: 3D canvas ── */}
        <motion.div
          className="hero-right"
          style={right}
          variants={canvasVariants}
          initial="hidden"
          animate="visible"
        >
          <HeroScene />
        </motion.div>
      </div>
    </section>
  );
}
