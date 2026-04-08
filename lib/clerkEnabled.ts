export function isClerkEnabled(): boolean {
  // This env var is inlined in the client bundle by Next.
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}

