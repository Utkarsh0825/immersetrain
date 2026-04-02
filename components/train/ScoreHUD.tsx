'use client';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface ScoreHUDProps {
  score: number;
  maxScore: number;
}

export default function ScoreHUD({ score, maxScore }: ScoreHUDProps) {
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  return (
    <motion.div
      key={score}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.15, 1] }}
      transition={{ duration: 0.35, type: 'spring' }}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'rgba(0,102,255,0.12)',
        border: '1px solid rgba(0,102,255,0.25)',
        borderRadius: 10, padding: '5px 12px',
      }}
    >
      <Zap size={13} color="#0066FF" fill="#0066FF" />
      <span style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>
        {score}
      </span>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
        / {maxScore}
      </span>
      <div style={{
        width: 1, height: 14,
        background: 'rgba(255,255,255,0.1)',
        margin: '0 2px',
      }} />
      <span style={{ fontSize: 12, fontWeight: 700, color: '#0066FF' }}>
        {pct}%
      </span>
    </motion.div>
  );
}
