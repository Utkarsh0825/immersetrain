'use client';
import Link from 'next/link';
import { useThemeStyles } from '@/hooks/useThemeStyles';

export default function AboutPage() {
  const t = useThemeStyles();
  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text, fontFamily: 'var(--font-satoshi)' }}>
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px', maxWidth: 1200, margin: '0 auto',
      }}>
        <Link href="/" style={{ fontFamily: 'var(--font-clash)', fontSize: 20, fontWeight: 700, color: t.text, textDecoration: 'none' }}>
          ImmerseTrain
        </Link>
        <Link href="/" style={{ fontSize: 14, color: t.textSecondary, textDecoration: 'none' }}>
          ← Back to Home
        </Link>
      </nav>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px 100px' }}>
        <h1 style={{
          fontFamily: 'var(--font-clash)', fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 700, margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.1,
        }}>
          About ImmerseTrain
        </h1>

        <div style={{
          width: 64, height: 3, borderRadius: 2,
          background: 'linear-gradient(90deg, #5B4CFF, #00D4FF)', marginBottom: 40,
        }} />

        <p style={{ fontSize: 18, lineHeight: 1.8, color: t.textSecondary, margin: '0 0 32px' }}>
          ImmerseTrain is building the most affordable immersive training platform for frontline workers.
          We believe every team deserves access to 360° scenario-based learning — not just the ones with
          enterprise budgets.
        </p>

        <div style={{
          background: t.surface, backdropFilter: 'blur(20px)',
          border: '1px solid ' + t.border, borderRadius: 16, padding: '32px',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-clash)', fontSize: 22, fontWeight: 600,
            margin: '0 0 16px', color: t.text,
          }}>
            Our Mission
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: t.textSecondary, margin: '0 0 16px' }}>
            Traditional training methods fail to prepare workers for high-stakes environments.
            Immersive 360° training bridges that gap — but until now, it's been locked behind expensive
            enterprise contracts.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: t.textSecondary, margin: 0 }}>
            We're changing that. ImmerseTrain lets any organization create, deploy, and track
            immersive training scenarios at a fraction of the cost.
          </p>
        </div>
      </main>
    </div>
  );
}
