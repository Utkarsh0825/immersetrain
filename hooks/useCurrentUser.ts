'use client';

import { useUser } from '@clerk/nextjs';
import { isClerkEnabled } from '@/lib/clerkEnabled';

const DEMO_USER = {
  id: 'demo-user-001',
  userId: 'demo-user-001',
  firstName: 'Demo',
  lastName: 'User',
  fullName: 'Demo User',
  primaryEmailAddress: { emailAddress: 'demo@immersetrain.com' },
  emailAddresses: [{ emailAddress: 'demo@immersetrain.com' }],
};

export function useCurrentUser() {
  if (!isClerkEnabled()) {
    return { user: DEMO_USER as any, isLoaded: true, isSignedIn: true };
  }
  const { user, isLoaded, isSignedIn } = useUser();
  return { user: user as any, isLoaded, isSignedIn };
}
