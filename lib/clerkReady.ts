// A real Clerk publishable key looks like:
//   pk_test_<base64-encoded-long-string>
// and is always longer than 60 characters.
// Placeholder values like "pk_test_REPLACE_WITH_YOUR_KEY" are short — we use that to detect demo mode.

export const CLERK_READY =
  typeof process !== 'undefined' &&
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith('pk_') &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.length > 60;
