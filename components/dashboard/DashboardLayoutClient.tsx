'use client';

import Sidebar, { SIDEBAR_W } from '@/components/dashboard/Sidebar';
import { useThemeStyles } from '@/hooks/useThemeStyles';

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const t = useThemeStyles();
  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text }}>
      <Sidebar />
      <main
        className="dashboard-main"
        style={{ marginLeft: SIDEBAR_W, minHeight: '100vh', background: t.bg }}
      >
        {children}
      </main>
      <style>{`
        @media (max-width: 768px) {
          .dashboard-main {
            margin-left: 0 !important;
            padding: 72px 20px 28px 64px;
          }
        }
      `}</style>
    </div>
  );
}
