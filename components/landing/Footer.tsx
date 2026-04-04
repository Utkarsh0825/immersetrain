'use client';

import Link from 'next/link';
import { useThemeStyles } from '@/hooks/useThemeStyles';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Try Demo', href: '/demo' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  },
];

const headerStyleBase: React.CSSProperties = {
  fontFamily: 'var(--font-satoshi)',
  fontSize: 13,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: 16,
  fontWeight: 600,
};

const linkStyleBase: React.CSSProperties = {
  fontFamily: 'var(--font-satoshi)',
  fontSize: 14,
  textDecoration: 'none',
  transition: 'color 0.2s',
};

export default function Footer() {
  const t = useThemeStyles();
  const headerStyle = { ...headerStyleBase, color: t.footerTextDim };
  const linkStyle = { ...linkStyleBase, color: t.footerText };
  const hoverColor = t.text;

  return (
    <footer style={{ background: t.bg, padding: '72px 24px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Top columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 40,
          }}
          className="footer-grid"
        >
          {/* Brand column */}
          <div>
            <p
              style={{
                fontFamily: 'var(--font-clash)',
                fontSize: 24,
                fontWeight: 700,
                color: t.text,
                marginBottom: 12,
              }}
            >
              ImmerseTrain
            </p>
            <p
              style={{
                fontFamily: 'var(--font-satoshi)',
                fontSize: 15,
                color: t.footerText,
                lineHeight: 1.5,
                marginBottom: 12,
              }}
            >
              Step Inside. Learn by Doing.
            </p>
            <p
              style={{
                fontFamily: 'var(--font-satoshi)',
                fontSize: 13,
                color: t.footerTextDim,
                lineHeight: 1.6,
              }}
            >
              Built as an affordable alternative to enterprise VR training
              platforms.
            </p>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p style={headerStyle}>{col.title}</p>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                {col.links.map((link) => {
                  const isRoute = link.href.startsWith('/');
                  const El = isRoute ? Link : 'a';
                  return (
                    <El
                      key={link.label}
                      href={link.href}
                      style={linkStyle}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.color = hoverColor;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color = t.footerText;
                      }}
                    >
                      {link.label}
                    </El>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            marginTop: 56,
            borderTop: `1px solid ${t.navBorder}`,
            padding: '24px 0',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-satoshi)',
              fontSize: 13,
              color: t.footerTextDim,
            }}
          >
            © 2025 ImmerseTrain. All rights reserved.
          </p>
          <p
            style={{
              fontFamily: 'var(--font-satoshi)',
              fontSize: 13,
              color: t.footerTextDim,
            }}
          >
            Made for frontline workers everywhere.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
