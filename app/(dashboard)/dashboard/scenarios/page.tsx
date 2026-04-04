'use client';
import Link from 'next/link';
import { useThemeStyles } from '@/hooks/useThemeStyles';

export default function ScenariosPage() {
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
          Scenarios
        </h1>
        <Link href="/dashboard" style={{ fontSize: 13, color: t.textMuted, textDecoration: 'none' }}>
          ← Back to Dashboard
        </Link>
      </div>

      <p style={{
        fontSize: 15, color: t.textSecondary, margin: '0 0 40px',
        background: `linear-gradient(90deg, ${t.textSecondary}, rgba(91,76,255,0.6))`,
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>
        Manage and launch your immersive training scenarios
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Scenario card */}
        <div style={{ ...glass, borderRadius: 18, overflow: 'hidden' }}>
          <div style={{
            height: 140, position: 'relative',
            background: 'linear-gradient(135deg, rgba(91,76,255,0.15) 0%, rgba(0,212,255,0.08) 100%)',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(6,6,8,0.9) 0%, transparent 60%)',
            }} />
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: 48, height: 48, borderRadius: '50%',
              background: 'rgba(91,76,255,0.2)', border: '1px solid rgba(91,76,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>
              ▶
            </div>
            <div style={{
              position: 'absolute', top: 10, right: 10, padding: '3px 10px', borderRadius: 6,
              background: 'linear-gradient(135deg, rgba(91,76,255,0.9), rgba(0,212,255,0.9))',
              fontSize: 11, fontWeight: 700, color: 'white', letterSpacing: '0.04em',
            }}>
              360°
            </div>
          </div>

          <div style={{ padding: '20px 22px' }}>
            <h3 style={{
              fontFamily: 'var(--font-clash)', fontSize: 17, fontWeight: 600,
              color: t.text, margin: '0 0 6px',
            }}>
              Workplace Safety Training
            </h3>
            <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 18 }}>
              10 questions · 30 sec video
            </div>
            <Link
              href="/train/subway-tour-001"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '12px', borderRadius: 10, background: '#5B4CFF',
                color: 'white', fontWeight: 600, fontSize: 14, textDecoration: 'none',
                boxShadow: '0 0 30px rgba(91,76,255,0.25)',
              }}
            >
              Try it →
            </Link>
          </div>
        </div>

        {/* Create new */}
        <Link href="/create" style={{ textDecoration: 'none' }}>
          <div style={{
            height: '100%', borderRadius: 18, border: '2px dashed ' + t.border,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 16, padding: 32, minHeight: 300, cursor: 'pointer',
            transition: 'border-color 0.3s',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'rgba(91,76,255,0.08)', border: '1px solid rgba(91,76,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, color: '#5B4CFF',
            }}>
              +
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-clash)', fontSize: 16, fontWeight: 600,
                color: t.text, textAlign: 'center', marginBottom: 4,
              }}>
                Create New Scenario
              </div>
              <div style={{ fontSize: 13, color: t.textMuted, textAlign: 'center' }}>
                Upload 360° video and add questions
              </div>
            </div>
          </div>
        </Link>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
