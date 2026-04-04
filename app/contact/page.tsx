'use client';
import Link from 'next/link';
import { useThemeStyles } from '@/hooks/useThemeStyles';

export default function ContactPage() {
  const t = useThemeStyles();
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: 10, fontSize: 14,
    fontFamily: 'var(--font-satoshi)', color: t.text,
    background: t.surface, border: '1px solid ' + t.border,
    outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
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
          Contact Us
        </h1>

        <div style={{
          width: 64, height: 3, borderRadius: 2,
          background: 'linear-gradient(90deg, #5B4CFF, #00D4FF)', marginBottom: 20,
        }} />

        <p style={{ fontSize: 16, lineHeight: 1.7, color: t.textSecondary, margin: '0 0 48px' }}>
          Have a question or want to learn more? Reach out at{' '}
          <a href="mailto:hello@immersetrain.com" style={{ color: '#5B4CFF', textDecoration: 'none' }}>
            hello@immersetrain.com
          </a>{' '}
          or use the form below.
        </p>

        <form
          onSubmit={(e) => e.preventDefault()}
          style={{
            background: t.surface, backdropFilter: 'blur(20px)',
            border: '1px solid ' + t.border, borderRadius: 16, padding: '32px',
            display: 'flex', flexDirection: 'column', gap: 20,
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: t.textSecondary, marginBottom: 8 }}>
              Name
            </label>
            <input type="text" placeholder="Your name" style={inputStyle} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: t.textSecondary, marginBottom: 8 }}>
              Email
            </label>
            <input type="email" placeholder="you@company.com" style={inputStyle} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: t.textSecondary, marginBottom: 8 }}>
              Message
            </label>
            <textarea
              rows={5}
              placeholder="How can we help?"
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '14px 28px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: '#5B4CFF', color: 'white', fontWeight: 600, fontSize: 15,
              fontFamily: 'var(--font-satoshi)',
              boxShadow: '0 0 30px rgba(91,76,255,0.25)',
              transition: 'transform 0.15s',
            }}
          >
            Send Message
          </button>
        </form>
      </main>
    </div>
  );
}
