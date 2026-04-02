'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Video, PenTool, Users } from 'lucide-react';

const STEPS = [
  { num: '01', icon: Video, title: 'Record your real environment', desc: 'Use any 360° camera — a $300 consumer device works perfectly. Capture your actual workplace: factory floor, hospital ward, retail store, cockpit.', color: '#7c3aed' },
  { num: '02', icon: PenTool, title: 'Build interactive scenarios', desc: 'Drop quiz questions at exact video timestamps. Write realistic situations with multiple-choice answers and detailed explanations for every outcome.', color: '#2563eb' },
  { num: '03', icon: Users, title: 'Deploy to your entire workforce', desc: "Share a link. That's it. Works on any laptop, phone, or Meta Quest headset. Real-time scoring and completion tracking for every learner.", color: '#06b6d4' },
];

export default function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref} style={{ padding: '120px 24px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} style={{ textAlign: 'center', marginBottom: 80 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7c3aed', fontWeight: 700, marginBottom: 14 }}>How It Works</p>
          <h2 style={{ fontFamily: 'var(--font-syne, system-ui)', fontSize: 'clamp(30px, 5vw, 56px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, color: '#f1f5f9' }}>
            Up and running<br /><span style={{ color: 'rgba(241,245,249,0.3)' }}>in under an hour.</span>
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2, position: 'relative' }}>
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 36 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.15 }}
                style={{ padding: '36px 32px', borderRadius: 24, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', position: 'relative', overflow: 'hidden' }}
              >
                {/* Giant ghost number */}
                <div style={{ position: 'absolute', top: -10, right: 16, fontFamily: 'var(--font-syne, system-ui)', fontSize: 100, fontWeight: 900, color: `${step.color}08`, lineHeight: 1, pointerEvents: 'none', letterSpacing: '-0.05em' }}>{step.num}</div>
                {/* Icon */}
                <div style={{ width: 52, height: 52, borderRadius: 16, background: `${step.color}12`, border: `1px solid ${step.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                  <Icon size={24} color={step.color} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-syne, system-ui)', fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginBottom: 14, lineHeight: 1.25 }}>{step.title}</h3>
                <p style={{ fontSize: 15, color: 'rgba(241,245,249,0.45)', lineHeight: 1.65 }}>{step.desc}</p>
                {/* Bottom accent */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${step.color}60, transparent)` }} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
