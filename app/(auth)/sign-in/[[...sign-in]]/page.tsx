'use client';

import AuthShell from '@/components/auth/AuthShell';
import { isClerkEnabled } from '@/lib/clerkEnabled';
import { SignIn } from '@clerk/nextjs';
import { useThemeStyles } from '@/hooks/useThemeStyles';

export default function SignInPage() {
  const t = useThemeStyles();
  if (!isClerkEnabled()) return <AuthShell variant="sign-in" />;
  return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'grid', placeItems: 'center', padding: 24 }}>
      <SignIn />
    </div>
  );
}
