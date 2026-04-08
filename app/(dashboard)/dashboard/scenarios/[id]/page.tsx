'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useThemeStyles } from '@/hooks/useThemeStyles';

function pctColor(p: number) {
  if (p >= 80) return 'var(--color-success)';
  if (p >= 60) return 'var(--color-warning)';
  return 'var(--color-error)';
}

function downloadCsv(filename: string, rows: Record<string, any>[]) {
  const headers = Object.keys(rows[0] ?? { a: '' });
  const esc = (v: any) => `"${String(v ?? '').replaceAll('"', '""')}"`;
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join('\\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ScenarioAnalyticsPage() {
  const t = useThemeStyles();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/scenarios/${encodeURIComponent(id)}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? 'Failed to load');
        setData(json);
      } catch (e: any) {
        toast.error(e?.message ?? 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [id]);

  const stats = data?.stats ?? {};
  const questions = data?.questions ?? [];
  const sessions = stats?.recentSessions ?? [];

  const questionTable = useMemo(() => {
    // We only have sessions in stats currently; in a real build we'd compute per-question from answers.
    return questions.map((q: any, idx: number) => ({
      idx: idx + 1,
      text: q.question_text ?? '',
      correctPct: 0,
      attempts: stats?.totalSessions ?? 0,
    }));
  }, [questions, stats?.totalSessions]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div>
          <div style={{ color: t.textMuted, fontFamily: 'var(--font-satoshi)', fontWeight: 800, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Scenario Analytics
          </div>
          <h1 style={{ fontFamily: 'var(--font-clash)', fontWeight: 900, letterSpacing: '-0.03em', fontSize: 'clamp(26px, 3.4vw, 36px)', margin: '6px 0 0', color: t.text }}>
            {data?.title ?? 'Loading…'}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href={`/dashboard/create?scenarioId=${encodeURIComponent(id)}`} className="btn-primary" style={{ textDecoration: 'none' }}>
            Edit Scenario
          </Link>
          <Link href="/dashboard/scenarios" style={{ color: t.textSecondary, textDecoration: 'none', fontWeight: 800, fontFamily: 'var(--font-satoshi)', fontSize: 13 }}>
            ← Back
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="card-dark" style={{ padding: 18 }}>Loading…</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 12, marginBottom: 14 }}>
            <Stat label="Total Attempts" value={stats?.totalSessions ?? 0} />
            <Stat label="Completions" value={(stats?.recentSessions ?? []).filter((s: any) => s.completed).length} />
            <Stat label="Avg Score" value={`${stats?.avgScore ?? 0}%`} />
            <Stat label="Pass Rate" value={`${stats?.passRate ?? 0}%`} />
            <Stat label="Avg Time" value="—" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <div className="card-dark" style={{ padding: 16 }}>
              <div style={{ fontFamily: 'var(--font-clash)', fontWeight: 800, color: t.text, marginBottom: 12 }}>
                Performance by question
              </div>
              <div style={{ overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-satoshi)' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: t.textMuted, fontSize: 12 }}>
                      <th style={{ padding: '10px 8px' }}>#</th>
                      <th style={{ padding: '10px 8px' }}>Question</th>
                      <th style={{ padding: '10px 8px' }}>Correct %</th>
                      <th style={{ padding: '10px 8px' }}>Attempts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questionTable.map((r: any) => (
                      <tr key={r.idx} style={{ borderTop: `1px solid ${t.border}`, color: t.text, fontSize: 13 }}>
                        <td style={{ padding: '10px 8px', width: 40 }}>{r.idx}</td>
                        <td style={{ padding: '10px 8px', maxWidth: 420 }}>
                          <span style={{ display: 'inline-block', maxWidth: 520, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {r.text}
                          </span>
                        </td>
                        <td style={{ padding: '10px 8px', width: 120, color: pctColor(r.correctPct) }}>
                          {r.correctPct}%
                        </td>
                        <td style={{ padding: '10px 8px', width: 90 }}>{r.attempts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card-dark" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
                <div style={{ fontFamily: 'var(--font-clash)', fontWeight: 800, color: t.text }}>
                  Recent sessions
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    downloadCsv(`scenario-${id}-sessions.csv`, (sessions ?? []).map((s: any) => ({
                      trainee: s.user_email ?? '',
                      score: `${s.score ?? 0}/${s.max_score ?? 100}`,
                      passed: (s.score ?? 0) >= 0.7 * (s.max_score ?? 100) ? 'yes' : 'no',
                      date: s.started_at ?? '',
                    })));
                  }}
                >
                  Export CSV
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(sessions ?? []).length === 0 ? (
                  <div style={{ color: t.textMuted, fontFamily: 'var(--font-satoshi)' }}>No sessions yet.</div>
                ) : (
                  (sessions ?? []).map((s: any) => (
                    <div key={s.id} style={{ border: `1px solid ${t.border}`, borderRadius: 12, padding: 12, background: 'rgba(255,255,255,0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ color: t.text, fontWeight: 800, fontFamily: 'var(--font-satoshi)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {s.user_email ?? 'anonymous'}
                          </div>
                          <div style={{ color: t.textMuted, fontSize: 12, marginTop: 4 }}>
                            {new Date(s.started_at ?? Date.now()).toLocaleString()}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: t.text, fontWeight: 900, fontFamily: 'var(--font-satoshi)', fontSize: 13 }}>
                            {s.score ?? 0}/{s.max_score ?? 100}
                          </div>
                          <div style={{ color: (s.score ?? 0) >= 0.7 * (s.max_score ?? 100) ? 'var(--color-success)' : 'var(--color-warning)', fontSize: 12, fontWeight: 900 }}>
                            {(s.score ?? 0) >= 0.7 * (s.max_score ?? 100) ? '✓ passed' : '• retry'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <style>{`
            @media (max-width: 1024px) {
              div[style*="repeat(5, minmax(0, 1fr))"] { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
              div[style*="grid-template-columns: 2fr 1fr"] { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  const t = useThemeStyles();
  return (
    <div className="card-dark" style={{ padding: 14 }}>
      <div style={{ color: t.textMuted, fontSize: 12, fontWeight: 800, fontFamily: 'var(--font-satoshi)' }}>{label}</div>
      <div style={{ marginTop: 6, fontFamily: 'var(--font-clash)', fontWeight: 900, fontSize: 20, color: t.text }}>{value}</div>
    </div>
  );
}

