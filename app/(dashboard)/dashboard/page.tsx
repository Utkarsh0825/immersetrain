'use client';

import { motion, type Variants } from 'framer-motion';
import Link from 'next/link';
import {
  PlayCircle,
  CheckCircle2,
  Trophy,
  Users,
  ArrowRight,
  Plus,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

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

const STATS = [
  {
    label: 'Total Sessions',
    value: '24',
    icon: PlayCircle,
    color: '#5B4CFF',
    bg: 'rgba(91,76,255,0.1)',
    border: 'rgba(91,76,255,0.2)',
    change: '+3 this week',
  },
  {
    label: 'Completion Rate',
    value: '87%',
    icon: CheckCircle2,
    color: '#00D4FF',
    bg: 'rgba(0,212,255,0.1)',
    border: 'rgba(0,212,255,0.2)',
    change: '+5% vs last month',
  },
  {
    label: 'Avg. Score',
    value: '92',
    icon: Trophy,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.2)',
    change: 'Top 10% of learners',
  },
  {
    label: 'Active Learners',
    value: '156',
    icon: Users,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.2)',
    change: '+12 this month',
  },
];

const responsiveCSS = `
  @media (max-width: 768px) {
    .dash-stats-grid { grid-template-columns: 1fr 1fr !important; }
    .dash-scenarios-grid { grid-template-columns: 1fr !important; }
    .dash-content { padding: 24px 16px !important; }
    .dash-header { padding-top: 64px !important; }
  }
  @media (max-width: 480px) {
    .dash-stats-grid { grid-template-columns: 1fr !important; }
  }
`;

