'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Zap, Globe, Headphones } from 'lucide-react';

const PHASES = [
  { range: [0, 0.25], headline: 'Record.\nUpload.\nTrain.', sub: 'Capture your real workplace in 360°. Upload once. Deploy everywhere.' },
  { range: [0.25, 0.5], headline: 'Any workplace.\nAny industry.', sub: 'Healthcare, aviation, manufacturing, retail — if your team works there, you can train there.' },
  { range: [0.5, 0.75], headline: 'Quizzes that land\nat the right moment.', sub: 'Questions appear at exact timestamps in the video. Context-driven learning that sticks.' },
  { range: [0.75, 1], headline: 'Browser or\nMeta Quest.\nYour choice.', sub: 'One deployment. Zero installs. Works on any screen or VR headset out of the box.' },
];

export default function ProductReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });

  // Image transforms
  const imgScale = useTransform(smooth, [0, 0.25, 0.5, 0.75, 1], [0.65, 1, 1.15, 1.25, 1.3]);
  const imgRotate = useTransform(smooth, [0, 0.5, 1], [2, 0, -1]);
  const bgColor = useTransform(smooth, [0, 0.25, 0.5, 0.75, 1],
    ['#04040f', '#06061a', '#0a0520', '#050a20', '#04040f']);

  // Phase opacities
  const p0Opacity = useTransform(smooth, [0, 0.1, 0.2, 0.28], [0, 1, 1, 0]);
  const p1Opacity = useTransform(smooth, [0.22, 0.32, 0.42, 0.5], [0, 1, 1, 0]);
  const p2Opacity = useTransform(smooth, [0.47, 0.57, 0.67, 0.75], [0, 1, 1, 0]);
  const p3Opacity = useTransform(smooth, [0.73, 0.83, 0.93, 1], [0, 1, 1, 1]);

  const phaseOpacities = [p0Opacity, p1Opacity, p2Opacity, p3Opacity];

  // Quiz card appears in phase 3
  const quizOpacity = useTransform(smooth, [0.5, 0.62], [0, 1]);
  const quizY = useTransform(smooth, [0.5, 0.65], [30, 0]);

  // VR badge in phase 4
  const vrOpacity = useTransform(smooth, [0.75, 0.85], [0, 1]);

  return (
    <div ref={containerRef} style={{ height: '400vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Background morph */}
        <motion.div style={{ position: 'absolute', inset: 0, backgroundColor: bgColor }} />

        {/* Ambient glow that follows phases */}
        <motion.div
          style={{
            position: 'absolute', top: '30%', left: '50%',
            transform: 'translateX(-50%)',
            width: 600, height: 600,
            background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)',
            borderRadius: '50%', pointerEvents: 'none',
            opacity: useTransform(smooth, [0, 0.5, 1], [0.5, 1, 0.5]),
          }}
        />

        {/* Center product frame */}
        <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 800, padding: '0 24px' }}>
          <motion.div
            style={{
              scale: imgScale, rotate: imgRotate,
              borderRadius: 24, overflow: 'hidden',
              border: '1px solid rgba(124,58,237,0.2)',
              boxShadow: '0 40px 120px rgba(0,0,0,0.7), 0 0 80px rgba(124,58,237,0.15)',
              transformOrigin: 'center center',
              willChange: 'transform',
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1559163499-413811fb2344?w=1200&q=80"
              alt="360° training"
              style={{ width: '100%', display: 'block', aspectRatio: '16/9', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(4,4,15,0.5), transparent)' }} />

            {/* Quiz overlay — phase 3+ */}
            <motion.div
              style={{
                opacity: quizOpacity, y: quizY,
                position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                width: '85%',
                background: 'rgba(4,4,15,0.92)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(124,58,237,0.25)', borderRadius: 16, padding: '16px 20px',
              }}
            >
              <div style={{ fontSize: 10, color: '#a78bfa', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Question 3 · Safety Protocol</div>
              <p style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 600, marginBottom: 12 }}>
                A team member reports an equipment malfunction. First response?
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, padding: '8px 12px', borderRadius: 8, background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', fontSize: 12, color: '#c4b5fd', fontWeight: 600 }}>
                  ✓ Halt operations, report immediately
                </div>
                <div style={{ flex: 1, padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', fontSize: 12, color: 'rgba(241,245,249,0.4)', fontWeight: 500 }}>
                  Continue, inspect later
                </div>
              </div>
            </motion.div>

            {/* VR badge — phase 4 */}
            <motion.div
              style={{
                opacity: vrOpacity,
                position: 'absolute', top: 16, right: 16,
                background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)',
                borderRadius: 8, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <Headphones size={12} color="#06b6d4" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4' }}>VR Ready</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Phase text overlays */}
        {PHASES.map((phase, i) => (
          <motion.div
            key={i}
            style={{
              opacity: phaseOpacities[i],
              position: 'absolute', zIndex: 20,
              textAlign: 'center', pointerEvents: 'none',
              padding: '0 24px',
              top: i < 2 ? '12%' : undefined,
              bottom: i >= 2 ? '8%' : undefined,
              left: 0, right: 0,
            }}
          >
            <h2 style={{
              fontFamily: 'var(--font-syne, system-ui)',
              fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 900,
              letterSpacing: '-0.04em', lineHeight: 1.05, color: '#f1f5f9',
              whiteSpace: 'pre-line', marginBottom: 14,
            }}>
              {phase.headline}
            </h2>
            <p style={{ fontSize: 'clamp(14px, 1.6vw, 18px)', color: 'rgba(241,245,249,0.5)', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
              {phase.sub}
            </p>
          </motion.div>
        ))}

        {/* Scroll progress dots */}
        <div style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 8, zIndex: 30 }}>
          {PHASES.map((_, i) => (
            <motion.div
              key={i}
              style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'rgba(255,255,255,0.3)',
                opacity: phaseOpacities[i],
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
