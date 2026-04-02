'use client';
import { motion } from 'framer-motion';
import { Heart, Plane, Cog, ShoppingBag, Utensils, Shield, GraduationCap, Landmark, Truck, Zap } from 'lucide-react';

const INDUSTRIES = [
  { label: 'Healthcare', icon: Heart },
  { label: 'Aviation', icon: Plane },
  { label: 'Manufacturing', icon: Cog },
  { label: 'Retail', icon: ShoppingBag },
  { label: 'Hospitality', icon: Utensils },
  { label: 'Defense', icon: Shield },
  { label: 'Education', icon: GraduationCap },
  { label: 'Finance', icon: Landmark },
  { label: 'Logistics', icon: Truck },
  { label: 'Energy', icon: Zap },
];

const Item = ({ label, icon: Icon }: { label: string; icon: React.ElementType }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 10,
    padding: '10px 22px', borderRadius: 100, flexShrink: 0,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    color: 'rgba(241,245,249,0.45)',
    fontSize: 14, fontWeight: 500,
    marginRight: 14,
    transition: 'all 0.25s ease',
  }}>
    <Icon size={15} />
    {label}
  </div>
);

export default function IndustryMarquee() {
  const doubled = [...INDUSTRIES, ...INDUSTRIES];
  return (
    <section style={{ padding: '48px 0', overflow: 'hidden', position: 'relative', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
      {/* Fade edges */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 120, background: 'linear-gradient(to right, #04040f, transparent)', zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 120, background: 'linear-gradient(to left, #04040f, transparent)', zIndex: 2, pointerEvents: 'none' }} />

      <div style={{ display: 'flex', width: 'max-content', animation: 'marquee 35s linear infinite' }}
        onMouseEnter={e => (e.currentTarget.style.animationPlayState = 'paused')}
        onMouseLeave={e => (e.currentTarget.style.animationPlayState = 'running')}
      >
        {doubled.map((ind, i) => <Item key={i} label={ind.label} icon={ind.icon} />)}
      </div>

      <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'rgba(241,245,249,0.25)', letterSpacing: '0.05em' }}>
        BUILT FOR EVERY INDUSTRY
      </div>

      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </section>
  );
}
