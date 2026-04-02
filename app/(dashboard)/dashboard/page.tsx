import Link from 'next/link';
import { Play, Clock, BookOpen, TrendingUp, Zap } from 'lucide-react';
import { DEMO_SCENARIO, SUBWAY_TOUR_SCENARIO } from '@/lib/scenarios';
import ScoreCardServer from './ScoreCardServer';
import { CLERK_READY } from '@/lib/clerkReady';

export default async function DashboardPage() {
  let userId: string | null = 'demo-user';
  let firstName = 'Trainee';

  if (CLERK_READY) {
    const { auth, currentUser } = await import('@clerk/nextjs/server');
    const { redirect } = await import('next/navigation');
    const authResult = await auth();
    if (!authResult.userId) redirect('/sign-in');
    userId = authResult.userId;
    const user = await currentUser();
    firstName = user?.firstName ?? 'Trainee';
  }

  let sessions: Array<{
    id: string; score: number; max_score: number; completed: boolean; started_at: string; scenario_id: string;
  }> = [];

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('xxx')) {
      const { createServiceClient } = await import('@/lib/supabase');
      const supabase = createServiceClient();
      const { data } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(20);
      sessions = data ?? [];
    }
  } catch {}

  const completedSessions = sessions.filter(s => s.completed);
  const passedSessions = completedSessions.filter(s => s.max_score > 0 && (s.score / s.max_score) >= 0.7);
  const passRate = completedSessions.length > 0 ? Math.round((passedSessions.length / completedSessions.length) * 100) : 0;
  const avgScore = completedSessions.length > 0
    ? Math.round(completedSessions.reduce((sum, s) => sum + (s.max_score > 0 ? (s.score / s.max_score) * 100 : 0), 0) / completedSessions.length)
    : 0;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>

      {/* Ambient glow */}
      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 800, height: 400, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 70%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Greeting */}
        <div style={{ marginBottom: 44 }}>
          <h1 style={{
            fontFamily: 'var(--font-syne, system-ui)', fontSize: 'clamp(26px, 3.5vw, 40px)',
            fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.03em', color: '#f1f5f9',
          }}>
            Welcome back, {firstName} 👋
          </h1>
          <p style={{ color: 'rgba(241,245,249,0.35)', fontSize: 15, margin: 0 }}>
            Continue your training or explore new scenarios.
          </p>
        </div>

        {/* Stats */}
        {completedSessions.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 44 }}>
            {[
              { label: 'Completed', value: completedSessions.length, icon: <BookOpen size={15} />, color: '#2563eb', bg: 'rgba(37,99,235,0.1)', border: 'rgba(37,99,235,0.2)' },
              { label: 'Pass Rate', value: `${passRate}%`, icon: <TrendingUp size={15} />, color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
              { label: 'Avg Score', value: `${avgScore}%`, icon: <Zap size={15} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
            ].map(({ label, value, icon, color, bg, border }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: '24px',
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, marginBottom: 14 }}>
                  {icon}
                </div>
                <div style={{ fontFamily: 'var(--font-syne, system-ui)', fontSize: 30, fontWeight: 900, lineHeight: 1, marginBottom: 4, color: '#f1f5f9' }}>
                  {value}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(241,245,249,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Training Scenarios */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontFamily: 'var(--font-syne, system-ui)', fontSize: 20, fontWeight: 800, margin: '0 0 20px', color: '#f1f5f9', letterSpacing: '-0.02em' }}>
            Training Scenarios
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {[SUBWAY_TOUR_SCENARIO, DEMO_SCENARIO].map((scenario) => (
              <div key={scenario.id} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(124,58,237,0.15)',
                borderRadius: 20, overflow: 'hidden',
                boxShadow: '0 0 40px rgba(124,58,237,0.06)',
              }}>
                {/* Thumbnail */}
                <div style={{ position: 'relative', height: 170, overflow: 'hidden' }}>
                  <img
                    src={scenario.thumbnail_url || 'https://images.unsplash.com/photo-1559163499-413811fb2344?w=600&q=80'}
                    alt={scenario.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(4,4,15,0.8), transparent)' }} />
                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.9), rgba(37,99,235,0.9))',
                    borderRadius: 6, padding: '3px 10px',
                    fontSize: 11, fontWeight: 800, color: 'white', letterSpacing: '0.04em',
                  }}>
                    360°
                  </div>
                  <div style={{
                    position: 'absolute', bottom: 12, left: 12,
                    display: 'flex', alignItems: 'center', gap: 5,
                    color: 'rgba(241,245,249,0.6)', fontSize: 12,
                  }}>
                    <Clock size={12} />
                    {scenario.duration_seconds < 60
                      ? `${scenario.duration_seconds}s`
                      : `${Math.floor(scenario.duration_seconds / 60)} min`} · 10 questions
                  </div>
                </div>
                {/* Content */}
                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontFamily: 'var(--font-syne, system-ui)', fontSize: 16, fontWeight: 800, margin: '0 0 8px', lineHeight: 1.3, color: '#f1f5f9', letterSpacing: '-0.01em' }}>
                    {scenario.title}
                  </h3>
                  <p style={{ fontSize: 13, color: 'rgba(241,245,249,0.4)', lineHeight: 1.6, margin: '0 0 20px' }}>
                    {scenario.description}
                  </p>
                  <Link href={`/train/${scenario.id}`} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '13px', borderRadius: 12,
                    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                    color: 'white', fontWeight: 700, fontSize: 14, textDecoration: 'none',
                    boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
                    letterSpacing: '-0.01em',
                  }}>
                    <Play size={14} fill="white" /> Start Training
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Training History */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-syne, system-ui)', fontSize: 20, fontWeight: 800, margin: '0 0 20px', color: '#f1f5f9', letterSpacing: '-0.02em' }}>
            Training History
          </h2>
          <ScoreCardServer sessions={sessions} />
        </div>
      </div>
    </div>
  );
}
