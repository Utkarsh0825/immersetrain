'use client';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface ScoreCardProps {
  sessionId: string;
  scenarioTitle: string;
  score: number;
  maxScore: number;
  completed: boolean;
  startedAt: string;
  index?: number;
}

export default function ScoreCard({
  sessionId,
  scenarioTitle,
  score,
  maxScore,
  completed,
  startedAt,
  index = 0,
}: ScoreCardProps) {
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const passed = percentage >= 70;
  const date = new Date(startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16, padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 16,
        transition: 'background 0.2s, border-color 0.2s',
      }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Status icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: passed ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
        border: `1px solid ${passed ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {passed
          ? <CheckCircle2 size={20} color="#22c55e" />
          : <XCircle size={20} color="#ef4444" />}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {scenarioTitle}
        </p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={11} /> {date}
          </span>
          <span style={{
            fontSize: 12, fontWeight: 700,
            color: passed ? '#22c55e' : '#ef4444',
            padding: '2px 8px', borderRadius: 100,
            background: passed ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          }}>
            {passed ? 'Passed' : 'Not Passed'}
          </span>
        </div>
      </div>

      {/* Score */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-syne, system-ui)', fontSize: 22, fontWeight: 800, color: passed ? '#22c55e' : '#ef4444', lineHeight: 1 }}>
          {percentage}%
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
          {score}/{maxScore} pts
        </div>
      </div>

      {completed && (
        <Link href={`/results/${sessionId}`} style={{
          color: 'rgba(255,255,255,0.3)', textDecoration: 'none', flexShrink: 0,
          transition: 'color 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = 'white')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
        >
          <ChevronRight size={18} />
        </Link>
      )}
    </motion.div>
  );
}
