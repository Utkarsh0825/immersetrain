'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Play, ArrowRight, Zap, Globe, Shield } from 'lucide-react';
import Link from 'next/link';

// Industries that cycle in the hero
const INDUSTRIES = ['Healthcare', 'Aviation', 'Manufacturing', 'Retail', 'Hospitality', 'Defense', 'Education', 'Finance'];

// Word-by-word headline animation
const HEADLINE_LINE1 = ['Train', 'Anyone.'];
const HEADLINE_LINE2 = ['Anywhere.', 'In', '360°.'];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 80, damping: 25 });

  const heroY = useTransform(smoothProgress, [0, 1], [0, -80]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(smoothProgress, [0, 0.5], [1, 0.94]);

  // Floating product preview
  const floatY = useTransform(smoothProgress, [0, 1], [0, -40]);

  return (
    <section ref={ref} style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#04040f' }}>

      {/* ── Ambient background ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {/* Main glow orb */}
        <div style={{
          position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
          width: 700, height: 700,
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, rgba(37,99,235,0.06) 40%, transparent 70%)',
          borderRadius: '50%', animation: 'pulse-glow 6s ease-in-out infinite',
        }} />
        {/* Left accent */}
        <div style={{
          position: 'absolute', top: '40%', left: '-5%',
          width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        {/* Right accent */}
        <div style={{
          position: 'absolute', top: '30%', right: '-5%',
          width: 250, height: 250,
          background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)',
        }} />
        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: i % 2 === 0 ? 3 : 2,
              height: i % 2 === 0 ? 3 : 2,
              borderRadius: '50%',
              background: i % 3 === 0 ? '#7c3aed' : i % 3 === 1 ? '#2563eb' : '#06b6d4',
              left: `${10 + i * 11}%`,
              top: `${20 + (i % 4) * 18}%`,
            }}
            animate={{ y: [-15, 15, -15], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 4 + i * 0.6, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
      </div>

      {/* ── Main content ── */}
      <motion.div
        style={{ y: heroY, opacity: heroOpacity, scale: heroScale, position: 'relative', zIndex: 10, textAlign: 'center', padding: '120px 24px 80px', maxWidth: 900, width: '100%' }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 36 }}
        >
          <div style={{
            padding: '7px 18px', borderRadius: 100,
            background: 'rgba(124,58,237,0.1)',
            border: '1px solid rgba(124,58,237,0.25)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', animation: 'pulse-glow 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a78bfa' }}>
              The Future of Workforce Training
            </span>
          </div>
        </motion.div>

        {/* Headline — word by word */}
        <h1 style={{ fontFamily: 'var(--font-syne, system-ui)', fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em', margin: '0 0 28px' }}>
          <div style={{ marginBottom: '0.1em' }}>
            {HEADLINE_LINE1.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: 'inline-block', marginRight: '0.22em', color: '#f1f5f9' }}
              >
                {word}
              </motion.span>
            ))}
          </div>
          <div>
            {HEADLINE_LINE2.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.7, delay: 0.3 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  display: 'inline-block', marginRight: '0.22em',
                  background: i === 2 ? 'linear-gradient(135deg, #7c3aed, #06b6d4)' : 'none',
                  WebkitBackgroundClip: i === 2 ? 'text' : 'unset',
                  WebkitTextFillColor: i === 2 ? 'transparent' : '#f1f5f9',
                  backgroundClip: i === 2 ? 'text' : 'unset',
                  color: i === 2 ? 'transparent' : '#f1f5f9',
                }}
              >
                {word}
              </motion.span>
            ))}
          </div>
        </h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          style={{ fontSize: 'clamp(16px, 2.2vw, 22px)', color: 'rgba(241,245,249,0.55)', lineHeight: 1.65, maxWidth: 580, margin: '0 auto 44px' }}
        >
          Scenario-based immersive training for{' '}
          <span style={{ color: '#f1f5f9', fontWeight: 600 }}>every industry</span>.
          Deploy in minutes. Works in any browser or Meta Quest headset.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 64 }}
        >
          <Link href="/train/demo-scenario-001" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '15px 30px', borderRadius: 12,
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            color: 'white', fontWeight: 700, fontSize: 15,
            textDecoration: 'none',
            boxShadow: '0 0 40px rgba(124,58,237,0.45), 0 0 80px rgba(124,58,237,0.15)',
            letterSpacing: '-0.01em',
          }}>
            Try Free Demo <ArrowRight size={16} />
          </Link>
          <a href="#platform" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '15px 28px', borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)',
            color: 'rgba(241,245,249,0.8)', fontWeight: 600, fontSize: 15,
            textDecoration: 'none', backdropFilter: 'blur(10px)',
          }}>
            <Play size={14} fill="currentColor" /> Watch How It Works
          </a>
        </motion.div>

        {/* Social proof strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}
        >
          {[
            { icon: <Globe size={13} />, text: '12+ industries' },
            { icon: <Zap size={13} />, text: 'No headset needed' },
            { icon: <Shield size={13} />, text: 'Enterprise ready' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(241,245,249,0.3)', fontSize: 13 }}>
              {icon} {text}
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Floating product preview ── */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.1, delay: 1.3, ease: [0.22, 1, 0.36, 1] }}
        style={{ y: floatY, position: 'absolute', bottom: '-120px', left: '50%', transform: 'translateX(-50%)', zIndex: 5, width: '90%', maxWidth: 900 }}
      >
        <div style={{
          borderRadius: 20, overflow: 'hidden',
          border: '1px solid rgba(124,58,237,0.2)',
          boxShadow: '0 40px 120px rgba(0,0,0,0.6), 0 0 60px rgba(124,58,237,0.1)',
          background: 'rgba(255,255,255,0.02)',
        }}>
          {/* Browser chrome */}
          <div style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['#ef4444', '#f59e0b', '#22c55e'].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c, opacity: 0.8 }} />)}
            </div>
            <div style={{ flex: 1, marginLeft: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '4px 12px', fontSize: 12, color: 'rgba(241,245,249,0.3)', textAlign: 'center' }}>
              app.immersetrain.com/train/scenario-001
            </div>
          </div>
          {/* App preview */}
          <div style={{ position: 'relative', height: 380, overflow: 'hidden', background: '#050510' }}>
            <img
              src="https://images.unsplash.com/photo-1559163499-413811fb2344?w=1200&q=80"
              alt="360° training environment"
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(4,4,15,0.8) 0%, rgba(4,4,15,0.2) 40%, transparent 60%)' }} />
            {/* Quiz overlay preview */}
            <div style={{
              position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
              width: 480, maxWidth: '90%',
              background: 'rgba(4,4,15,0.9)', backdropFilter: 'blur(24px)',
              border: '1px solid rgba(124,58,237,0.25)', borderRadius: 20, padding: '20px 24px',
            }}>
              <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                Question 4 of 10 · Safety Protocol
              </div>
              <p style={{ fontSize: 15, color: '#f1f5f9', fontWeight: 600, marginBottom: 14, lineHeight: 1.4 }}>
                You spot a hazard on the floor. What is your first action?
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1, padding: '10px 14px', borderRadius: 10, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', fontSize: 13, color: '#c4b5fd', fontWeight: 500 }}>
                  Alert your supervisor immediately
                </div>
                <div style={{ flex: 1, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 13, color: 'rgba(241,245,249,0.5)', fontWeight: 500 }}>
                  Wait for someone else to handle it
                </div>
              </div>
            </div>
            {/* Score HUD preview */}
            <div style={{
              position: 'absolute', top: 16, right: 16,
              background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: 10, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Zap size={12} color="#7c3aed" fill="#7c3aed" />
              <span style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9' }}>70</span>
              <span style={{ fontSize: 11, color: 'rgba(241,245,249,0.4)' }}>/ 100</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 20 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          style={{ width: 1, height: 44, background: 'linear-gradient(to bottom, rgba(124,58,237,0.7), transparent)' }}
        />
      </motion.div>

      <style>{`@keyframes pulse-glow { 0%, 100% { opacity: 0.7; transform: translateX(-50%) scale(1); } 50% { opacity: 1; transform: translateX(-50%) scale(1.06); } }`}</style>
    </section>
  );
}
