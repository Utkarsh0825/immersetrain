'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { useThemeStyles } from '@/hooks/useThemeStyles';

const STARTER_FEATURES = [
  '10 learner seats',
  '1 training scenario',
  'Browser + Meta Quest',
  'Basic analytics',
  'Admin dashboard',
  'Email support',
];

const TEAM_FEATURES = [
  '50 learner seats',
  'Unlimited scenarios',
  'Advanced analytics',
  'SCORM / LMS export',
  'Priority support',
  'Custom branding',
];

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Pricing() {
  const t = useThemeStyles();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });


  return (
    <section
      id="pricing"
      ref={ref}
      style={{ padding: '120px 24px', background: t.bg }}
    >
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          style={{ textAlign: 'center', marginBottom: 64 }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-clash)',
              fontSize: 'clamp(28px, 5vw, 48px)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              color: t.text,
            }}
          >
            Simple pricing. Serious savings.
          </h2>
        </motion.div>

        {/* Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}
        >
          {/* Starter Card */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              position: 'relative',
              borderRadius: 24,
              padding: '40px 32px',
              background: t.cardBg,
              border: '1px solid rgba(91,76,255,0.3)',
              boxShadow: '0 0 40px rgba(91,76,255,0.3)',
            }}
          >
            {/* Most Popular Badge */}
            <div
              style={{
                position: 'absolute',
                top: -14,
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#5B4CFF',
                borderRadius: 100,
                padding: '6px 18px',
                fontSize: 12,
                fontWeight: 700,
                color: 'white',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
                fontFamily: 'var(--font-satoshi)',
              }}
            >
              Most Popular
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-satoshi)',
                fontSize: 20,
                fontWeight: 700,
                color: t.text,
                marginBottom: 24,
              }}
            >
              Starter
            </h3>

            <div style={{ marginBottom: 8 }}>
              <span
                style={{
                  fontFamily: 'var(--font-clash)',
                  fontSize: 52,
                  fontWeight: 700,
                  color: t.text,
                  letterSpacing: '-0.04em',
                }}
              >
                $1,000
              </span>
              <span
                style={{
                  fontSize: 16,
                  color: t.textFaint,
                  marginLeft: 4,
                  fontFamily: 'var(--font-satoshi)',
                }}
              >
                / year
              </span>
            </div>
            <p
              style={{
                fontSize: 14,
                color: t.textFaint,
                marginBottom: 32,
                fontFamily: 'var(--font-satoshi)',
              }}
            >
              That&apos;s $8.33/month. Less than a training binder.
            </p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                marginBottom: 36,
              }}
            >
              {STARTER_FEATURES.map((feat) => (
                <div
                  key={feat}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 14,
                    color: t.textSecondary,
                    fontFamily: 'var(--font-satoshi)',
                  }}
                >
                  <span style={{ color: '#5B4CFF', flexShrink: 0 }}>
                    <Check />
                  </span>
                  {feat}
                </div>
              ))}
            </div>

            <Link
              href="/sign-up"
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '14px 24px',
                borderRadius: 100,
                background: '#5B4CFF',
                color: 'white',
                fontWeight: 600,
                fontSize: 15,
                textDecoration: 'none',
                fontFamily: 'var(--font-satoshi)',
                transition: 'box-shadow 0.2s',
                boxShadow: '0 4px 24px rgba(91,76,255,0.35)',
              }}
            >
              Get Started Free
            </Link>
          </motion.div>

          {/* Team Card */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.22 }}
            style={{
              borderRadius: 24,
              padding: '40px 32px',
              background: t.cardBg,
              border: `1px solid ${t.cardBorder}`,
              backdropFilter: 'blur(12px)',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-satoshi)',
                fontSize: 20,
                fontWeight: 700,
                color: t.text,
                marginBottom: 24,
              }}
            >
              Team
            </h3>

            <div style={{ marginBottom: 8 }}>
              <span
                style={{
                  fontFamily: 'var(--font-clash)',
                  fontSize: 52,
                  fontWeight: 700,
                  color: t.text,
                  letterSpacing: '-0.04em',
                }}
              >
                $3,000
              </span>
              <span
                style={{
                  fontSize: 16,
                  color: t.textFaint,
                  marginLeft: 4,
                  fontFamily: 'var(--font-satoshi)',
                }}
              >
                / year
              </span>
            </div>
            <p
              style={{
                fontSize: 14,
                color: t.textFaint,
                marginBottom: 32,
                fontFamily: 'var(--font-satoshi)',
                visibility: 'hidden',
              }}
            >
              &nbsp;
            </p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                marginBottom: 36,
              }}
            >
              {TEAM_FEATURES.map((feat) => (
                <div
                  key={feat}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 14,
                    color: t.textSecondary,
                    fontFamily: 'var(--font-satoshi)',
                  }}
                >
                  <span style={{ color: '#5B4CFF', flexShrink: 0 }}>
                    <Check />
                  </span>
                  {feat}
                </div>
              ))}
            </div>

            <Link
              href="/sign-up"
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '14px 24px',
                borderRadius: 100,
                background: 'transparent',
                color: t.textSecondary,
                fontWeight: 600,
                fontSize: 15,
                textDecoration: 'none',
                fontFamily: 'var(--font-satoshi)',
                border: `1px solid ${t.borderBright}`,
                transition: 'border-color 0.2s, color 0.2s',
              }}
            >
              Contact Sales
            </Link>
          </motion.div>
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            textAlign: 'center',
            marginTop: 56,
            fontFamily: 'var(--font-satoshi)',
            fontSize: 16,
            color: t.textFaint,
            lineHeight: 1.7,
          }}
        >
          Training platforms shouldn&apos;t cost more than the training itself.
        </motion.p>
      </div>
    </section>
  );
}
