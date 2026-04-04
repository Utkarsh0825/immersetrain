'use client';
import Link from 'next/link';
import { useThemeStyles } from '@/hooks/useThemeStyles';

export default function CookiePolicyPage() {
  const t = useThemeStyles();
  const paragraph: React.CSSProperties = {
    fontSize: 15, lineHeight: 1.8, color: t.textSecondary, margin: '0 0 16px',
  };
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
          Cookie Policy
        </h1>

        <div style={{
          width: 64, height: 3, borderRadius: 2,
          background: 'linear-gradient(90deg, #5B4CFF, #00D4FF)', marginBottom: 12,
        }} />

        <p style={{ fontSize: 13, color: t.textMuted, margin: '0 0 40px' }}>
          Last updated: April 3, 2026
        </p>

        <div style={{
          background: t.surface, backdropFilter: 'blur(20px)',
          border: '1px solid ' + t.border, borderRadius: 16, padding: '32px',
        }}>
          <p style={paragraph}>
            ImmerseTrain uses essential cookies only. These cookies are strictly necessary for the platform to function and cannot be switched off.
          </p>

          <h2 style={{
            fontFamily: 'var(--font-clash)', fontSize: 20, fontWeight: 600,
            color: t.text, margin: '32px 0 12px',
          }}>
            What Are Cookies?
          </h2>
          <p style={paragraph}>
            Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and improve your browsing experience.
          </p>

          <h2 style={{
            fontFamily: 'var(--font-clash)', fontSize: 20, fontWeight: 600,
            color: t.text, margin: '32px 0 12px',
          }}>
            Cookies We Use
          </h2>

          <div style={{
            display: 'grid', gap: 12, marginBottom: 24,
          }}>
            {[
              { name: 'Session Cookie', purpose: 'Keeps you logged in during your visit', duration: 'Session' },
              { name: 'Preferences', purpose: 'Remembers your display and notification settings', duration: '1 year' },
              { name: 'Security', purpose: 'Helps prevent cross-site request forgery', duration: 'Session' },
            ].map((cookie) => (
              <div key={cookie.name} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 18px', borderRadius: 10,
                background: t.surface, border: '1px solid ' + t.border,
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 2 }}>
                    {cookie.name}
                  </div>
                  <div style={{ fontSize: 12, color: t.textMuted }}>{cookie.purpose}</div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6,
                  background: 'rgba(91,76,255,0.12)', color: '#5B4CFF',
                }}>
                  {cookie.duration}
                </span>
              </div>
            ))}
          </div>

          <p style={paragraph}>
            We do not use any third-party tracking, advertising, or analytics cookies. For questions, contact us at{' '}
            <a href="mailto:hello@immersetrain.com" style={{ color: '#5B4CFF', textDecoration: 'none' }}>
              hello@immersetrain.com
            </a>.
          </p>
        </div>
      </main>
    </div>
  );
}
