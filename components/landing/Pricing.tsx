'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, Zap, Building2 } from 'lucide-react';
import Link from 'next/link';

const PLANS = [
  {
    name: 'Starter',
    price: '$1,000',
    period: '/year',
    desc: 'Perfect for a single team or department',
    popular: true,
    features: ['10 team members', '1 training scenario', 'Browser-based (no install)', 'Real-time quiz scoring', 'Basic analytics dashboard', 'Email support'],
    cta: 'Start Free Trial',
    href: '/sign-up',
  },
  {
    name: 'Team',
    price: '$3,000',
    period: '/year',
    desc: 'For organizations scaling across teams',
    popular: false,
    features: ['50 team members', 'Unlimited scenarios', 'Advanced analytics + CSV export', 'Meta Quest WebXR ready', 'Custom branding', 'Priority support + onboarding'],
    cta: 'Get Started',
    href: '/sign-up',
  },
];

export default function Pricing() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section id="pricing" ref={ref} style={{ padding: '120px 24px', background: '#04040f' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} style={{ textAlign: 'center', marginBottom: 72 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7c3aed', fontWeight: 700, marginBottom: 14 }}>Pricing</p>
          <h2 style={{ fontFamily: 'var(--font-syne, system-ui)', fontSize: 'clamp(30px, 5vw, 56px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, color: '#f1f5f9', marginBottom: 16 }}>
            Transparent pricing.<br /><span style={{ color: 'rgba(241,245,249,0.3)' }}>No enterprise maze.</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(241,245,249,0.4)' }}>
            Compare: Uptale charges <span style={{ color: '#ef4444', fontWeight: 700 }}>$17,000/year</span> for similar features.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {PLANS.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.12 }}
              style={{
                borderRadius: 24, padding: plan.popular ? 2 : 0,
                background: plan.popular ? 'linear-gradient(135deg, #7c3aed, #2563eb)' : 'transparent',
                border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.09)',
                position: 'relative',
              }}
            >
              {plan.popular && (
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', borderRadius: 100, padding: '5px 16px', fontSize: 11, fontWeight: 800, color: 'white', letterSpacing: '0.07em', textTransform: 'uppercase', whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(124,58,237,0.5)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Zap size={10} fill="white" /> Most Popular
                </div>
              )}
              <div style={{ background: '#0a0a1a', borderRadius: plan.popular ? 22 : 23, padding: '36px 32px', height: '100%' }}>
                <h3 style={{ fontFamily: 'var(--font-syne, system-ui)', fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>{plan.name}</h3>
                <p style={{ fontSize: 14, color: 'rgba(241,245,249,0.4)', marginBottom: 28 }}>{plan.desc}</p>
                <div style={{ marginBottom: 32 }}>
                  <span style={{ fontFamily: 'var(--font-syne, system-ui)', fontSize: 52, fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.05em' }}>{plan.price}</span>
                  <span style={{ fontSize: 16, color: 'rgba(241,245,249,0.35)', marginLeft: 4 }}>{plan.period}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginBottom: 36 }}>
                  {plan.features.map((feat, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Check size={11} color="#7c3aed" strokeWidth={3} />
                      </div>
                      <span style={{ fontSize: 14, color: 'rgba(241,245,249,0.6)' }}>{feat}</span>
                    </div>
                  ))}
                </div>
                <Link href={plan.href} style={{
                  display: 'block', textAlign: 'center', padding: '14px', borderRadius: 12, textDecoration: 'none',
                  background: plan.popular ? 'linear-gradient(135deg, #7c3aed, #2563eb)' : 'rgba(255,255,255,0.06)',
                  color: 'white', fontWeight: 700, fontSize: 15,
                  border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: plan.popular ? '0 4px 24px rgba(124,58,237,0.4)' : 'none',
                }}>{plan.cta}</Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enterprise */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.35 }}
          id="enterprise"
          style={{ marginTop: 20, padding: '28px 32px', borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={20} color="#7c3aed" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-syne, system-ui)', fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 3 }}>Enterprise Plan</div>
              <div style={{ fontSize: 14, color: 'rgba(241,245,249,0.4)' }}>500+ users · Custom scenarios · SSO · Dedicated support · SLA</div>
            </div>
          </div>
          <Link href="/sign-up" style={{ padding: '12px 24px', borderRadius: 10, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', color: '#a78bfa', fontWeight: 700, fontSize: 14, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Talk to Sales →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
