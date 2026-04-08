'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight, Plus, Video, Users, Percent, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

function useCountUp(target: number, ms = 650) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      setV(Math.round(target * (0.15 + 0.85 * t)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

export default function DashboardPage() {
  const t = useThemeStyles();
  const { user } = useCurrentUser();
  const firstName = user?.firstName ?? 'Demo';

  const [orgId, setOrgId] = useState<string>('local-org-demo');
  const [orgName, setOrgName] = useState('Demo Organization');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<{
    scenarios: any[];
    totalTrainees: number;
    overallPassRate: number;
    sessionsThisWeek: number;
  }>({ scenarios: [], totalTrainees: 0, overallPassRate: 0, sessionsThisWeek: 0 });

  useEffect(() => {
    const userId = (user as any)?.userId ?? (user as any)?.id ?? 'demo-user-001';
    const run = async () => {
      try {
        const pr = await fetch(`/api/profile?userId=${encodeURIComponent(userId)}`).then((r) => r.json());
        if (pr?.org?.id) {
          setOrgId(pr.org.id);
          setOrgName(pr.org.name ?? orgName);
        }
        const ov = await fetch(`/api/dashboard/overview?orgId=${encodeURIComponent(pr?.org?.id ?? orgId)}`).then((r) =>
          r.json()
        );
        if (ov?.error) throw new Error(ov.error);
        setOverview({
          scenarios: ov.scenarios ?? [],
          totalTrainees: ov.totalTrainees ?? 0,
          overallPassRate: ov.overallPassRate ?? 0,
          sessionsThisWeek: ov.sessionsThisWeek ?? 0,
        });
      } catch (e: any) {
        toast.error(e?.message ?? 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalScenarios = overview.scenarios.length;
  const totalScenariosAnim = useCountUp(totalScenarios);
  const totalTraineesAnim = useCountUp(overview.totalTrainees);
  const avgScoreAnim = useCountUp(Math.max(0, Math.min(100, 0))); // filled on analytics route later
  const passRateAnim = useCountUp(overview.overallPassRate);

  const stats = useMemo(
    () => [
      { label: 'Total Scenarios', value: totalScenariosAnim, icon: Video, tint: 'rgba(91,76,255,0.12)', stroke: 'rgba(91,76,255,0.22)' },
      { label: 'Total Trainees', value: totalTraineesAnim, icon: Users, tint: 'rgba(0,212,255,0.10)', stroke: 'rgba(0,212,255,0.22)' },
      { label: 'Avg Score', value: `${avgScoreAnim}%`, icon: Trophy, tint: 'rgba(245,158,11,0.10)', stroke: 'rgba(245,158,11,0.22)' },
      { label: 'Pass Rate', value: `${passRateAnim}%`, icon: Percent, tint: 'rgba(34,197,94,0.10)', stroke: 'rgba(34,197,94,0.22)' },
    ],
    [totalScenariosAnim, totalTraineesAnim, avgScoreAnim, passRateAnim]
  );

  return (
    <div style={{ padding: '10px 0 40px' }}>
      <div
        style={{
          position: 'absolute',
          top: -120,
          right: -60,
          width: 520,
          height: 520,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse, rgba(91,76,255,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/* Top bar */}
        <motion.div variants={itemVariants} style={{ marginBottom: 22, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
          <h1
            style={{
              fontFamily: 'var(--font-clash)',
              fontSize: 'clamp(28px, 3.6vw, 40px)',
              fontWeight: 800,
              margin: 0,
              letterSpacing: '-0.03em',
              color: t.text,
              lineHeight: 1.2,
            }}
          >
            Good morning, {firstName} 👋
          </h1>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ padding: '7px 12px', borderRadius: 999, border: `1px solid ${t.border}`, background: t.surface, color: t.textSecondary, fontFamily: 'var(--font-satoshi)', fontWeight: 700, fontSize: 12 }}>
              {orgName}
            </span>
            <Link href="/dashboard/create" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              <Plus size={16} /> New Scenario
            </Link>
          </div>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          variants={itemVariants}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 14,
            marginBottom: 28,
          }}
        >
          {stats.map(({ label, value, icon: Icon, tint, stroke }) => (
            <motion.div
              key={label}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              style={{
                background: t.surface,
                backdropFilter: 'blur(20px)',
                border: '1px solid ' + t.border,
                borderRadius: 18,
                padding: '22px',
                cursor: 'default',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 11,
                  background: tint,
                  border: `1px solid ${stroke}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <Icon size={18} style={{ color: 'rgba(240,240,245,0.9)' }} />
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-clash)',
                  fontSize: 32,
                  fontWeight: 700,
                  lineHeight: 1,
                  color: t.text,
                  marginBottom: 4,
                  letterSpacing: '-0.02em',
                }}
              >
                {value}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: t.textMuted,
                  fontFamily: 'var(--font-satoshi)',
                  marginBottom: 0,
                }}
              >
                {label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Scenarios */}
        <motion.div variants={itemVariants} style={{ marginBottom: 18 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-clash)',
                fontSize: 22,
                fontWeight: 600,
                color: t.text,
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Scenarios
            </h2>
            <Link
              href="/dashboard/scenarios"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: '#5B4CFF',
                textDecoration: 'none',
                fontFamily: 'var(--font-satoshi)',
              }}
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: 24, borderRadius: 16, border: `1px solid ${t.border}`, background: t.surface }}>
              Loading…
            </div>
          ) : overview.scenarios.length === 0 ? (
            <div className="card-dark" style={{ padding: 28 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                  <rect x="6" y="18" width="60" height="36" rx="14" stroke="rgba(91,76,255,0.55)" strokeWidth="2" />
                  <circle cx="26" cy="36" r="6" stroke="rgba(0,212,255,0.65)" strokeWidth="2" />
                  <circle cx="46" cy="36" r="6" stroke="rgba(0,212,255,0.65)" strokeWidth="2" />
                  <path d="M58 10v10M53 15h10" stroke="rgba(91,76,255,0.9)" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-clash)', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>
                    Create your first scenario
                  </div>
                  <div style={{ color: t.textSecondary, lineHeight: 1.5, fontFamily: 'var(--font-satoshi)' }}>
                    Upload a 360° video, drop questions at the right moments, and publish a share link for your team.
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 18 }}>
                <Link href="/dashboard/create" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                  <Plus size={16} /> Start Creating
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
              {overview.scenarios.slice(0, 6).map((s) => (
                <ScenarioCard key={s.id} s={s} />
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
      <style>{`
        @media (max-width: 1024px) {
          .dash-stats { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
        @media (max-width: 640px) {
          .dash-stats { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function ScenarioCard({ s }: { s: any }) {
  const t = useThemeStyles();
  const status = (s.status ?? 'draft') as string;
  const statusUi =
    status === 'published'
      ? { label: 'Live', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.22)', dot: '#22c55e' }
      : status === 'archived'
        ? { label: 'Archived', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.22)', dot: '#f59e0b' }
        : { label: 'Draft', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', dot: 'rgba(255,255,255,0.45)' };

  return (
    <div className="card-dark" style={{ overflow: 'hidden' }}>
      <div style={{ aspectRatio: '16 / 9', background: 'linear-gradient(135deg, rgba(91,76,255,0.14), rgba(0,212,255,0.06))', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,6,8,0.84), transparent 70%)' }} />
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 999, background: statusUi.bg, border: `1px solid ${statusUi.border}`, color: 'rgba(240,240,245,0.88)', fontWeight: 800, fontSize: 12, fontFamily: 'var(--font-satoshi)' }}>
            <span aria-hidden style={{ width: 7, height: 7, borderRadius: 99, background: statusUi.dot }} />
            {statusUi.label}
          </span>
        </div>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ fontFamily: 'var(--font-clash)', fontWeight: 700, fontSize: 16, color: t.text, marginBottom: 6, lineHeight: 1.25 }}>
          {s.title ?? 'Untitled scenario'}
        </div>
        <div style={{ color: t.textMuted, fontFamily: 'var(--font-satoshi)', fontSize: 13, marginBottom: 14 }}>
          {(s.question_count ?? s.questions?.length ?? 0)} questions · {Math.max(1, Math.round((s.duration_seconds ?? 120) / 60))} min
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href={`/dashboard/create?scenarioId=${encodeURIComponent(s.id)}`} style={{ textDecoration: 'none', color: 'white', background: 'rgba(91,76,255,0.92)', borderRadius: 999, padding: '8px 12px', fontWeight: 800, fontSize: 12, fontFamily: 'var(--font-satoshi)' }}>Edit</Link>
          <Link href={`/train/${encodeURIComponent(s.id)}`} style={{ textDecoration: 'none', color: t.text, border: `1px solid ${t.border}`, borderRadius: 999, padding: '8px 12px', fontWeight: 800, fontSize: 12, fontFamily: 'var(--font-satoshi)' }}>View</Link>
          <Link href={`/dashboard/scenarios/${encodeURIComponent(s.id)}`} style={{ textDecoration: 'none', color: t.text, border: `1px solid ${t.border}`, borderRadius: 999, padding: '8px 12px', fontWeight: 800, fontSize: 12, fontFamily: 'var(--font-satoshi)' }}>Analytics</Link>
        </div>
      </div>
    </div>
  );
}
