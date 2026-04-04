'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Compass,
  BarChart3,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import ThemeToggleButton from '@/components/ThemeToggleButton';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Scenarios', href: '/dashboard/scenarios', icon: Compass },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export const SIDEBAR_W = 240;

function NavItem({
  item,
  active,
  t,
}: {
  item: (typeof NAV_ITEMS)[0];
  active: boolean;
  t: ReturnType<typeof useThemeStyles>;
}) {
  const [hovered, setHovered] = useState(false);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        borderRadius: 10,
        textDecoration: 'none',
        fontSize: 14,
        fontWeight: active ? 600 : 500,
        fontFamily: 'var(--font-satoshi)',
        color: active || hovered ? t.text : t.textSecondary,
        background: active
          ? 'rgba(91,76,255,0.12)'
          : hovered
            ? t.surfaceHover
            : 'transparent',
        border: active ? '1px solid rgba(91,76,255,0.22)' : '1px solid transparent',
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
    >
      {active && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 3,
            height: 20,
            borderRadius: 2,
            background: '#5B4CFF',
          }}
        />
      )}
      <Icon
        size={18}
        style={{
          color: active ? '#5B4CFF' : 'inherit',
          transition: 'color 0.2s',
        }}
      />
      {item.label}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useThemeStyles();
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const sidebarBase: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_W,
    background: t.isDark ? 'rgba(10,10,16,0.96)' : 'rgba(255,255,255,0.94)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderRight: `1px solid ${t.border}`,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 90,
    padding: '28px 16px 20px',
  };

  const logoRow: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '0 4px',
    marginBottom: 36,
    textDecoration: 'none',
  };

  const logoMark: React.CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: 10,
    background: 'linear-gradient(135deg, #5B4CFF, #00D4FF)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginRight: 2,
    boxShadow: '0 0 20px rgba(91,76,255,0.3)',
  };

  const navSection: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    flex: 1,
  };

  const bottomSection: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px',
    borderRadius: 12,
    background: t.surface,
    border: `1px solid ${t.border}`,
  };

  const overlay: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: t.isDark ? 'rgba(0,0,0,0.55)' : 'rgba(15,15,20,0.35)',
    zIndex: 89,
  };

  const mobileToggle: React.CSSProperties = {
    position: 'fixed',
    top: 16,
    left: 16,
    zIndex: 91,
    width: 40,
    height: 40,
    borderRadius: 10,
    background: t.surface,
    backdropFilter: 'blur(12px)',
    border: `1px solid ${t.border}`,
    alignItems: 'center',
    justifyContent: 'center',
    color: t.text,
    cursor: 'pointer',
  };

  const sidebarContent = (
    <>
      <Link href="/dashboard" style={logoRow}>
        <div style={logoMark}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 1L14.5 5V11L8 15L1.5 11V5L8 1Z"
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M8 5.5L11 7.5V10.5L8 12.5L5 10.5V7.5L8 5.5Z"
              fill="white"
              fillOpacity="0.6"
            />
          </svg>
        </div>
        <span
          style={{
            fontFamily: 'var(--font-clash)',
            fontWeight: 700,
            fontSize: 17,
            color: t.text,
            letterSpacing: '-0.02em',
          }}
        >
          ImmerseTrain
        </span>
      </Link>

      <div style={navSection}>
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);
          return <NavItem key={item.href} item={item} active={active} t={t} />;
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
        <ThemeToggleButton />
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 12px',
            borderRadius: 10,
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 500,
            fontFamily: 'var(--font-satoshi)',
            color: t.textSecondary,
            transition: 'color 0.2s',
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Website
        </Link>
      </div>

      <div style={bottomSection}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(91,76,255,0.35), rgba(0,212,255,0.35))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            color: '#5B4CFF',
            flexShrink: 0,
          }}
        >
          D
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: t.text,
              fontFamily: 'var(--font-satoshi)',
            }}
          >
            Demo User
          </div>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 6,
              background: 'rgba(91,76,255,0.12)',
              border: '1px solid rgba(91,76,255,0.22)',
              fontSize: 10,
              fontWeight: 700,
              color: '#5B4CFF',
              letterSpacing: '0.04em',
            }}
          >
            DEMO
          </span>
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className="sidebar-desktop" style={sidebarBase}>
        {sidebarContent}
      </aside>

      <button
        className="sidebar-mobile-toggle"
        style={mobileToggle}
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={overlay}
              onClick={closeMobile}
            />
            <motion.aside
              initial={{ x: -SIDEBAR_W }}
              animate={{ x: 0 }}
              exit={{ x: -SIDEBAR_W }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              style={sidebarBase}
              className="sidebar-mobile-drawer"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .sidebar-mobile-toggle {
          display: none;
          align-items: center;
          justify-content: center;
        }
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .sidebar-mobile-toggle { display: flex !important; }
        }
      `}</style>
    </>
  );
}
