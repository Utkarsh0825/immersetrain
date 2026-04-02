'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Heart, Plane, Cog, ShoppingBag, Utensils, Shield } from 'lucide-react';

const INDUSTRIES = [
  { icon: Heart, color: '#ef4444', name: 'Healthcare', desc: 'Train staff on patient safety protocols, emergency response, and compliance in realistic hospital environments.', stat: '40% faster onboarding' },
  { icon: Plane, color: '#06b6d4', name: 'Aviation', desc: 'Ground crew training, safety checks, and emergency procedures with 360° hangar and tarmac scenarios.', stat: '3x better retention' },
  { icon: Cog, color: '#f59e0b', name: 'Manufacturing', desc: 'Hazard identification, machine safety, and lean process training without stopping production lines.', stat: '60% fewer incidents' },
  { icon: ShoppingBag, color: '#10b981', name: 'Retail', desc: 'Customer service, theft prevention, and store operations training that scales across hundreds of locations.', stat: '2x faster ramp-up' },
  { icon: Utensils, color: '#f97316', name: 'Hospitality', desc: 'Front-of-house service standards, food safety, and guest interaction training for global hotel and restaurant chains.', stat: '85% engagement rate' },
  { icon: Shield, color: '#7c3aed', name: 'Defense & Security', desc: 'Scenario-based threat assessment, perimeter security, and incident response training in realistic environments.', stat: 'Mission-critical ready' },
];

export default function Industries() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section id="industries" ref={ref} style={{ padding: '120px 24px', background: '#04040f' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} style={{ textAlign: 'center', marginBottom: 72 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7c3aed', fontWeight: 700, marginBottom: 14 }}>Industries</p>
          <h2 style={{ fontFamily: 'var(--font-syne, system-ui)', fontSize: 'clamp(30px, 5vw, 56px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, color: '#f1f5f9' }}>
            Built for the world&apos;s<br /><span style={{ color: 'rgba(241,245,249,0.3)' }}>most demanding workforces.</span>
          </h2>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {INDUSTRIES.map((ind, i) => {
            const Icon = ind.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 32 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.09 }}
                className="industry-card"
                style={{ padding: '28px 28px', borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', position: 'relative', overflow: 'hidden', cursor: 'default' }}
              >
                <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, background: `radial-gradient(circle, ${ind.color}14 0%, transparent 70%)`, borderRadius: '50%' }} />
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${ind.color}14`, border: `1px solid ${ind.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <Icon size={22} color={ind.color} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-syne, system-ui)', fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>{ind.name}</h3>
                <p style={{ fontSize: 14, color: 'rgba(241,245,249,0.45)', lineHeight: 1.65, marginBottom: 18 }}>{ind.desc}</p>
                <div style={{ padding: '6px 14px', borderRadius: 100, background: `${ind.color}12`, border: `1px solid ${ind.color}28`, display: 'inline-block', fontSize: 12, fontWeight: 700, color: ind.color }}>{ind.stat}</div>
              </motion.div>
            );
          })}
        </div>
        <style>{`.industry-card { transition: border-color 0.3s, box-shadow 0.3s; } .industry-card:hover { border-color: rgba(124,58,237,0.3) !important; box-shadow: 0 0 40px rgba(124,58,237,0.08); }`}</style>
      </div>
    </section>
  );
}
