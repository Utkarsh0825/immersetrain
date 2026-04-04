'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Upload,
  Link2,
  Film,
  Play,
  Pause,
  ChevronRight,
  ToggleRight,
  ToggleLeft,
  Rocket,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

/* ── Animation variants ──────────────────────────────────── */

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 48 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ── Shared styles ───────────────────────────────────────── */

const getGlass = (t: any): React.CSSProperties => ({
  background: t.surface,
  backdropFilter: 'blur(20px)',
  border: '1px solid ' + t.border,
});

const stepNumber: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--font-clash)',
  fontWeight: 700,
  fontSize: 15,
  color: '#fff',
  background: '#5B4CFF',
  boxShadow: '0 0 24px rgba(91,76,255,0.35)',
  flexShrink: 0,
};

const stepLabel: React.CSSProperties = {
  fontFamily: 'var(--font-satoshi)',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.08em',
  color: '#5B4CFF',
  textTransform: 'uppercase' as const,
  marginBottom: 8,
};

const getStepTitle = (t: any): React.CSSProperties => ({
  fontFamily: 'var(--font-clash)',
  fontSize: 'clamp(24px, 3vw, 36px)',
  fontWeight: 700,
  color: t.text,
  lineHeight: 1.15,
  letterSpacing: '-0.02em',
  margin: '0 0 14px',
});

const getStepDesc = (t: any): React.CSSProperties => ({
  fontFamily: 'var(--font-satoshi)',
  fontSize: 16,
  lineHeight: 1.7,
  color: t.textSecondary,
  maxWidth: 560,
  margin: '0 0 32px',
});

const responsiveCSS = `
  @media (max-width: 768px) {
    .create-hero-inner { padding: 120px 20px 60px !important; }
    .create-step-row { flex-direction: column !important; gap: 32px !important; }
    .create-step-left, .create-step-right { flex: 1 !important; min-width: 0 !important; }
    .create-step-section { padding: 80px 20px !important; }
    .create-timeline-bar { display: none !important; }
    .create-cta-inner { padding: 60px 20px !important; }
  }
`;

/* ── Main component ──────────────────────────────────────── */

export default function CreatePage() {
  const t = useThemeStyles();
  return (
    <main style={{ background: t.bg, minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{responsiveCSS}</style>

      {/* Top nav */}
      <TopNav />

      {/* Hero */}
      <HeroBlock />

      {/* Steps */}
      <Step1Upload />
      <Step2Timeline />
      <Step3Configure />

      {/* Bottom CTA */}
      <BottomCTA />
    </main>
  );
}

/* ── Top Nav ─────────────────────────────────────────────── */

function TopNav() {
  const t = useThemeStyles();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 28, delay: 0.1 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: t.navBg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid ' + t.navBorder,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
        }}
      >
        <Link
          href="/dashboard"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
            color: hovered ? t.text : t.textSecondary,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: 'var(--font-satoshi)',
            transition: 'color 0.2s',
          }}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
        <span
          style={{
            fontFamily: 'var(--font-clash)',
            fontWeight: 700,
            fontSize: 16,
            color: t.text,
            letterSpacing: '-0.02em',
          }}
        >
          ImmerseTrain
        </span>
      </div>
    </motion.nav>
  );
}

/* ── Hero ─────────────────────────────────────────────────── */

function HeroBlock() {
  const t = useThemeStyles();
  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 700,
          height: 500,
          background:
            'radial-gradient(ellipse, rgba(91,76,255,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(30px)',
        }}
      />

      <motion.div
        className="create-hero-inner"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '160px 32px 80px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <motion.div variants={fadeUp}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 9999,
              background: 'rgba(91,76,255,0.12)',
              border: '1px solid rgba(91,76,255,0.25)',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: '#a78bfa',
              marginBottom: 28,
              fontFamily: 'var(--font-satoshi)',
            }}
          >
            <span style={{ color: '#00D4FF', fontSize: 10 }}>●</span>
            SCENARIO BUILDER
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          style={{
            fontFamily: 'var(--font-clash)',
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            color: t.text,
            margin: '0 0 24px',
          }}
        >
          Create Immersive
          <br />
          <span
            style={{
              background:
                'linear-gradient(90deg, #5B4CFF 0%, #00D4FF 50%, #5B4CFF 100%)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'shimmer 3s linear infinite',
            }}
          >
            Training
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          style={{
            fontFamily: 'var(--font-satoshi)',
            fontSize: 'clamp(16px, 2vw, 19px)',
            lineHeight: 1.7,
            color: t.textSecondary,
            maxWidth: 600,
            margin: '0 auto',
          }}
        >
          Transform any 360° video into an interactive learning experience in minutes
        </motion.p>
      </motion.div>
    </section>
  );
}

