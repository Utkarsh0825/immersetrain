import DashNav from '@/components/dashboard/DashNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#04040f', color: '#f1f5f9' }}>
      <DashNav />
      <main style={{ paddingTop: 64 }}>{children}</main>
    </div>
  );
}
