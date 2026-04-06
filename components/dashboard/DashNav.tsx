'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useThemeStyles } from '@/hooks/useThemeStyles';

const LINKS = [
  { label: 'Overview', href: '/dashboard' },
  { label: 'Create', href: '/dashboard/create' },
  { label: 'Results', href: '/dashboard/scenarios' },
];

export default function DashNav() {
  const t = useThemeStyles();
  const pathname = usePathname();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 80,
        width: '100%',
        background: t.isDark ? 'rgba(6,6,8,0.78)' : 'rgba(255,255,255,0.78)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${t.border}`,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
        }}
      >
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
            color: t.text,
            minWidth: 0,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 30,
              height: 30,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #5B4CFF, #00D4FF)',
              boxShadow: '0 0 22px rgba(91,76,255,0.28)',
              flexShrink: 0,
            }}
          />
          <span style={{ fontFamily: 'var(--font-clash)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            ImmerseTrain
          </span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          {LINKS.map((l) => {
            const active = pathname === l.href || (l.href !== '/dashboard' && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  position: 'relative',
                  padding: '8px 2px',
                  textDecoration: 'none',
                  color: active ? t.text : t.textSecondary,
                  fontFamily: 'var(--font-satoshi)',
                  fontWeight: active ? 700 : 600,
                  fontSize: 14,
                }}
              >
                {l.label}
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 2,
                    height: 2,
                    borderRadius: 2,
                    background: 'linear-gradient(90deg, rgba(91,76,255,0.95), rgba(0,212,255,0.85))',
                    opacity: active ? 1 : 0,
                    transform: active ? 'scaleX(1)' : 'scaleX(0.6)',
                    transition: 'opacity 0.2s, transform 0.2s',
                  }}
                />
              </Link>
            );
          })}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              padding: '6px 10px',
              borderRadius: 999,
              border: `1px solid ${t.border}`,
              background: t.surface,
              fontSize: 12,
              fontWeight: 700,
              color: t.textSecondary,
              fontFamily: 'var(--font-satoshi)',
              whiteSpace: 'nowrap',
            }}
          >
            Demo Organization
          </span>
          <span
            title="User"
            style={{
              width: 30,
              height: 30,
              borderRadius: 999,
              background: 'rgba(91,76,255,0.16)',
              border: '1px solid rgba(91,76,255,0.26)',
              display: 'grid',
              placeItems: 'center',
              color: '#c4b5fd',
              fontWeight: 800,
              fontFamily: 'var(--font-satoshi)',
              fontSize: 12,
            }}
          >
            D
          </span>
        </div>
      </div>
    </header>
  );
}
