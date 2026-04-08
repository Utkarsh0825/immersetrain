import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Creator platform guard (demo-safe):
 * - /train/* stays public
 * - /api/* stays accessible
 * - creator surfaces require onboarding (profile exists + onboarded)
 *
 * In this repo we currently run in demo auth mode (client has a stable demo user).
 * When Clerk is wired in, replace DEMO_USER_ID with the authenticated userId.
 */
const DEMO_USER_ID = 'demo-user-001';

export default async function proxy(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  const isApi = pathname.startsWith('/api/');
  const isTrain = pathname.startsWith('/train/');
  if (isApi || isTrain) return NextResponse.next();

  const needsProfile =
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/') ||
    pathname === '/create' ||
    pathname === '/onboarding';

  if (!needsProfile) return NextResponse.next();
  if (pathname === '/onboarding') return NextResponse.next();

  try {
    const res = await fetch(`${origin}/api/profile?userId=${encodeURIComponent(DEMO_USER_ID)}`, {
      headers: { accept: 'application/json' },
    });
    const data = await res.json().catch(() => null);
    const onboarded = Boolean(data?.profile?.onboarded);
    if (!data?.exists || !onboarded) {
      const url = request.nextUrl.clone();
      url.pathname = '/onboarding';
      return NextResponse.redirect(url);
    }
  } catch {
    // If guard fails, allow access (avoids blocking demo if API temporarily unavailable)
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
