'use client';
import Link from 'next/link';
import { useThemeStyles } from '@/hooks/useThemeStyles';

export default function CareersPage() {
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
          Careers
        </h1>

        <div style={{
          width: 64, height: 3, borderRadius: 2,
          background: 'linear-gradient(90deg, #5B4CFF, #00D4FF)', marginBottom: 40,
        }} />

        <p style={{ fontSize: 18, lineHeight: 1.8, color: t.textSecondary, margin: '0 0 40px' }}>
          We're a small team building something big. No open positions right now,
          but we're always interested in hearing from passionate people.
        </p>

        <div style={{
          background: t.surface, backdropFilter: 'blur(20px)',
          border: '1px solid ' + t.border, borderRadius: 16, padding: '32px',
          textAlign: 'center',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'rgba(91,76,255,0.08)', border: '1px solid rgba(91,76,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 24,
          }}>
            ✉
          </div>
          <p style={{ fontSize: 15, color: t.textSecondary, margin: '0 0 12px' }}>
            Think you'd be a great fit? Drop us a line.
          </p>
          <a
            href="mailto:hello@immersetrain.com"
            style={{
              display: 'inline-block', padding: '12px 28px', borderRadius: 10,
              background: '#5B4CFF', color: 'white', fontWeight: 600, fontSize: 14,
              textDecoration: 'none', boxShadow: '0 0 30px rgba(91,76,255,0.25)',
            }}
          >
            hello@immersetrain.com
          </a>
        </div>
      </main>
    </div>
  );
}
