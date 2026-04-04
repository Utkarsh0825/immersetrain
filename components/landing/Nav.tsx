'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { useThemeStyles } from '@/hooks/useThemeStyles';

const NAV_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Demo', href: '/demo' },
];

const spring = { type: 'spring' as const, stiffness: 400, damping: 30 };

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" className="overflow-visible">
      <motion.line
        x1="4" y1="7" x2="20" y2="7"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        animate={open ? { rotate: 45, y: 5, x1: 4, y1: 12, x2: 20, y2: 12 } : { rotate: 0, y: 0 }}
        transition={spring}
      />
      <motion.line
        x1="4" y1="12" x2="20" y2="12"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        animate={open ? { opacity: 0, x: 8 } : { opacity: 1, x: 0 }}
        transition={spring}
      />
      <motion.line
        x1="4" y1="17" x2="20" y2="17"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        animate={open ? { rotate: -45, y: -5, x1: 4, y1: 12, x2: 20, y2: 12 } : { rotate: 0, y: 0 }}
        transition={spring}
      />
    </svg>
  );
}

export default function Nav() {
  const { theme, toggleTheme } = useTheme();
  const t = useThemeStyles();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const scrollToTop = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 28, delay: 0.1 }}
        className="fixed top-0 left-0 right-0 z-50 px-6"
        style={{
          background:
            scrolled ? t.navBg : t.isDark ? 'rgba(6,6,8,0.78)' : 'transparent',
          backdropFilter: scrolled || t.isDark ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled || t.isDark ? 'blur(20px)' : 'none',
          borderBottom:
            scrolled || t.isDark
              ? `1px solid ${scrolled ? t.navBorder : 'rgba(255,255,255,0.06)'}`
              : '1px solid transparent',
          transition: 'background 0.3s, backdrop-filter 0.3s, border-bottom 0.3s',
        }}
      >
        <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between gap-3">
          {/* Logo — reserve space on small screens so it never collides with the menu control */}
          <a
            href="#"
            onClick={scrollToTop}
            className="font-clash min-w-0 shrink text-lg font-bold tracking-tight text-[var(--text-primary)] no-underline max-[420px]:max-w-[min(100%,11rem)] max-[420px]:truncate"
          >
            ImmerseTrain
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => {
              const isExternal = link.href.startsWith('/');
              const El = isExternal ? Link : 'a';
              return (
                <El
                  key={link.label}
                  href={link.href}
                  className="nav-link group relative py-1 text-sm font-medium text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--text-primary)]"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-[var(--indigo)] transition-transform duration-300 group-hover:scale-x-100" />
                </El>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex shrink-0 items-center gap-4 sm:gap-5">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: `1px solid ${t.border}`,
                background: t.surface,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                color: t.textFaint,
              }}
            >
              {theme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
            <Link
              href="/sign-in"
              className="hidden text-sm font-medium text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--text-primary)] md:inline"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="hidden rounded-full bg-[var(--indigo)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(91,76,255,0.35)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_4px_32px_rgba(91,76,255,0.5)] md:inline-flex"
            >
              Start Free
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="relative z-[110] text-[var(--text-primary)] md:hidden"
              aria-label="Toggle menu"
            >
              <HamburgerIcon open={mobileOpen} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex flex-col backdrop-blur-2xl md:hidden"
            style={{ background: t.isDark ? 'rgba(6,6,8,0.97)' : 'rgba(255,255,255,0.97)' }}
          >
            <div className="flex h-[68px] shrink-0 items-center px-6">
              <span className="font-clash text-lg font-bold text-[var(--text-primary)]">
                ImmerseTrain
              </span>
            </div>

            <nav className="flex flex-1 flex-col justify-center gap-2 px-8">
              {NAV_LINKS.map((link, i) => {
                const isExternal = link.href.startsWith('/');
                const El = isExternal ? Link : 'a';
                return (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30, delay: i * 0.06 }}
                  >
                    <El
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block py-4 font-clash text-3xl font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                    >
                      {link.label}
                    </El>
                  </motion.div>
                );
              })}
            </nav>

            <div className="flex flex-col gap-3 px-8 pb-12">
              <Link
                href="/sign-in"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl py-4 text-center text-base font-medium text-[var(--text-secondary)]"
                style={{ border: `1px solid ${t.border}` }}
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl bg-[var(--indigo)] py-4 text-center text-base font-semibold text-white shadow-[0_0_30px_rgba(91,76,255,0.35)]"
              >
                Start Free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
