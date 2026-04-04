'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useThemeStyles } from '@/hooks/useThemeStyles';

const STEPS = [
  {
    num: '01',
    title: 'Record',
    subtitle: 'Film your real workplace',
    desc: 'Use any 360° camera — Insta360, GoPro Max, or even a newer smartphone. Film the actual environment your team works in every day.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="14" stroke="#5B4CFF" strokeWidth="2" />
        <path d="M24 10V6" stroke="#5B4CFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M34.5 13.5L37 11" stroke="#5B4CFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M38 24h4" stroke="#5B4CFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M34.5 34.5L37 37" stroke="#5B4CFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M24 38v4" stroke="#5B4CFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M13.5 34.5L11 37" stroke="#5B4CFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M10 24H6" stroke="#5B4CFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M13.5 13.5L11 11" stroke="#5B4CFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M30 24C30 20.5 27 18 24 18" stroke="#5B4CFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M26.5 15.5L24 18L27 19.5" stroke="#5B4CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Author',
    subtitle: 'Drop in questions at key moments',
    desc: 'Use our web editor to pause the video and add branching questions, hotspots, and explanations. No technical skills needed.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M28 8L12 24V36H24L40 20" stroke="#5B4CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M26 10L38 22" stroke="#5B4CFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M32 14L34 16" stroke="#5B4CFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 36H36" stroke="#5B4CFF" strokeWidth="2" strokeLinecap="round" />
        <circle cx="38" cy="10" r="4" stroke="#5B4CFF" strokeWidth="2" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Deploy',
    subtitle: 'Your team trains instantly',
    desc: 'Share a link. Works in Chrome, Safari, Firefox. Works on phone, tablet, laptop, or Meta Quest. No app downloads, no hardware required.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="16" stroke="#5B4CFF" strokeWidth="2" />
        <ellipse cx="24" cy="24" rx="8" ry="16" stroke="#5B4CFF" strokeWidth="2" />
        <path d="M8 24h32" stroke="#5B4CFF" strokeWidth="2" />
        <path d="M10 16h28" stroke="#5B4CFF" strokeWidth="1.5" />
        <path d="M10 32h28" stroke="#5B4CFF" strokeWidth="1.5" />
        <rect x="32" y="34" width="12" height="8" rx="1.5" stroke="#5B4CFF" strokeWidth="1.5" />
        <path d="M36 42v2" stroke="#5B4CFF" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M40 42v2" stroke="#5B4CFF" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="4" y="34" width="8" height="10" rx="1.5" stroke="#5B4CFF" strokeWidth="1.5" />
        <path d="M6 38h4" stroke="#5B4CFF" strokeWidth="1" strokeLinecap="round" />
      </svg>
    ),
  },
];

const stepEase = [0.22, 1, 0.36, 1] as const;

function ConnectingLine() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref as React.RefObject<HTMLElement>,
    offset: ['start 80%', 'end 60%'],
  });
  const dashOffset = useTransform(scrollYProgress, [0, 1], [600, 0]);

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: '50%',
        left: 0,
        width: '100%',
        height: 4,
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <svg
        style={{ width: '100%', height: '100%' }}
        viewBox="0 0 1200 4"
        preserveAspectRatio="none"
      >
        <motion.line
          x1="100"
          y1="2"
          x2="1100"
          y2="2"
          stroke="url(#howItWorksLineGrad)"
          strokeWidth="2"
          strokeDasharray="600"
          style={{ strokeDashoffset: dashOffset }}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="howItWorksLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5B4CFF" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#00D4FF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#5B4CFF" stopOpacity="0.5" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function HowItWorks() {
  const t = useThemeStyles();

  return (
    <section
      id="how-it-works"
      style={{
        position: 'relative',
        padding: 'clamp(96px, 14vw, 120px) 24px 120px',
        scrollMarginTop: 88,
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, ease: stepEase }}
          style={{ textAlign: 'center', marginBottom: 72 }}
        >
          <p
            style={{
              fontFamily: 'var(--font-satoshi)',
              fontSize: 13,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#5B4CFF',
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            How It Works
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-clash)',
              fontSize: 'clamp(32px, 5vw, 52px)',
              fontWeight: 600,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              color: t.text,
            }}
          >
            From Footage to Training
            <br />
            <span style={{ color: t.textMuted }}>in Minutes</span>
          </h2>
        </motion.div>

        <div style={{ position: 'relative' }}>
          <div className="hidden md:block">
            <ConnectingLine />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 32,
              position: 'relative',
              zIndex: 1,
            }}
          >
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10% 0px -6% 0px', amount: 0.35 }}
                transition={{
                  duration: 0.65,
                  ease: stepEase,
                  delay: i * 0.1,
                }}
                style={{
                  padding: '40px 32px',
                  borderRadius: 20,
                  background: t.cardBg,
                  border: `1px solid ${t.cardBorder}`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: -10,
                    right: 16,
                    fontFamily: 'var(--font-clash)',
                    fontSize: 120,
                    fontWeight: 700,
                    color: '#5B4CFF',
                    opacity: 0.12,
                    lineHeight: 1,
                    pointerEvents: 'none',
                    letterSpacing: '-0.04em',
                  }}
                >
                  {step.num}
                </div>

                <div style={{ marginBottom: 24, position: 'relative', zIndex: 1 }}>
                  {step.icon}
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-clash)',
                    fontSize: 24,
                    fontWeight: 600,
                    color: t.text,
                    marginBottom: 4,
                    lineHeight: 1.2,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-clash)',
                    fontSize: 16,
                    color: '#5B4CFF',
                    fontWeight: 500,
                    marginBottom: 16,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {step.subtitle}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-satoshi)',
                    fontSize: 16,
                    color: t.textFaint,
                    lineHeight: 1.65,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