/* ── Step 1: Upload ──────────────────────────────────────── */

function Step1Upload() {
  const t = useThemeStyles();
  const [dragging, setDragging] = useState(false);

  return (
    <section className="create-step-section" style={{ padding: '100px 32px' }}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={sectionVariants}
        style={{ maxWidth: 1100, margin: '0 auto' }}
      >
        <div
          className="create-step-row"
          style={{ display: 'flex', gap: 56, alignItems: 'center' }}
        >
          {/* Left: copy */}
          <div
            className="create-step-left"
            style={{ flex: '0 0 40%' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={stepNumber}>1</div>
              <span style={stepLabel}>Step One</span>
            </div>
            <h2 style={getStepTitle(t)}>Upload Your 360° Video</h2>
            <p style={getStepDesc(t)}>
              Drag and drop your equirectangular footage, or paste a URL. We support all major formats.
            </p>
            <div
              style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              {['MP4', 'WebM', '360° Equirectangular'].map((f) => (
                <span
                  key={f}
                  style={{
                    padding: '5px 14px',
                    borderRadius: 8,
                    background: 'rgba(91,76,255,0.08)',
                    border: '1px solid rgba(91,76,255,0.18)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: t.textSecondary,
                    fontFamily: 'var(--font-satoshi)',
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Right: mock upload */}
          <div className="create-step-right" style={{ flex: 1 }}>
            <div
              onMouseEnter={() => setDragging(true)}
              onMouseLeave={() => setDragging(false)}
              style={{
                borderRadius: 20,
                border: dragging
                  ? '2px dashed rgba(91,76,255,0.5)'
                  : '2px dashed rgba(255,255,255,0.1)',
                background: dragging
                  ? 'rgba(91,76,255,0.04)'
                  : t.surface,
                padding: '48px 32px',
                textAlign: 'center',
                transition: 'all 0.3s ease',
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: 'rgba(91,76,255,0.1)',
                  border: '1px solid rgba(91,76,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}
              >
                <Upload
                  size={26}
                  style={{
                    color: '#5B4CFF',
                    transition: 'transform 0.2s',
                    transform: dragging ? 'translateY(-3px)' : 'none',
                  }}
                />
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-satoshi)',
                  fontSize: 15,
                  fontWeight: 600,
                  color: t.textSecondary,
                  marginBottom: 6,
                }}
              >
                Drag & drop your 360° video here
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-satoshi)',
                  fontSize: 13,
                  color: t.textMuted,
                  marginBottom: 24,
                }}
              >
                or
              </p>

              {/* URL input mock */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  maxWidth: 420,
                  margin: '0 auto 24px',
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: t.surface,
                  border: '1px solid ' + t.border,
                }}
              >
                <Link2 size={16} style={{ color: t.textMuted, flexShrink: 0 }} />
                <span
                  style={{
                    fontFamily: 'var(--font-satoshi)',
                    fontSize: 14,
                    color: t.textMuted,
                    flex: 1,
                    textAlign: 'left',
                  }}
                >
                  Paste a video URL...
                </span>
                <span
                  style={{
                    padding: '5px 14px',
                    borderRadius: 8,
                    background: '#5B4CFF',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: 'var(--font-satoshi)',
                    flexShrink: 0,
                  }}
                >
                  Upload
                </span>
              </div>

              {/* Progress bar mock */}
              <div
                style={{
                  maxWidth: 320,
                  margin: '0 auto',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: t.textMuted,
                      fontFamily: 'var(--font-satoshi)',
                      fontWeight: 600,
                    }}
                  >
                    safety-training-360.mp4
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: '#5B4CFF',
                      fontFamily: 'var(--font-satoshi)',
                      fontWeight: 700,
                    }}
                  >
                    73%
                  </span>
                </div>
                <div
                  style={{
                    height: 4,
                    borderRadius: 4,
                    background: t.border,
                    overflow: 'hidden',
                  }}
                >
                  <motion.div
                    initial={{ width: '0%' }}
                    whileInView={{ width: '73%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                    style={{
                      height: '100%',
                      borderRadius: 4,
                      background:
                        'linear-gradient(90deg, #5B4CFF, #00D4FF)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ── Step 2: Timeline ────────────────────────────────────── */

const TIMELINE_PINS = [
  { pct: 12, time: '0:04', q: 'What safety hazard do you notice?' },
  { pct: 35, time: '0:11', q: 'What should you do in this situation?' },
  { pct: 58, time: '0:18', q: 'Identify the correct protocol.' },
  { pct: 82, time: '0:26', q: 'What is the emergency procedure?' },
];

function Step2Timeline() {
  const t = useThemeStyles();
  const [activePin, setActivePin] = useState<number | null>(null);

  return (
    <section
      className="create-step-section"
      style={{
        padding: '100px 32px',
        background:
          'linear-gradient(180deg, transparent 0%, rgba(91,76,255,0.02) 50%, transparent 100%)',
      }}
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={sectionVariants}
        style={{ maxWidth: 1100, margin: '0 auto' }}
      >
        <div
          className="create-step-row"
          style={{
            display: 'flex',
            gap: 56,
            alignItems: 'center',
            flexDirection: 'row-reverse',
          }}
        >
          {/* Right: copy */}
          <div className="create-step-left" style={{ flex: '0 0 40%' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div style={stepNumber}>2</div>
              <span style={stepLabel}>Step Two</span>
            </div>
            <h2 style={getStepTitle(t)}>Set Question Timestamps</h2>
            <p style={getStepDesc(t)}>
              Pin interactive questions to specific moments in your video.
              Learners see them at exactly the right time.
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: 'var(--font-satoshi)',
                fontSize: 13,
                color: t.textMuted,
              }}
            >
              <Film size={14} />
              Hover the pins to preview questions
            </div>
          </div>

          {/* Left: timeline mock */}
          <div className="create-step-right" style={{ flex: 1 }}>
            <div
              style={{
                ...getGlass(t),
                borderRadius: 18,
                padding: '28px 24px',
              }}
            >
              {/* Video thumbnail placeholder */}
              <div
                style={{
                  height: 180,
                  borderRadius: 12,
                  background:
                    'linear-gradient(135deg, rgba(91,76,255,0.1) 0%, rgba(0,212,255,0.05) 100%)',
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'repeating-linear-gradient(90deg, rgba(91,76,255,0.03) 0px, rgba(91,76,255,0.03) 1px, transparent 1px, transparent 40px)',
                  }}
                />
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: t.border,
                    border: '1px solid rgba(255,255,255,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Play size={20} style={{ color: t.textMuted }} />
                </div>
              </div>

              {/* Playback controls */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: t.surface,
                    border: '1px solid ' + t.border,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Pause size={14} style={{ color: t.textSecondary }} />
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-satoshi)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: t.textMuted,
                  }}
                >
                  0:11 / 0:31
                </span>
              </div>

              {/* Timeline bar */}
              <div
                className="create-timeline-bar"
                style={{
                  position: 'relative',
                  height: 6,
                  borderRadius: 6,
                  background: t.border,
                  marginBottom: 8,
                }}
              >
                {/* Progress fill */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: '35%',
                    borderRadius: 6,
                    background:
                      'linear-gradient(90deg, #5B4CFF, #00D4FF)',
                  }}
                />

                {/* Pins */}
                {TIMELINE_PINS.map((pin, i) => (
                  <div
                    key={i}
                    onMouseEnter={() => setActivePin(i)}
                    onMouseLeave={() => setActivePin(null)}
                    style={{
                      position: 'absolute',
                      left: `${pin.pct}%`,
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: activePin === i ? 10 : 1,
                      cursor: 'pointer',
                    }}
                  >
                    <motion.div
                      animate={{
                        scale: activePin === i ? 1.4 : 1,
                        boxShadow:
                          activePin === i
                            ? '0 0 16px rgba(91,76,255,0.5)'
                            : '0 0 8px rgba(91,76,255,0.2)',
                      }}
                      transition={{ duration: 0.2 }}
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: '#5B4CFF',
                        border: '2px solid rgba(255,255,255,0.3)',
                      }}
                    />
                    {/* Tooltip */}
                    {activePin === i && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          position: 'absolute',
                          bottom: 24,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          ...getGlass(t),
                          borderRadius: 12,
                          padding: '12px 16px',
                          minWidth: 200,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: '#5B4CFF',
                            fontFamily: 'var(--font-satoshi)',
                            marginBottom: 4,
                          }}
                        >
                          {pin.time}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: t.text,
                            fontFamily: 'var(--font-satoshi)',
                          }}
                        >
                          {pin.q}
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pin labels */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--font-satoshi)',
                  fontSize: 11,
                  color: t.textMuted,
                }}
              >
                <span>0:00</span>
                <span>0:31</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ── Step 3: Configure ───────────────────────────────────── */

