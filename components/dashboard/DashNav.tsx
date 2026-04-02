'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layers, LayoutDashboard, Shield } from 'lucide-react';

export default function DashNav() {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', icon: <LayoutDashboard size={14} />, label: 'Dashboard' },
    { href: '/admin', icon: <Shield size={14} />, label: 'Admin' },
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
      borderBottom: '1px solid rgba(124,58,237,0.12)',
      background: 'rgba(4,4,15,0.9)', backdropFilter: 'blur(24px)',
      padding: '0 24px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(124,58,237,0.4)',
          }}>
            <Layers size={15} color="white" strokeWidth={2} />
          </div>
          <span style={{ fontFamily: 'var(--font-syne, system-ui)', fontWeight: 800, fontSize: 16, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
            ImmerseTrain
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {links.map(({ href, icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 9,
                color: active ? '#f1f5f9' : 'rgba(241,245,249,0.4)',
                background: active ? 'rgba(124,58,237,0.12)' : 'transparent',
                border: active ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent',
                textDecoration: 'none', fontSize: 14, fontWeight: 600,
                transition: 'all 0.2s',
              }}>
                {icon} {label}
              </Link>
            );
          })}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '5px 14px', borderRadius: 100,
          background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.18)',
          fontSize: 12, fontWeight: 700, color: '#a78bfa',
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            background: 'rgba(124,58,237,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, color: '#c4b5fd', fontWeight: 800,
          }}>
            D
          </div>
          Demo Mode
        </div>
      </div>
    </nav>
  );
}
