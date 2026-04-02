import { CLERK_READY } from '@/lib/clerkReady';
import { Layers } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function SignUpPage() {
  if (!CLERK_READY) redirect('/dashboard');

  const { SignUp } = await import('@clerk/nextjs');

  return (
    <div style={{
      minHeight: '100vh', background: '#04040f',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 700, height: 700,
        background: 'radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, rgba(37,99,235,0.05) 40%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(124,58,237,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.025) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 40, position: 'relative' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 30px rgba(124,58,237,0.45)',
        }}>
          <Layers size={20} color="white" strokeWidth={2} />
        </div>
        <span style={{
          fontFamily: 'var(--font-syne, system-ui)', fontWeight: 800, fontSize: 22,
          color: '#f1f5f9', letterSpacing: '-0.03em',
        }}>
          ImmerseTrain
        </span>
      </Link>

      <div style={{ position: 'relative' }}>
        <SignUp
          appearance={{
            variables: {
              colorBackground: '#0a0a18',
              colorInputBackground: '#12121f',
              colorInputText: '#f1f5f9',
              colorText: '#f1f5f9',
              colorTextSecondary: 'rgba(241,245,249,0.5)',
              colorPrimary: '#7c3aed',
              colorDanger: '#ef4444',
              borderRadius: '12px',
              fontFamily: 'var(--font-inter, system-ui)',
            },
            elements: {
              card: {
                border: '1px solid rgba(124,58,237,0.15)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 40px rgba(124,58,237,0.05)',
              },
              headerTitle: {
                fontFamily: 'var(--font-syne, system-ui)',
                fontWeight: 800,
              },
            },
          }}
        />
      </div>
    </div>
  );
}
