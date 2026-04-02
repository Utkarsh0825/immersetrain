'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Share2, RotateCcw, LayoutDashboard, Trophy, Target, Zap } from 'lucide-react';
import Link from 'next/link';
import { DEMO_SCENARIO } from '@/lib/scenarios';
import { QuizAnswer } from '@/types';

interface ResultData {
  score: number;
  maxScore: number;
  userName: string;
  scenarioTitle: string;
  answers: QuizAnswer[];
  passed: boolean;
  percentage: number;
}

function AnimatedNumber({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const steps = 50;
    const increment = target / steps;
    const delay = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setVal(target);
        clearInterval(timer);
      } else {
        setVal(Math.round(current));
      }
    }, delay);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <>{val}</>;
}

function getLetterGrade(pct: number) {
  if (pct >= 90) return { grade: 'A', color: '#22c55e' };
  if (pct >= 80) return { grade: 'B', color: '#86efac' };
  if (pct >= 70) return { grade: 'C', color: '#fbbf24' };
  if (pct >= 60) return { grade: 'D', color: '#fb923c' };
  return { grade: 'F', color: '#ef4444' };
}

export default function ResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useCurrentUser();
  const [result, setResult] = useState<ResultData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const storedAnswers: QuizAnswer[] =
      typeof window !== 'undefined'
        ? (JSON.parse(localStorage.getItem('lastQuizAnswers') || '[]') as QuizAnswer[])
        : [];

    const storedScore = typeof window !== 'undefined'
      ? parseInt(localStorage.getItem('lastQuizScore') || '0', 10)
      : 0;

    const maxScore = DEMO_SCENARIO.questions.length * 10;
    const score = storedAnswers.length > 0
      ? storedAnswers.reduce((s, a) => s + a.pointsEarned, 0)
      : storedScore;
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    const id = requestAnimationFrame(() => {
      setResult({
        score,
        maxScore,
        userName: user?.fullName ?? user?.firstName ?? 'Trainee',
        scenarioTitle: localStorage.getItem('lastScenarioTitle') || DEMO_SCENARIO.title,
        answers: storedAnswers,
        passed: percentage >= 70,
        percentage,
      });
    });
    return () => cancelAnimationFrame(id);
  }, [user, sessionId]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  if (!result) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid rgba(0,102,255,0.2)', borderTopColor: '#0066FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const { grade, color: gradeColor } = getLetterGrade(result.percentage);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'white', padding: '48px 16px 80px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 40 }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 80, height: 80, borderRadius: 24, marginBottom: 24,
              background: result.passed ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              border: `2px solid ${result.passed ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)'}`,
            }}
          >
            {result.passed
              ? <Trophy size={36} color="#22c55e" />
              : <Target size={36} color="#ef4444" />}
          </motion.div>
          <h1 style={{
            fontFamily: 'var(--font-syne, system-ui)', fontSize: 'clamp(26px, 4vw, 38px)',
            fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 10px',
          }}>
            {result.passed ? '🎉 Training Passed!' : 'Training Complete'}
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            {result.userName} &nbsp;·&nbsp; {result.scenarioTitle}
          </p>
        </motion.div>

        {/* Score Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${result.passed ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)'}`,
            borderRadius: 24, padding: '40px 32px', textAlign: 'center',
            marginBottom: 20, position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
            width: 320, height: 320,
            background: result.passed
              ? 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 65%)'
              : 'radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 65%)',
            borderRadius: '50%',
          }} />
          <div style={{ position: 'relative' }}>
            <div style={{
              fontFamily: 'var(--font-syne, system-ui)',
              fontSize: 'clamp(80px, 15vw, 120px)', fontWeight: 900,
              letterSpacing: '-0.05em', lineHeight: 1,
              color: result.passed ? '#22c55e' : '#ef4444',
            }}>
              <AnimatedNumber target={result.score} />
            </div>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.3)', margin: '8px 0 28px' }}>
              out of {result.maxScore} points
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{
                padding: '10px 22px', borderRadius: 100,
                background: result.passed ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${result.passed ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                fontSize: 15, fontWeight: 800, color: gradeColor,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 22, lineHeight: 1 }}>{grade}</span>
                <span>{result.percentage}%</span>
              </div>
              <div style={{
                padding: '10px 20px', borderRadius: 100,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: 14, fontWeight: 600,
                color: result.passed ? '#22c55e' : '#ef4444',
              }}>
                {result.passed ? '✓ PASSED' : '✗ NOT PASSED'} · 70% to pass
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}
        >
          {[
            { label: 'Correct', value: result.answers.filter(a => a.isCorrect).length || Math.round(result.percentage / 10), icon: <CheckCircle2 size={16} color="#22c55e" /> },
            { label: 'Points', value: result.score, icon: <Zap size={16} color="#0066FF" /> },
            { label: 'Questions', value: DEMO_SCENARIO.questions.length, icon: <Target size={16} color="rgba(255,255,255,0.5)" /> },
          ].map(({ label, value, icon }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16, padding: '18px 16px', textAlign: 'center',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>{icon}</div>
              <div style={{ fontFamily: 'var(--font-syne, system-ui)', fontSize: 26, fontWeight: 800, lineHeight: 1 }}>
                {value}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Question Review */}
        {result.answers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 20, overflow: 'hidden', marginBottom: 20,
            }}
          >
            <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-syne, system-ui)', fontSize: 16, fontWeight: 700 }}>
                Question Review
              </h3>
            </div>
            {result.answers.map((answer, i) => {
              const question = DEMO_SCENARIO.questions.find(q => q.id === answer.questionId);
              return (
                <div key={i} style={{
                  padding: '16px 24px', display: 'flex', gap: 14, alignItems: 'flex-start',
                  borderBottom: i < result.answers.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}>
                  <div style={{ marginTop: 2, flexShrink: 0 }}>
                    {answer.isCorrect
                      ? <CheckCircle2 size={18} color="#22c55e" />
                      : <XCircle size={18} color="#ef4444" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 6px', fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.45 }}>
                      {question?.question_text ?? `Question ${i + 1}`}
                    </p>
                    <span style={{
                      fontSize: 12, fontWeight: 700,
                      color: answer.isCorrect ? '#22c55e' : '#ef4444',
                    }}>
                      {answer.isCorrect ? `+${answer.pointsEarned} pts` : '0 pts'}
                    </span>
                    {!answer.isCorrect && question?.explanation && (
                      <p style={{ margin: '6px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
                        {question.explanation}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* No answers yet (fresh visit) */}
        {result.answers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{
              background: 'rgba(0,102,255,0.05)', border: '1px solid rgba(0,102,255,0.15)',
              borderRadius: 16, padding: '24px', textAlign: 'center', marginBottom: 20,
            }}
          >
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: 0 }}>
              Complete the training to see your question-by-question review here.
              Your answers and score are automatically saved.
            </p>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
        >
          <Link href="/train/demo-scenario-001" style={{
            flex: '1 1 140px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '14px', borderRadius: 12,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'white', fontWeight: 600, fontSize: 14, textDecoration: 'none', transition: 'background 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          >
            <RotateCcw size={15} /> Retake Training
          </Link>
          <Link href="/dashboard" style={{
            flex: '1 1 140px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '14px', borderRadius: 12,
            background: 'linear-gradient(135deg, #0066FF, #0044CC)',
            color: 'white', fontWeight: 700, fontSize: 14, textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(0,102,255,0.3)', transition: 'opacity 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <LayoutDashboard size={15} /> Dashboard
          </Link>
          <button onClick={handleShare} style={{
            padding: '14px 20px', borderRadius: 12, cursor: 'pointer',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            color: copied ? '#22c55e' : 'rgba(255,255,255,0.55)',
            fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
            transition: 'all 0.2s',
          }}>
            <Share2 size={15} /> {copied ? 'Copied!' : 'Share'}
          </button>
        </motion.div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
