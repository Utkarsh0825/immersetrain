'use client';
import Link from 'next/link';
import { useThemeStyles } from '@/hooks/useThemeStyles';

export default function TermsPage() {
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
          Terms of Service
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
          <h2 style={sectionTitle}>Acceptance of Terms</h2>
          <p style={paragraph}>
            By accessing or using the ImmerseTrain platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>

          <h2 style={sectionTitle}>Use License</h2>
          <p style={paragraph}>
            We grant you a limited, non-exclusive, non-transferable license to use the ImmerseTrain platform for your internal training purposes. You may not redistribute, sublicense, or reverse-engineer any part of the platform. All content you upload remains your property, but you grant us a license to host and process it for service delivery.
          </p>

          <h2 style={sectionTitle}>Limitations</h2>
          <p style={paragraph}>
            You agree not to use the platform for any unlawful purpose, attempt to gain unauthorized access to our systems, upload harmful or malicious content, or interfere with other users&apos; access to the service. We reserve the right to suspend accounts that violate these terms.
          </p>

          <h2 style={sectionTitle}>Governing Law</h2>
          <p style={paragraph}>
            These terms shall be governed by and construed in accordance with the laws of the United States, without regard to conflict of law provisions. Any disputes arising from these terms shall be resolved in the courts of Delaware.
          </p>
        </div>
      </main>
    </div>
  );
}
