'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function ScenariosPage() {
  const t = useThemeStyles();
  const { user } = useCurrentUser();
  const createdBy = (user as any)?.userId ?? (user as any)?.id ?? 'demo-user-001';
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState('local-org-demo');
  const [scenarios, setScenarios] = useState<any[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        const pr = await fetch(`/api/profile?userId=${encodeURIComponent(createdBy)}`).then((r) => r.json());
        const oid = pr?.org?.id ?? orgId;
        setOrgId(oid);
        const ov = await fetch(`/api/dashboard/overview?orgId=${encodeURIComponent(oid)}`).then((r) => r.json());
        setScenarios(ov?.scenarios ?? []);
      } catch (e: any) {
        toast.error(e?.message ?? 'Failed to load scenarios');
      } finally {
        setLoading(false);
      }
    };
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <div style={{ color: t.textMuted, fontFamily: 'var(--font-satoshi)', fontWeight: 800, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Creator
          </div>
          <h1 style={{ fontFamily: 'var(--font-clash)', fontWeight: 900, letterSpacing: '-0.03em', fontSize: 'clamp(26px, 3.4vw, 36px)', margin: '6px 0 0', color: t.text }}>
            Scenarios
          </h1>
          <p style={{ margin: '10px 0 0', color: t.textSecondary, fontFamily: 'var(--font-satoshi)' }}>
            Manage, share, and track your training scenarios.
          </p>
        </div>
        <Link href="/dashboard/create" className="btn-primary" style={{ textDecoration: 'none' }}>
          New Scenario →
        </Link>
      </div>

      {loading ? (
        <div className="card-dark" style={{ padding: 18 }}>Loading…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
          {scenarios.map((s) => (
            <div key={s.id} className="card-dark" style={{ overflow: 'hidden' }}>
              <div style={{ aspectRatio: '16 / 9', background: 'linear-gradient(135deg, rgba(91,76,255,0.14), rgba(0,212,255,0.06))' }} />
              <div style={{ padding: 16 }}>
                <div style={{ fontFamily: 'var(--font-clash)', fontWeight: 800, fontSize: 16, color: t.text, marginBottom: 6 }}>{s.title}</div>
                <div style={{ color: t.textMuted, fontFamily: 'var(--font-satoshi)', fontSize: 13, marginBottom: 12 }}>
                  {Math.max(0, s.view_count ?? 0)} views
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Link href={`/dashboard/create?scenarioId=${encodeURIComponent(s.id)}`} style={{ textDecoration: 'none', color: 'white', background: 'rgba(91,76,255,0.92)', borderRadius: 999, padding: '8px 12px', fontWeight: 800, fontSize: 12, fontFamily: 'var(--font-satoshi)' }}>Edit</Link>
                  <Link href={`/dashboard/scenarios/${encodeURIComponent(s.id)}`} style={{ textDecoration: 'none', color: t.text, border: `1px solid ${t.border}`, borderRadius: 999, padding: '8px 12px', fontWeight: 800, fontSize: 12, fontFamily: 'var(--font-satoshi)' }}>Analytics</Link>
                  <Link href={`/train/${encodeURIComponent(s.id)}`} style={{ textDecoration: 'none', color: t.text, border: `1px solid ${t.border}`, borderRadius: 999, padding: '8px 12px', fontWeight: 800, fontSize: 12, fontFamily: 'var(--font-satoshi)' }}>Open</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) { div[style*="repeat(3, minmax(0, 1fr))"] { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; } }
        @media (max-width: 640px) { div[style*="repeat(3, minmax(0, 1fr))"] { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
