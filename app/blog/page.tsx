'use client';
import Link from 'next/link';
import { useThemeStyles } from '@/hooks/useThemeStyles';

const POSTS = [
  { title: 'Why 360° Video Beats Traditional Safety Training', tag: 'Research', date: 'Coming Soon' },
  { title: 'Building Immersive Scenarios on a Budget', tag: 'Guide', date: 'Coming Soon' },
  { title: 'The Future of Frontline Workforce Development', tag: 'Industry', date: 'Coming Soon' },
];

export default function BlogPage() {
  const t = useThemeStyles();
  const glass: React.CSSProperties = {
    background: t.surface,
    backdropFilter: 'blur(20px)',
    border: '1px solid ' + t.border,
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
          Blog
        </h1>

        <div style={{
          width: 64, height: 3, borderRadius: 2,
          background: 'linear-gradient(90deg, #5B4CFF, #00D4FF)', marginBottom: 20,
        }} />

        <p style={{ fontSize: 16, lineHeight: 1.7, color: t.textSecondary, margin: '0 0 48px' }}>
          Coming soon. We're working on sharing insights about immersive training,
          360° video production, and workforce development.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {POSTS.map((post) => (
            <div key={post.title} style={{
              ...glass, borderRadius: 16, padding: '28px 28px',
              transition: 'border-color 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                  padding: '3px 10px', borderRadius: 6,
                  background: 'rgba(91,76,255,0.12)', color: '#5B4CFF',
                }}>
                  {post.tag}
                </span>
                <span style={{ fontSize: 12, color: t.textMuted }}>{post.date}</span>
              </div>
              <h2 style={{
                fontFamily: 'var(--font-clash)', fontSize: 19, fontWeight: 600,
                color: t.text, margin: 0, lineHeight: 1.35,
              }}>
                {post.title}
              </h2>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
