'use client';
import Link from 'next/link';
import { useThemeStyles } from '@/hooks/useThemeStyles';

export default function PrivacyPage() {
  const t = useThemeStyles();
  const sectionTitle: React.CSSProperties = {
    fontFamily: 'var(--font-clash)', fontSize: 20, fontWeight: 600,
    color: t.text, margin: '40px 0 12px',
  };
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
          Privacy Policy
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
            ImmerseTrain (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
          </p>

          <h2 style={sectionTitle}>Data Collection</h2>
          <p style={paragraph}>
            We collect information you provide directly, such as your name, email address, and organization details when you create an account. We also collect usage data including training session progress, quiz scores, and interaction patterns to improve our services.
          </p>

          <h2 style={sectionTitle}>Data Usage</h2>
          <p style={paragraph}>
            Your data is used to provide and improve our training platform, personalize your experience, generate analytics and reports, and communicate with you about your account and our services. We do not sell your personal data to third parties.
          </p>

          <h2 style={sectionTitle}>Cookies</h2>
          <p style={paragraph}>
            We use essential cookies to maintain your session and remember your preferences. We do not use third-party tracking cookies. You can manage cookie preferences in your browser settings.
          </p>

          <h2 style={sectionTitle}>Contact</h2>
          <p style={paragraph}>
            If you have questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:hello@immersetrain.com" style={{ color: '#5B4CFF', textDecoration: 'none' }}>
              hello@immersetrain.com
            </a>.
          </p>
        </div>
      </main>
    </div>
  );
}
