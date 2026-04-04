'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useThemeStyles } from '@/hooks/useThemeStyles';

export default function FinalCTA() {
  const t = useThemeStyles();
  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '140px 24px',
        background: `radial-gradient(ellipse at 50% 50%, rgba(91,76,255,0.2) 0%, ${t.bg} 70%)`,
      }}
    >
      {/* Animated gradient mesh */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 800,
          height: 800,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 30% 40%, rgba(91,76,255,0.15), transparent 50%), radial-gradient(circle at 70% 60%, rgba(0,212,255,0.1), transparent 50%)',
          filter: 'blur(80px)',
          animation: 'gradient-shift 8s ease-in-out infinite',
          backgroundSize: '200% 200%',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 720,
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{
            fontFamily: 'var(--font-clash)',
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: t.text,
            marginBottom: 20,
          }}
        >
          The future of workforce training starts with a link.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.12 }}
          style={{
            fontFamily: 'var(--font-satoshi)',
            fontSize: 18,
            color: t.textFaint,
            marginBottom: 44,
            lineHeight: 1.6,
          }}
        >
          No hardware. No install. Just results.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.24 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            style={{ display: 'inline-block' }}
          >
            <Link
              href="/sign-up"
              style={{
                display: 'inline-block',
                padding: '18px 44px',
                borderRadius: 100,
                background: t.isDark ? '#ffffff' : '#060608',
                color: t.isDark ? '#060608' : '#ffffff',
                fontFamily: 'var(--font-satoshi)',
                fontWeight: 700,
                fontSize: 17,
                textDecoration: 'none',
                letterSpacing: '-0.01em',
              }}
            >
              Start Training Free Today
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
