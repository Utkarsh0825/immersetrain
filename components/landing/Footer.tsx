'use client';
import { motion } from 'framer-motion';
import { Layers, ArrowRight, Twitter, Linkedin, Github } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <>
      {/* ── Final CTA ── */}
      <section style={{ padding: '100px 24px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #0d0520 0%, #050e2a 50%, #0d0520 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(124,58,237,0.06) 1px, transparent 1px)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 300, background: 'radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <h2 style={{ fontFamily: 'var(--font-syne, system-ui)', fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 20 }}>
              Ready to transform how<br />your team learns?
            </h2>
            <p style={{ fontSize: 18, color: 'rgba(241,245,249,0.5)', marginBottom: 40, lineHeight: 1.6 }}>
              First scenario free. No credit card required.<br />Be live in under an hour.
            </p>
            <Link href="/sign-up" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '18px 36px', borderRadius: 14,
              background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
              color: 'white', fontWeight: 800, fontSize: 17, textDecoration: 'none',
              boxShadow: '0 0 60px rgba(124,58,237,0.45), 0 16px 48px rgba(0,0,0,0.4)',
              letterSpacing: '-0.01em',
            }}>
              Start Free Trial <ArrowRight size={18} />
            </Link>
            <p style={{ marginTop: 20, fontSize: 13, color: 'rgba(241,245,249,0.25)' }}>
              No install · Works in any browser · Meta Quest ready
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#020208', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '56px 24px 36px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 48, justifyContent: 'space-between', marginBottom: 48 }}>
            {/* Brand */}
            <div style={{ maxWidth: 260 }}>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #7c3aed, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers size={14} color="white" />
                </div>
                <span style={{ fontFamily: 'var(--font-syne, system-ui)', fontWeight: 800, fontSize: 16, color: '#f1f5f9' }}>ImmerseTrain</span>
              </Link>
              <p style={{ fontSize: 13, color: 'rgba(241,245,249,0.3)', lineHeight: 1.65, marginBottom: 20 }}>
                360° immersive scenario training for every industry. No headset required.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                {[Twitter, Linkedin, Github].map((Icon, i) => (
                  <a key={i} href="#" style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(241,245,249,0.4)', textDecoration: 'none' }}>
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {[
              { title: 'Product', links: ['Platform', 'Industries', 'Pricing', 'Enterprise', 'Changelog'] },
              { title: 'Resources', links: ['Documentation', 'API Reference', 'Blog', 'Case Studies', 'Status'] },
              { title: 'Company', links: ['About', 'Careers', 'Contact', 'Privacy', 'Terms'] },
            ].map(col => (
              <div key={col.title}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(241,245,249,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>{col.title}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map(link => (
                    <a key={link} href="#" style={{ fontSize: 14, color: 'rgba(241,245,249,0.35)', textDecoration: 'none' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'rgba(241,245,249,0.7)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(241,245,249,0.35)')}
                    >{link}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 13, color: 'rgba(241,245,249,0.2)' }}>© 2025 ImmerseTrain. All rights reserved.</p>
            <p style={{ fontSize: 13, color: 'rgba(241,245,249,0.15)' }}>Train anyone. Anywhere. In 360°.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
