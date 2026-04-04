import { Users, TrendingUp, CheckCircle2, Calendar } from 'lucide-react';
import AdminTable from '@/components/dashboard/AdminTable';
import { isSupabaseConfigured } from '@/lib/supabaseConfigured';

export default async function AdminPage() {
  // Fetch all sessions
  let sessions: Array<{
    id: string; user_id: string; user_name: string; user_email: string; score: number; max_score: number;
    completed: boolean; started_at: string; scenario_id: string; scenario_title: string;
  }> = [];

  try {
    if (isSupabaseConfigured()) {
      const { createServiceClient } = await import('@/lib/supabase');
      const supabase = createServiceClient();
      const { data } = await supabase
        .from('sessions')
        .select('*, scenarios(title)')
        .order('started_at', { ascending: false });

      sessions = (data ?? []).map((s: Record<string, unknown>) => ({
        ...s,
        scenario_title: (s.scenarios as { title: string } | null)?.title ?? 'Handling a Difficult Customer',
      })) as typeof sessions;
    }
  } catch {}

  // Compute stats
  const uniqueTrainees = new Set(sessions.map(s => s.user_id)).size;
  const completed = sessions.filter(s => s.completed);
  const passed = completed.filter(s => s.max_score > 0 && (s.score / s.max_score) >= 0.7);
  const avgScore = completed.length > 0
    ? Math.round(completed.reduce((sum, s) => sum + (s.max_score > 0 ? (s.score / s.max_score) * 100 : 0), 0) / completed.length)
    : 0;
  const passRate = completed.length > 0 ? Math.round((passed.length / completed.length) * 100) : 0;

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thisWeek = sessions.filter(s => new Date(s.started_at) > oneWeekAgo).length;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{
            padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
            background: 'rgba(0,102,255,0.12)', border: '1px solid rgba(0,102,255,0.25)',
            color: '#0066FF', letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            Admin
          </div>
        </div>
        <h1 style={{
          fontFamily: 'var(--font-syne, system-ui)', fontSize: 'clamp(24px, 3vw, 36px)',
          fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.02em',
        }}>
          Training Dashboard
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, margin: 0 }}>
          Monitor all trainee progress and performance across your organization.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 40 }}>
        {[
          { label: 'Total Trainees', value: uniqueTrainees || sessions.length, icon: <Users size={18} color="#0066FF" />, color: '#0066FF' },
          { label: 'Average Score', value: `${avgScore}%`, icon: <TrendingUp size={18} color="#fbbf24" />, color: '#fbbf24' },
          { label: 'Pass Rate', value: `${passRate}%`, icon: <CheckCircle2 size={18} color="#22c55e" />, color: '#22c55e' },
          { label: 'This Week', value: thisWeek, icon: <Calendar size={18} color="#a78bfa" />, color: '#a78bfa' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 16, padding: '22px 20px',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 11, marginBottom: 16,
              background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {icon}
            </div>
            <div style={{ fontFamily: 'var(--font-syne, system-ui)', fontSize: 30, fontWeight: 900, lineHeight: 1, marginBottom: 5 }}>
              {value}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-syne, system-ui)', fontSize: 20, fontWeight: 700, margin: 0 }}>
            All Training Sessions
          </h2>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
            {sessions.length} total
          </span>
        </div>

        {sessions.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 20, padding: '60px 24px', textAlign: 'center',
          }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(91,76,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="12" width="4" height="9" rx="1" /><rect x="10" y="8" width="4" height="13" rx="1" /><rect x="17" y="4" width="4" height="17" rx="1" /></svg>
            </div>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', margin: '0 0 8px' }}>
              No training sessions yet.
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', margin: 0 }}>
              Sessions will appear here once trainees complete the training.
            </p>
          </div>
        ) : (
          <AdminTable sessions={sessions} />
        )}
      </div>
    </div>
  );
}
