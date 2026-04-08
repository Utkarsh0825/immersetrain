'use client';

import AuthShell from '@/components/auth/AuthShell';
import { isClerkEnabled } from '@/lib/clerkEnabled';
import { SignUp } from '@clerk/nextjs';
import { useThemeStyles } from '@/hooks/useThemeStyles';

export default function SignUpPage() {
  const t = useThemeStyles();
  if (!isClerkEnabled()) return <AuthShell variant="sign-up" />;
  return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'grid', placeItems: 'center', padding: 24 }}>
      <SignUp />
    </div>
  );
}
