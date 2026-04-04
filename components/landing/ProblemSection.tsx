'use client';

import { useRef } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import { useThemeStyles } from '@/hooks/useThemeStyles';

const CARDS = [
  {
    icon: '01',
    title: 'Death by PowerPoint',
    body: 'The average frontline worker forgets 70% of training content within 24 hours of a slide-based session.',
    bg: 'rgba(239,68,68,0.06)',
    border: 'rgba(239,68,68,0.10)',
    glow: 'rgba(239,68,68,0.08)',
  },
  {
    icon: '02',
    title: 'Enterprise VR Costs a Fortune',
    body: 'Enterprise VR platforms charge $15,000\u201320,000/year. Most organizations just skip immersive training entirely.',
    bg: 'rgba(249,115,22,0.06)',
    border: 'rgba(249,115,22,0.10)',
    glow: 'rgba(249,115,22,0.08)',
  },
  {
    icon: '03',
    title: 'No Way to Track Reality',
    body: 'Sign-in sheets and quiz PDFs tell you nothing about whether someone actually learned the skill.',
    bg: 'rgba(234,179,8,0.06)',
    border: 'rgba(234,179,8,0.10)',
    glow: 'rgba(234,179,8,0.08)',
  },
] as const;

const SLIDE_ORIGINS: Array<{ x: number; rotate: number }> = [
  { x: -120, rotate: -4 },
  { x: 0, rotate: 0 },
  { x: 120, rotate: 4 },
];

const TYPEWRITER_TEXT = 'There is a better way.';

const cardVariants: Variants = {
  hidden: (i: number) => ({
    opacity: 0,
    x: SLIDE_ORIGINS[i].x,
    rotate: SLIDE_ORIGINS[i].rotate,
    y: 40,
  }),
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    rotate: 0,
    y: 0,
    transition: {
      duration: 0.8,
      delay: i * 0.15,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function ProblemSection() {
  const t = useThemeStyles();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });

  const ctaRef = useRef<HTMLDivElement>(null);
  const ctaInView = useInView(ctaRef, { once: true, margin: '-60px' });

  return (
    <section
      ref={sectionRef}
      style={{
        padding: '140px 24px 120px',
        position: 'relative',
        overflow: 'hidden',
        background: t.bg,
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 700,
          height: 500,
          background:
            'radial-gradient(ellipse, rgba(91,76,255,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          style={{ textAlign: 'center', marginBottom: 72 }}
        >
          <p
            style={{
              fontSize: 11,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#5B4CFF',
              fontWeight: 700,
              marginBottom: 14,
              fontFamily: 'var(--font-satoshi)',
            }}
          >
            The Problem
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-clash)',
              fontSize: 'clamp(36px, 5vw, 64px)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              color: t.text,
            }}
          >
            The Old Way Is{' '}
            <span style={{ color: t.textMuted }}>Broken</span>
          </h2>
        </motion.div>

        {/* Cards row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
            marginBottom: 80,
          }}
        >
          {CARDS.map((card, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              whileHover={{
                y: -8,
                borderColor: card.border.replace('0.10', '0.25'),
                transition: { duration: 0.3 },
              }}
              style={{
                padding: '36px 32px',
                borderRadius: 16,
                background: card.bg,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: `1px solid ${t.cardBorder}`,
                position: 'relative',
                overflow: 'hidden',
                cursor: 'default',
                willChange: 'transform',
                transition: 'border-color 0.3s ease',
              }}
            >
              {/* Corner glow */}
              <div
                style={{
                  position: 'absolute',
                  top: -30,
                  right: -30,
                  width: 100,
                  height: 100,
                  background: `radial-gradient(circle, ${card.glow} 0%, transparent 70%)`,
                  borderRadius: '50%',
                  pointerEvents: 'none',
                }}
              />

              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: card.bg, border: `1px solid ${card.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, fontWeight: 700, color: t.textSecondary,
                fontFamily: 'var(--font-clash)', marginBottom: 20,
              }}>
                {card.icon}
              </div>

              <h3
                style={{
                  fontFamily: 'var(--font-clash)',
                  fontSize: 22,
                  fontWeight: 600,
                  color: t.text,
                  marginBottom: 14,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}
              >
                {card.title}
              </h3>

              <p
                style={{
                  fontFamily: 'var(--font-satoshi)',
                  fontSize: 15,
                  color: t.textFaint,
                  lineHeight: 1.65,
                }}
              >
                {card.body}
              </p>
            </motion.div>
          ))}
        </div>

        {/* "There is a better way." typewriter + underline */}
        <div ref={ctaRef} style={{ textAlign: 'center' }}>
          <h3
            style={{
              fontFamily: 'var(--font-clash)',
              fontSize: 'clamp(28px, 4vw, 52px)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              color: t.text,
              display: 'inline-block',
              position: 'relative',
            }}
          >
            {/* Typewriter characters */}
            {TYPEWRITER_TEXT.split('').map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={ctaInView ? { opacity: 1 } : {}}
                transition={{
                  duration: 0.04,
                  delay: 0.4 + i * 0.045,
                  ease: 'easeOut',
                }}
                style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}

            {/* Animated underline */}
            <motion.span
              initial={{ scaleX: 0 }}
              animate={ctaInView ? { scaleX: 1 } : {}}
              transition={{
                duration: 0.7,
                delay: 0.4 + TYPEWRITER_TEXT.length * 0.045 + 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                position: 'absolute',
                bottom: -6,
                left: 0,
                right: 0,
                height: 4,
                background: 'linear-gradient(90deg, #5B4CFF, #00D4FF)',
                borderRadius: 2,
                transformOrigin: 'left center',
              }}
            />
          </h3>
        </div>
      </div>
    </section>
  );
}
