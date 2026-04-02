import { CLERK_READY } from '@/lib/clerkReady';
import DashNav from '@/components/dashboard/DashNav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (CLERK_READY) {
    const { auth } = await import('@clerk/nextjs/server');
    const { redirect } = await import('next/navigation');
    const { userId } = await auth();
    if (!userId) redirect('/sign-in');
  }

  return (
    <div style={{ minHeight: '100vh', background: '#04040f', color: '#f1f5f9' }}>
      <DashNav clerkReady={CLERK_READY} />
      {CLERK_READY && <ClerkUserButton />}
      <main style={{ paddingTop: 64 }}>
        {children}
      </main>
    </div>
  );
}

async function ClerkUserButton() {
  const { UserButton } = await import('@clerk/nextjs');
  return (
    <div style={{ position: 'fixed', top: 14, right: 24, zIndex: 50 }}>
      <UserButton afterSignOutUrl="/" />
    </div>
  );
}
