'use client';

import { useRef, useEffect, useState } from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
} from 'framer-motion';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface StatItem {
  value: number;
  prefix?: string;
  suffix: string;
  label: string;
  highlight?: boolean;
}

const STATS: StatItem[] = [
  { value: 200, suffix: '+', label: 'training sessions completed' },
  { value: 87, suffix: '%', label: 'average quiz pass rate' },
  { value: 4, suffix: '.2×', label: 'faster than slide-based training', highlight: true },
  { value: 10, suffix: ' min', label: 'to create a new scenario' },
];

function AnimatedStat({ stat }: { stat: StatItem }) {
  const t = useThemeStyles();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(motionVal, stat.value, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
  }, [isInView, motionVal, stat.value]);

  useEffect(() => {
    const unsub = rounded.on('change', (v) => {
      let formatted: string;
      if (v >= 1000) {
        formatted = v.toLocaleString('en-US');
      } else {
        formatted = String(v);
      }
      setDisplay(formatted);
    });
    return unsub;
  }, [rounded]);

  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div
        style={{
          fontFamily: 'var(--font-clash)',
          fontSize: 'clamp(36px, 4vw, 48px)',
          fontWeight: 700,
          lineHeight: 1.1,
          marginBottom: 8,
          background: stat.highlight
            ? 'linear-gradient(135deg, #5B4CFF 0%, #00D4FF 100%)'
            : 'linear-gradient(135deg, #5B4CFF 30%, #00D4FF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {stat.prefix ?? ''}
        {display}
        {stat.suffix}
      </div>
      <p
        style={{
          fontFamily: 'var(--font-satoshi)',
          fontSize: 14,
          color: t.textFaint,
          lineHeight: 1.5,
          maxWidth: 160,
          margin: '0 auto',
        }}
      >
        {stat.label}
      </p>
    </div>
  );
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function SocialProof() {
  const t = useThemeStyles();
  return (
    <section
      style={{
        padding: '140px 24px',
        background: t.bgAlt,
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 64,
          alignItems: 'center',
        }}
        className="md:!grid-cols-[3fr_2fr]"
      >
        {/* Quote */}
        <motion.div variants={itemVariants} style={{ position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              top: -40,
              left: -8,
              fontFamily: 'var(--font-clash)',
              fontSize: 180,
              fontWeight: 700,
              color: '#5B4CFF',
              opacity: 0.15,
              lineHeight: 1,
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            &ldquo;
          </div>

          <blockquote
            style={{
              position: 'relative',
              zIndex: 1,
              paddingLeft: 8,
              borderLeft: 'none',
              margin: 0,
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-satoshi)',
                fontSize: 'clamp(18px, 2.2vw, 22px)',
                lineHeight: 1.6,
                color: t.isDark ? 'rgba(241,245,249,0.8)' : 'rgba(15,15,20,0.75)',
                fontWeight: 400,
                marginBottom: 28,
                maxWidth: 560,
              }}
            >
              The first time I put on the headset and saw my actual workplace in
              360°, I knew this was different. It wasn&apos;t a PowerPoint about
              safety&nbsp;&mdash; it was safety training that actually felt real.
            </p>
            <footer
              style={{
                fontFamily: 'var(--font-satoshi)',
                fontSize: 15,
                color: t.textMuted,
                fontWeight: 500,
              }}
            >
              — Training Manager, Enterprise Client
            </footer>
          </blockquote>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={itemVariants}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 40,
          }}
        >
          {STATS.map((stat) => (
            <AnimatedStat key={stat.label} stat={stat} />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
