'use client';
import { CLERK_READY } from '@/lib/clerkReady';

const DEMO_USER = {
  fullName: 'Demo Trainee',
  firstName: 'Demo',
  primaryEmailAddress: { emailAddress: 'demo@immersetrain.com' },
};

export function useCurrentUser() {
  if (!CLERK_READY) {
    return { user: DEMO_USER, isLoaded: true };
  }
  // When CLERK_READY is false there is no ClerkProvider; we must not import useUser at module scope.
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- Clerk only when provider exists (CLERK_READY is build-time constant)
  const { useUser } = require('@clerk/nextjs') as typeof import('@clerk/nextjs');
  // eslint-disable-next-line react-hooks/rules-of-hooks -- same branch for entire build
  return useUser();
}
