'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingDown, TrendingUp, DollarSign, CheckCircle2 } from 'lucide-react';

const STATS = [
  { value: '10%', label: 'Retention with traditional slide-based training', icon: TrendingDown, color: '#ef4444', bad: true },
  { value: '75%', label: 'Retention boost with immersive VR scenarios', icon: TrendingUp, color: '#10b981', bad: false },
  { value: '$17k', label: 'Average annual cost of enterprise VR platforms', icon: DollarSign, color: '#f59e0b', bad: true },
  { value: '$1k', label: 'ImmerseTrain for 10 users — 94% cheaper', icon: CheckCircle2, color: '#7c3aed', bad: false },
];

function Counter({ target, suffix = '' }: { target: string; suffix?: string }) {
  return <span>{target}</span>;
}

export default function StatsSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} id="platform" style={{ padding: '120px 24px', background: '#04040f', position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 800, height: 400, background: 'radial-gradient(ellipse, rgba(124,58,237,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          style={{ textAlign: 'center', marginBottom: 80 }}
        >
          <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7c3aed', fontWeight: 700, marginBottom: 14 }}>The Problem</p>
          <h2 style={{
            fontFamily: 'var(--font-syne, system-ui)', fontSize: 'clamp(32px, 5vw, 60px)',
            fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, color: '#f1f5f9',
          }}>
            Old training methods<br />
            <span style={{ color: 'rgba(241,245,249,0.3)' }}>are broken.</span>
          </h2>
        </motion.div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                style={{
                  padding: '32px 28px', borderRadius: 20,
                  background: `rgba(${stat.bad ? '239,68,68' : '16,185,129'},0.04)`,
                  border: `1px solid rgba(${stat.bad ? '239,68,68' : '16,185,129'},0.12)`,
                  position: 'relative', overflow: 'hidden',
                }}
              >
                <div style={{
                  position: 'absolute', top: -20, right: -20, width: 80, height: 80,
                  background: `radial-gradient(circle, rgba(${stat.bad ? '239,68,68' : '16,185,129'},0.1) 0%, transparent 70%)`,
                  borderRadius: '50%',
                }} />
                <Icon size={20} color={stat.color} style={{ marginBottom: 20 }} />
                <div style={{
                  fontFamily: 'var(--font-syne, system-ui)',
                  fontSize: 56, fontWeight: 900, lineHeight: 1,
                  color: stat.color, marginBottom: 12, letterSpacing: '-0.04em',
                }}>
                  {stat.value}
                </div>
                <p style={{ fontSize: 15, color: 'rgba(241,245,249,0.5)', lineHeight: 1.5 }}>
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Connector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          style={{ textAlign: 'center', marginTop: 64 }}
        >
          <div style={{
            display: 'inline-block',
            padding: '16px 36px', borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(37,99,235,0.15))',
            border: '1px solid rgba(124,58,237,0.25)',
            fontSize: 'clamp(16px, 2vw, 22px)', fontWeight: 700,
            color: '#f1f5f9', fontFamily: 'var(--font-syne, system-ui)',
          }}>
            ImmerseTrain solves all of this — at 1/17th the cost.
          </div>
        </motion.div>
      </div>
    </section>
  );
}