export default function DashboardPage() {
  const t = useThemeStyles();
  const glass: React.CSSProperties = {
    background: t.surface,
    backdropFilter: 'blur(20px)',
    border: '1px solid ' + t.border,
  };
  return (
    <div className="dash-content" style={{ padding: '40px 36px', maxWidth: 1100 }}>
      <style>{responsiveCSS}</style>

      {/* Ambient glow */}
      <div
        style={{
          position: 'fixed',
          top: -200,
          right: -100,
          width: 600,
          height: 600,
          pointerEvents: 'none',
          zIndex: 0,
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
        {/* Welcome header */}
        <motion.div variants={itemVariants} className="dash-header" style={{ marginBottom: 40 }}>
          <h1
            style={{
              fontFamily: 'var(--font-clash)',
              fontSize: 'clamp(28px, 3.5vw, 38px)',
              fontWeight: 700,
              margin: '0 0 8px',
              letterSpacing: '-0.03em',
              color: t.text,
              lineHeight: 1.2,
            }}
          >
            Welcome back
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-satoshi)',
              fontSize: 16,
              margin: 0,
              lineHeight: 1.6,
              background: `linear-gradient(90deg, ${t.textSecondary}, rgba(91,76,255,0.6))`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Your immersive training command center
          </p>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          variants={itemVariants}
          className="dash-stats-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
            marginBottom: 48,
          }}
        >
          {STATS.map(({ label, value, icon: Icon, color, bg, border, change }) => (
            <motion.div
              key={label}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              style={{
                ...glass,
                borderRadius: 16,
                padding: '24px',
                cursor: 'default',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 11,
                  background: bg,
                  border: `1px solid ${border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <Icon size={18} style={{ color }} />
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
                  marginBottom: 8,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'rgba(91,76,255,0.7)',
                  fontFamily: 'var(--font-satoshi)',
                }}
              >
                {change}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Your Scenarios */}
        <motion.div variants={itemVariants} style={{ marginBottom: 48 }}>
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
              Your Scenarios
            </h2>
            <Link
              href="/create"
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

          <div
            className="dash-scenarios-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
            }}
          >
            {/* Scenario card */}
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              style={{
                ...glass,
                borderRadius: 18,
                overflow: 'hidden',
                cursor: 'default',
              }}
            >
              {/* Thumbnail */}
              <div
                style={{
                  height: 160,
                  position: 'relative',
                  background:
                    'linear-gradient(135deg, rgba(91,76,255,0.15) 0%, rgba(0,212,255,0.08) 100%)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: t.isDark
                      ? 'linear-gradient(to top, rgba(6,6,8,0.92) 0%, transparent 62%)'
                      : 'linear-gradient(to top, rgba(255,255,255,0.88) 0%, transparent 62%)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'rgba(91,76,255,0.2)',
                    border: '1px solid rgba(91,76,255,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PlayCircle size={24} style={{ color: '#5B4CFF' }} />
                </div>
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    padding: '3px 10px',
                    borderRadius: 6,
                    background:
                      'linear-gradient(135deg, rgba(91,76,255,0.9), rgba(0,212,255,0.9))',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'white',
                    letterSpacing: '0.04em',
                  }}
                >
                  360°
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '20px 22px' }}>
                <h3
                  style={{
                    fontFamily: 'var(--font-clash)',
                    fontSize: 17,
                    fontWeight: 600,
                    color: t.text,
                    margin: '0 0 8px',
                    lineHeight: 1.3,
                  }}
                >
                  Workplace Safety Training
                </h3>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 18,
                    fontFamily: 'var(--font-satoshi)',
                    fontSize: 13,
                    color: t.textMuted,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Sparkles size={12} /> 10 questions
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> 30 sec video
                  </span>
                </div>
                <Link
                  href="/train/subway-tour-001"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '12px',
                    borderRadius: 10,
                    background: '#5B4CFF',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: 14,
                    textDecoration: 'none',
                    fontFamily: 'var(--font-satoshi)',
                    boxShadow: '0 0 30px rgba(91,76,255,0.25)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                >
                  Try it <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>

            {/* Create new card */}
            <Link href="/create" style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{
                  borderColor: 'rgba(91,76,255,0.4)',
                  transition: { duration: 0.2 },
                }}
                style={{
                  height: '100%',
                  borderRadius: 18,
                  border: '2px dashed ' + t.border,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 16,
                  cursor: 'pointer',
                  padding: 32,
                  minHeight: 300,
                  transition: 'border-color 0.3s',
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: 'rgba(91,76,255,0.08)',
                    border: '1px solid rgba(91,76,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Plus size={24} style={{ color: '#5B4CFF' }} />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-clash)',
                      fontSize: 16,
                      fontWeight: 600,
                      color: t.text,
                      textAlign: 'center',
                      marginBottom: 4,
                    }}
                  >
                    Create New Scenario
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-satoshi)',
                      fontSize: 13,
                      color: t.textMuted,
                      textAlign: 'center',
                    }}
                  >
                    Upload 360° video and add questions
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <h2
            style={{
              fontFamily: 'var(--font-clash)',
              fontSize: 22,
              fontWeight: 600,
              color: t.text,
              margin: '0 0 20px',
              letterSpacing: '-0.02em',
            }}
          >
            Recent Activity
          </h2>
          <motion.div
            initial={{ opacity: 0.8 }}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              ...glass,
              borderRadius: 16,
              padding: '48px 24px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: 'rgba(91,76,255,0.08)',
                border: '1px solid rgba(91,76,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <BarChart size={22} style={{ color: 'rgba(91,76,255,0.5)' }} />
            </div>
            <p
              style={{
                fontFamily: 'var(--font-satoshi)',
                fontSize: 15,
                color: t.textSecondary,
                margin: '0 0 6px',
                fontWeight: 500,
              }}
            >
              No activity yet.
            </p>
            <p
              style={{
                fontFamily: 'var(--font-satoshi)',
                fontSize: 13,
                color: t.textMuted,
                margin: 0,
              }}
            >
              Complete a training scenario to see your results here.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function BarChart({ size, style }: { size: number; style?: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <rect x="3" y="12" width="4" height="9" rx="1" />
      <rect x="10" y="8" width="4" height="13" rx="1" />
      <rect x="17" y="4" width="4" height="17" rx="1" />
    </svg>
  );
}
