'use client';
import Link from 'next/link';
import { useThemeStyles } from '@/hooks/useThemeStyles';

const CHARTS = [
  { label: 'Completion Trends', color: '#5B4CFF', bg: 'rgba(91,76,255,0.1)', border: 'rgba(91,76,255,0.2)' },
  { label: 'Score Distribution', color: '#00D4FF', bg: 'rgba(0,212,255,0.1)', border: 'rgba(0,212,255,0.2)' },
  { label: 'Time Spent', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
];

export default function AnalyticsPage() {
  const t = useThemeStyles();
  const glass: React.CSSProperties = {
    background: t.surface,
    backdropFilter: 'blur(20px)',
    border: '1px solid ' + t.border,
  };
  return (
    <div style={{ padding: '40px 36px', maxWidth: 1100, fontFamily: 'var(--font-satoshi)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h1 style={{
          fontFamily: 'var(--font-clash)', fontSize: 'clamp(28px, 3.5vw, 38px)',
          fontWeight: 700, margin: 0, letterSpacing: '-0.03em', color: t.text,
        }}>
          Analytics
        </h1>
        <Link href="/dashboard" style={{ fontSize: 13, color: t.textMuted, textDecoration: 'none' }}>
          ← Back to Dashboard
        </Link>
      </div>

      <p style={{
        fontSize: 15, margin: '0 0 40px',
        background: `linear-gradient(90deg, ${t.textSecondary}, rgba(91,76,255,0.6))`,
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>
        Track training performance and learner engagement
      </p>

      <div style={{
        ...glass, borderRadius: 16, padding: '48px 24px', textAlign: 'center', marginBottom: 32,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: 'rgba(91,76,255,0.08)', border: '1px solid rgba(91,76,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(91,76,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="12" width="4" height="9" rx="1" />
            <rect x="10" y="8" width="4" height="13" rx="1" />
            <rect x="17" y="4" width="4" height="17" rx="1" />
          </svg>
        </div>
        <p style={{ fontSize: 16, fontWeight: 500, color: t.textSecondary, margin: '0 0 6px' }}>
          Analytics dashboard coming soon
        </p>
        <p style={{ fontSize: 13, color: t.textMuted, margin: 0 }}>
          Complete training scenarios to start generating insights.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {CHARTS.map(({ label, color, bg, border }) => (
          <div key={label} style={{ ...glass, borderRadius: 16, padding: '24px', minHeight: 200 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: bg, border: `1px solid ${border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}>
              <ChartIcon size={16} color={color} />
            </div>
            <div style={{
              fontFamily: 'var(--font-clash)', fontSize: 15, fontWeight: 600,
              color: t.text, marginBottom: 8,
            }}>
              {label}
            </div>
            <div style={{
              height: 100, borderRadius: 10,
              background: `linear-gradient(135deg, ${bg}, transparent)`,
              border: `1px dashed ${border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, color: t.textMuted,
            }}>
              No data yet
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="repeat(3, 1fr)"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function ChartIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="12" width="4" height="9" rx="1" />
      <rect x="10" y="8" width="4" height="13" rx="1" />
      <rect x="17" y="4" width="4" height="17" rx="1" />
    </svg>
  );
}
