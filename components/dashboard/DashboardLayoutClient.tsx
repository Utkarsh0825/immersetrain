'use client';

import DashNav from '@/components/dashboard/DashNav';
import { useThemeStyles } from '@/hooks/useThemeStyles';

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const t = useThemeStyles();
  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text }}>
      <DashNav />
      <main style={{ minHeight: 'calc(100vh - 64px)', background: t.bg }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 18px' }}>{children}</div>
      </main>
    </div>
  );
}