function Step3Configure() {
  const t = useThemeStyles();
  const [toggles, setToggles] = useState({
    shuffle: true,
    explanations: true,
    passingScore: false,
  });

  const [published, setPublished] = useState(false);

  return (
    <section className="create-step-section" style={{ padding: '100px 32px' }}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={sectionVariants}
        style={{ maxWidth: 1100, margin: '0 auto' }}
      >
        <div
          className="create-step-row"
          style={{ display: 'flex', gap: 56, alignItems: 'center' }}
        >
          {/* Left: copy */}
          <div className="create-step-left" style={{ flex: '0 0 40%' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div style={stepNumber}>3</div>
              <span style={stepLabel}>Step Three</span>
            </div>
            <h2 style={getStepTitle(t)}>Configure & Publish</h2>
            <p style={getStepDesc(t)}>
              Fine-tune your training settings, then publish with one click.
              Your scenario goes live instantly.
            </p>
          </div>

          {/* Right: settings mock */}
          <div className="create-step-right" style={{ flex: 1 }}>
            <div
              style={{
                ...getGlass(t),
                borderRadius: 18,
                padding: '28px 24px',
              }}
            >
              {/* Toggle rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { key: 'shuffle' as const, label: 'Shuffle Questions', desc: 'Randomize question order for each learner' },
                  { key: 'explanations' as const, label: 'Show Explanations', desc: 'Display detailed feedback after each answer' },
                  { key: 'passingScore' as const, label: 'Set Passing Score', desc: 'Require 70% to earn a completion badge' },
                ].map(({ key, label, desc }, i) => (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '18px 0',
                      borderBottom:
                        i < 2
                          ? '1px solid ' + t.navBorder
                          : 'none',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-satoshi)',
                          fontSize: 14,
                          fontWeight: 600,
                          color: t.text,
                          marginBottom: 3,
                        }}
                      >
                        {label}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-satoshi)',
                          fontSize: 12,
                          color: t.textMuted,
                        }}
                      >
                        {desc}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setToggles((prev) => ({ ...prev, [key]: !prev[key] }))
                      }
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: toggles[key] ? '#5B4CFF' : 'rgba(241,245,249,0.2)',
                        transition: 'color 0.2s',
                        padding: 0,
                        display: 'flex',
                      }}
                    >
                      {toggles[key] ? (
                        <ToggleRight size={28} />
                      ) : (
                        <ToggleLeft size={28} />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div
                style={{
                  height: 1,
                  background: t.border,
                  margin: '20px 0',
                }}
              />

              {/* Preview card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  marginBottom: 24,
                  padding: '14px 16px',
                  borderRadius: 12,
                  background: t.surface,
                  border: '1px solid ' + t.navBorder,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background:
                      'linear-gradient(135deg, rgba(91,76,255,0.15), rgba(0,212,255,0.1))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Sparkles size={18} style={{ color: '#5B4CFF' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-satoshi)',
                      fontSize: 13,
                      fontWeight: 600,
                      color: t.text,
                    }}
                  >
                    Workplace Safety Training
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-satoshi)',
                      fontSize: 12,
                      color: t.textMuted,
                    }}
                  >
                    4 questions · 31s · 360° video
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  style={{ color: t.textMuted }}
                />
              </div>

              {/* Publish button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPublished(true)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 12,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-satoshi)',
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: published
                    ? '#10b981'
                    : '#5B4CFF',
                  boxShadow: published
                    ? '0 0 30px rgba(16,185,129,0.3)'
                    : '0 0 30px rgba(91,76,255,0.3)',
                  transition: 'background 0.4s, box-shadow 0.4s',
                }}
              >
                {published ? (
                  <>
                    <CheckCircle2 size={16} /> Published!
                  </>
                ) : (
                  <>
                    <Rocket size={16} /> Publish Scenario
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ── Bottom CTA ──────────────────────────────────────────── */

function BottomCTA() {
  const t = useThemeStyles();
  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 800,
          height: 400,
          background:
            'radial-gradient(ellipse, rgba(91,76,255,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        className="create-cta-inner"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={staggerContainer}
        style={{
          maxWidth: 700,
          margin: '0 auto',
          padding: '100px 32px 120px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <motion.h2
          variants={fadeUp}
          style={{
            fontFamily: 'var(--font-clash)',
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 700,
            color: t.text,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            margin: '0 0 16px',
          }}
        >
          Ready to create your
          <br />
          first scenario?
        </motion.h2>
        <motion.p
          variants={fadeUp}
          style={{
            fontFamily: 'var(--font-satoshi)',
            fontSize: 17,
            color: t.textSecondary,
            lineHeight: 1.7,
            margin: '0 0 36px',
          }}
        >
          Join teams using immersive 360° training to onboard faster, reduce incidents, and boost retention.
        </motion.p>
        <motion.div variants={fadeUp}>
          <Link
            href="/sign-up"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '16px 36px',
              borderRadius: 9999,
              background: '#5B4CFF',
              color: '#fff',
              fontWeight: 700,
              fontSize: 16,
              textDecoration: 'none',
              fontFamily: 'var(--font-satoshi)',
              boxShadow: '0 0 50px rgba(91,76,255,0.35)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
          >
            Get Started <ChevronRight size={18} />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
