'use client';

import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface CardData {
  title: string;
  desc: string;
  icon: React.ReactNode;
}

const CARDS: CardData[] = [
  {
    title: 'Works in Any Browser',
    desc: 'No installs. Open a URL and you\'re training in 360°.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="16" stroke="#5B4CFF" strokeWidth="2" />
        <ellipse cx="24" cy="24" rx="8" ry="16" stroke="#5B4CFF" strokeWidth="2" />
        <path d="M8 24h32" stroke="#5B4CFF" strokeWidth="2" />
        <path d="M10.5 16h27" stroke="#5B4CFF" strokeWidth="1.5" />
        <path d="M10.5 32h27" stroke="#5B4CFF" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: 'Meta Quest Ready',
    desc: 'The same web URL opens in immersive VR mode on any Quest headset.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="16" width="36" height="20" rx="10" stroke="#5B4CFF" strokeWidth="2" />
        <circle cx="18" cy="26" r="5" stroke="#5B4CFF" strokeWidth="2" />
        <circle cx="30" cy="26" r="5" stroke="#5B4CFF" strokeWidth="2" />
        <path d="M23 28c0 2 1 3 1 3" stroke="#5B4CFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M25 28c0 2-1 3-1 3" stroke="#5B4CFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M6 22c-2 0-3 2-3 4s1 4 3 4" stroke="#5B4CFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M42 22c2 0 3 2 3 4s-1 4-3 4" stroke="#5B4CFF" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Live Progress Tracking',
    desc: 'See every answer, every score, every completion in real time.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="28" width="6" height="12" rx="1" stroke="#5B4CFF" strokeWidth="2" />
        <rect x="17" y="22" width="6" height="18" rx="1" stroke="#5B4CFF" strokeWidth="2" />
        <rect x="26" y="16" width="6" height="24" rx="1" stroke="#5B4CFF" strokeWidth="2" />
        <rect x="35" y="10" width="6" height="30" rx="1" stroke="#5B4CFF" strokeWidth="2" />
        <path d="M8 8l6 8 9-5 9-3 9-2" stroke="#5B4CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="41" cy="6" r="2" fill="#5B4CFF" />
      </svg>
    ),
  },
  {
    title: 'Admin Dashboard',
    desc: 'Full visibility into your team\'s training history and performance.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="6" width="36" height="36" rx="4" stroke="#5B4CFF" strokeWidth="2" />
        <path d="M6 16h36" stroke="#5B4CFF" strokeWidth="2" />
        <path d="M22 16v26" stroke="#5B4CFF" strokeWidth="2" />
        <rect x="10" y="10" width="3" height="3" rx="1" fill="#5B4CFF" opacity="0.5" />
        <rect x="15" y="10" width="3" height="3" rx="1" fill="#5B4CFF" opacity="0.5" />
        <rect x="26" y="22" width="12" height="3" rx="1" fill="#5B4CFF" opacity="0.3" />
        <rect x="26" y="28" width="10" height="3" rx="1" fill="#5B4CFF" opacity="0.3" />
        <rect x="26" y="34" width="8" height="3" rx="1" fill="#5B4CFF" opacity="0.3" />
        <rect x="10" y="22" width="8" height="8" rx="2" stroke="#5B4CFF" strokeWidth="1.5" />
        <rect x="10" y="34" width="8" height="4" rx="1" stroke="#5B4CFF" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: 'Branching Scenarios',
    desc: 'Wrong answers trigger explanations, not just red Xs.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="14" cy="38" r="4" stroke="#5B4CFF" strokeWidth="2" />
        <circle cx="34" cy="14" r="4" stroke="#5B4CFF" strokeWidth="2" />
        <circle cx="34" cy="34" r="4" stroke="#5B4CFF" strokeWidth="2" />
        <circle cx="14" cy="14" r="4" stroke="#5B4CFF" strokeWidth="2" />
        <path d="M14 18v16" stroke="#5B4CFF" strokeWidth="2" />
        <path d="M14 22c0 6 20 2 20 8" stroke="#5B4CFF" strokeWidth="2" />
        <path d="M14 22c0-4 20-8 20-4" stroke="#5B4CFF" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: 'SCORM Compatible',
    desc: 'Plug into your existing LMS. Enterprise-ready integration.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="16" cy="24" r="6" stroke="#5B4CFF" strokeWidth="2" />
        <circle cx="32" cy="24" r="6" stroke="#5B4CFF" strokeWidth="2" />
        <path d="M22 24h4" stroke="#5B4CFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M10 24H6" stroke="#5B4CFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M42 24h-4" stroke="#5B4CFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 12v-2a2 2 0 012-2h12a2 2 0 012 2v2" stroke="#5B4CFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 36v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="#5B4CFF" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

function TiltCard({ card, index }: { card: CardData; index: number }) {
  const t = useThemeStyles();
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({
      rotateX: (0.5 - y) * 12,
      rotateY: (x - 0.5) * 12,
    });
    setMousePos({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 });
    setHovered(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setHovered(true);
  }, []);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      style={{ perspective: 800 }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        style={{
          padding: 32,
          borderRadius: 16,
          background: hovered
            ? `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(91,76,255,0.08) 0%, ${t.cardBg} 60%)`
            : t.cardBg,
          border: hovered
            ? '1px solid rgba(91,76,255,0.5)'
            : '1px solid rgba(91,76,255,0.15)',
          transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
          transition: 'transform 0.2s ease-out, border-color 0.2s, background 0.2s',
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        <div style={{ marginBottom: 20 }}>{card.icon}</div>
        <h3
          style={{
            fontFamily: 'var(--font-clash)',
            fontSize: 20,
            fontWeight: 600,
            color: t.text,
            marginBottom: 10,
            lineHeight: 1.3,
          }}
        >
          {card.title}
        </h3>
        <p
          style={{
            fontFamily: 'var(--font-satoshi)',
            fontSize: 15,
            color: t.textFaint,
            lineHeight: 1.6,
          }}
        >
          {card.desc}
        </p>
      </div>
    </motion.div>
  );
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

export default function FeaturesGrid() {
  const t = useThemeStyles();
  return (
    <section id="features" style={{ padding: '140px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', marginBottom: 72 }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-clash)',
              fontSize: 'clamp(30px, 5vw, 48px)',
              fontWeight: 600,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: t.text,
            }}
          >
            Everything you need.
            <br />
            <span style={{ color: t.textMuted }}>
              Nothing you don&rsquo;t.
            </span>
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
          }}
          className="!grid-cols-2 md:!grid-cols-3"
        >
          {CARDS.map((card, i) => (
            <TiltCard key={card.title} card={card} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
