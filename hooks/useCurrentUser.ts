'use client';

const DEMO_USER = {
  id: 'demo-user-001',
  userId: 'demo-user-001',
  firstName: 'Demo',
  lastName: 'User',
  fullName: 'Demo User',
  primaryEmailAddress: { emailAddress: 'demo@immersetrain.com' },
  emailAddresses: [{ emailAddress: 'demo@immersetrain.com' }],
};

/** Demo mode: no Clerk — fixed user for training + dashboards. */
export function useCurrentUser() {
  return {
    user: DEMO_USER,
    isLoaded: true,
    isSignedIn: true,
  };
}
