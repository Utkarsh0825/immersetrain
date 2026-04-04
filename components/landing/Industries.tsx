'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useThemeStyles } from '@/hooks/useThemeStyles';

const PILLS = [
  'Transit & Rail',
  'Construction',
  'Healthcare',
  'Utilities',
  'Manufacturing',
  'Aviation',
  'Emergency Services',
  'Field Service',
];

export default function Industries() {
  const t = useThemeStyles();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section
      id="industries"
      ref={ref}
      style={{ padding: '120px 0', background: t.bg }}
    >
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 28 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        style={{
          fontFamily: 'var(--font-clash)',
          fontSize: 'clamp(26px, 4.5vw, 44px)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          color: t.text,
          textAlign: 'center',
          maxWidth: 700,
          margin: '0 auto 56px',
          padding: '0 24px',
        }}
      >
        Built for the workers who can&apos;t afford to get it wrong.
      </motion.h2>

      {/* Marquee */}
      <div
        style={{
          overflow: 'hidden',
          maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: 'max-content',
            animation: 'marquee 35s linear infinite',
          }}
        >
          {[...PILLS, ...PILLS].map((pill, i) => (
            <span
              key={i}
              style={{
                flexShrink: 0,
                padding: '12px 24px',
                borderRadius: 100,
                background: t.surface,
                border: `1px solid ${t.border}`,
                fontFamily: 'var(--font-satoshi)',
                fontSize: 15,
                color: t.isDark ? 'rgba(241,245,249,0.7)' : 'rgba(15,15,20,0.65)',
                whiteSpace: 'nowrap',
                marginRight: 12,
              }}
            >
              {pill}
            </span>
          ))}
        </div>
      </div>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.2 }}
        style={{
          fontFamily: 'var(--font-satoshi)',
          fontSize: 18,
          lineHeight: 1.7,
          color: t.textFaint,
          textAlign: 'center',
          maxWidth: 640,
          margin: '48px auto 0',
          padding: '0 24px',
        }}
      >
        If your team works with their hands, works on-site, or handles situations
        where the wrong decision has real consequences — ImmerseTrain was built
        for them.
      </motion.p>
    </section>
  );
}
