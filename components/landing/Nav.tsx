'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Menu, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const NAV_LINKS = [
  { label: 'Platform', href: '#platform' },
  { label: 'Industries', href: '#industries' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Enterprise', href: '#enterprise' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      <style>{`
        .nav-link {
          font-size: 14px; font-weight: 500;
          color: rgba(241,245,249,0.55);
          text-decoration: none;
          transition: color 0.2s ease;
          padding: 4px 0;
          position: relative;
        }
        .nav-link::after {
          content: '';
          position: absolute; bottom: -2px; left: 0; right: 0; height: 1px;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.25s ease;
        }
        .nav-link:hover { color: #f1f5f9; }
        .nav-link:hover::after { transform: scaleX(1); }
        .nav-cta {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 20px; border-radius: 10px;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          color: white; font-weight: 700; font-size: 14px;
          text-decoration: none;
          box-shadow: 0 0 30px rgba(124,58,237,0.35);
          transition: all 0.25s ease;
        }
        .nav-cta:hover { transform: translateY(-1px); box-shadow: 0 4px 40px rgba(124,58,237,0.5); }
        .nav-signin { font-size: 14px; font-weight: 500; color: rgba(241,245,249,0.55); text-decoration: none; transition: color 0.2s; }
        .nav-signin:hover { color: #f1f5f9; }
      `}</style>

      <motion.header
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          padding: '0 24px',
          transition: 'all 0.4s ease',
          background: scrolled ? 'rgba(4,4,15,0.88)' : 'transparent',
          backdropFilter: scrolled ? 'blur(24px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(124,58,237,0.15)' : '1px solid transparent',
          boxShadow: scrolled ? '0 0 40px rgba(124,58,237,0.05)' : 'none',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(124,58,237,0.5)',
            }}>
              <Layers size={17} color="white" strokeWidth={2} />
            </div>
            <span style={{ fontFamily: 'var(--font-syne, system-ui)', fontWeight: 800, fontSize: 18, color: '#f1f5f9', letterSpacing: '-0.03em' }}>
              ImmerseTrain
            </span>
          </Link>

          {/* Desktop links */}
          <nav className="hidden md:flex" style={{ alignItems: 'center', gap: 32 }}>
            {NAV_LINKS.map(l => (
              <a key={l.label} href={l.href} className="nav-link">{l.label}</a>
            ))}
          </nav>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link href="/sign-in" className="nav-signin hidden md:inline">Sign in</Link>
            <Link href="/sign-up" className="nav-cta">
              Start Free <ChevronRight size={14} />
            </Link>
            <button
              className="md:hidden"
              onClick={() => setMobileOpen(v => !v)}
              style={{ background: 'none', border: 'none', color: '#f1f5f9', cursor: 'pointer', padding: 4 }}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed', top: 68, left: 0, right: 0, zIndex: 99,
              background: 'rgba(4,4,15,0.97)', backdropFilter: 'blur(24px)',
              borderBottom: '1px solid rgba(124,58,237,0.15)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '20px 24px 28px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {NAV_LINKS.map((l, i) => (
                <motion.a
                  key={l.label}
                  href={l.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => setMobileOpen(false)}
                  style={{ padding: '14px 0', fontSize: 18, fontWeight: 600, color: 'rgba(241,245,249,0.7)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                >
                  {l.label}
                </motion.a>
              ))}
              <Link href="/sign-up" onClick={() => setMobileOpen(false)} style={{
                marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px', borderRadius: 12,
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                color: 'white', fontWeight: 700, fontSize: 16, textDecoration: 'none',
              }}>
                Start Free Trial
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
