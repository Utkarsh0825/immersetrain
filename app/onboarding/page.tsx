'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import ThemeToggleButton from '@/components/ThemeToggleButton';

const INDUSTRIES = [
  { key: 'Transit & Rail', label: 'Transit & Rail', icon: '🚇' },
  { key: 'Healthcare', label: 'Healthcare', icon: '🏥' },
  { key: 'Construction', label: 'Construction', icon: '🏗️' },
  { key: 'Utilities', label: 'Utilities', icon: '⚡' },
  { key: 'Manufacturing', label: 'Manufacturing', icon: '🏭' },
  { key: 'Emergency Services', label: 'Emergency Services', icon: '🚒' },
  { key: 'Aviation', label: 'Aviation', icon: '✈️' },
  { key: 'Field Services', label: 'Field Services', icon: '🔧' },
];

const SIZES = ['1–10', '11–50', '51–200', '200+'] as const;

function StepDots({ step }: { step: 1 | 2 | 3 }) {
  const dots = [1, 2, 3] as const;
  const t = useThemeStyles();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      {dots.map((d, i) => {
        const complete = d < step;
        const active = d === step;
        return (
          <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                background: complete || active ? 'var(--color-indigo)' : 'transparent',
                border: complete || active ? '1px solid rgba(91,76,255,0.5)' : `1px solid ${t.border}`,
                boxShadow: active ? '0 0 18px rgba(91,76,255,0.35)' : 'none',
                display: 'grid',
                placeItems: 'center',
              }}
              aria-label={`Step ${d}`}
            >
              {complete ? (
                <span style={{ color: t.isDark ? 'white' : '#0f0f14', fontSize: 10, lineHeight: 1 }}>✓</span>
              ) : null}
            </div>
            {i !== dots.length - 1 && (
              <div style={{ width: 44, height: 1, background: t.border }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OnboardingPage() {
  const t = useThemeStyles();
  const router = useRouter();
  const { user } = useCurrentUser();

  const emailPrefill = user?.primaryEmailAddress?.emailAddress ?? '';
  const userId = (user as any)?.userId ?? (user as any)?.id ?? 'demo-user-001';

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fullName, setFullName] = useState(user?.fullName ?? 'Demo User');
  const [workEmail] = useState(emailPrefill);
  const [orgName, setOrgName] = useState('');
  const [industry, setIndustry] = useState<string>('');
  const [sizeRange, setSizeRange] = useState<(typeof SIZES)[number] | ''>('');
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canNext = useMemo(() => {
    if (step === 1) return fullName.trim().length > 1;
    if (step === 2) return orgName.trim().length > 1 && Boolean(industry);
    return Boolean(sizeRange) && agree;
  }, [step, fullName, orgName, industry, sizeRange, agree]);

  const submit = async () => {
    if (!canNext || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          orgName,
          industry,
          sizeRange,
          userId,
          email: workEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Onboarding failed');

      toast.success('Workspace created');

      // brief “success” beat
      await new Promise((r) => setTimeout(r, 450));
      router.push('/dashboard/create');
    } catch (err: any) {
      toast.error(err?.message ?? 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: t.bg,
        display: 'grid',
        placeItems: 'center',
        padding: '28px 18px',
        color: t.text,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: -200,
          background:
            t.isDark
              ? 'radial-gradient(700px 500px at 50% 20%, rgba(91,76,255,0.28), transparent 65%), radial-gradient(800px 600px at 10% 80%, rgba(0,212,255,0.14), transparent 60%)'
              : 'radial-gradient(700px 500px at 50% 20%, rgba(91,76,255,0.14), transparent 65%), radial-gradient(800px 600px at 10% 80%, rgba(0,212,255,0.08), transparent 60%)',
          filter: 'blur(18px)',
        }}
      />

      <div
        className="card-dark"
        style={{
          width: '100%',
          maxWidth: 560,
          padding: 28,
          position: 'relative',
          zIndex: 1,
          background: t.isDark ? 'rgba(13,13,20,0.88)' : 'rgba(255,255,255,0.80)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${t.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-clash)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              textDecoration: 'none',
              color: t.text,
            }}
          >
            ImmerseTrain
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ThemeToggleButton />
            <Link href="/dashboard" style={{ color: t.textSecondary, textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>
              Dashboard
            </Link>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <StepDots step={step} />
        </div>

        <div style={{ textAlign: 'center', marginTop: 22, marginBottom: 22 }}>
          <h1 style={{ fontFamily: 'var(--font-clash)', fontSize: 30, margin: 0, letterSpacing: '-0.03em' }}>
            Welcome to ImmerseTrain
          </h1>
          <p style={{ margin: '10px 0 0', color: t.textSecondary, lineHeight: 1.5 }}>
            Let’s set up your workspace in 60 seconds.
          </p>
        </div>

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, color: t.textSecondary, fontWeight: 600 }}>
                Full name
              </label>
              <input className="input-dark" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, color: t.textSecondary, fontWeight: 600 }}>
                Work email
              </label>
              <input className="input-dark" value={workEmail} readOnly />
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, color: t.textSecondary, fontWeight: 600 }}>
                Organization name
              </label>
              <input className="input-dark" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 10, color: t.textSecondary, fontWeight: 600 }}>
                Industry
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {INDUSTRIES.map((it) => {
                  const selected = industry === it.key;
                  return (
                    <button
                      key={it.key}
                      type="button"
                      onClick={() => setIndustry(it.key)}
                      style={{
                        textAlign: 'left',
                        padding: '12px 12px',
                        borderRadius: 12,
                        border: selected ? '1px solid rgba(91,76,255,0.55)' : `1px solid ${t.border}`,
                        background: selected ? 'rgba(91,76,255,0.10)' : t.cardBg,
                        cursor: 'pointer',
                        display: 'flex',
                        gap: 10,
                        alignItems: 'center',
                        color: t.text,
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{it.icon}</span>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{it.label}</span>
                      {selected ? <span style={{ marginLeft: 'auto', color: 'var(--color-indigo)' }}>✓</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 10, color: t.textSecondary, fontWeight: 600 }}>
                How large is your team?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {SIZES.map((s) => {
                  const selected = sizeRange === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSizeRange(s)}
                      style={{
                        padding: 14,
                        borderRadius: 14,
                        border: selected ? '1px solid rgba(91,76,255,0.55)' : `1px solid ${t.border}`,
                        background: selected ? 'rgba(91,76,255,0.10)' : t.cardBg,
                        cursor: 'pointer',
                        textAlign: 'left',
                        color: t.text,
                      }}
                    >
                      <div style={{ fontFamily: 'var(--font-clash)', fontSize: 20, fontWeight: 700 }}>{s}</div>
                      <div style={{ color: t.textSecondary, fontSize: 12, fontWeight: 600 }}>people</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', color: t.textSecondary }}>
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span>
                I agree to the{' '}
                <Link href="/terms" style={{ color: 'var(--color-indigo)', textDecoration: 'none' }}>
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" style={{ color: 'var(--color-indigo)', textDecoration: 'none' }}>
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button
            type="button"
            onClick={() => setStep((s) => (s === 1 ? 1 : ((s - 1) as any)))}
            disabled={step === 1 || submitting}
            style={{
              flex: 1,
              padding: '12px 14px',
              borderRadius: 999,
              border: `1px solid ${t.border}`,
              background: t.surface,
              color: t.textSecondary,
              fontWeight: 700,
              cursor: step === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Back
          </button>

          {step < 3 ? (
            <button
              type="button"
              className="btn-primary"
              disabled={!canNext || submitting}
              onClick={() => setStep((s) => ((s + 1) as any))}
              style={{ flex: 1, opacity: !canNext || submitting ? 0.6 : 1 }}
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              disabled={!canNext || submitting}
              onClick={submit}
              style={{ flex: 1, opacity: !canNext || submitting ? 0.6 : 1 }}
            >
              {submitting ? 'Creating…' : 'Create My Workspace →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

