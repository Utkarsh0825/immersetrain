import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { CLERK_READY } from '@/lib/clerkReady';

/**
 * Public routes: no redirect to sign-in. API routes are public at the edge;
 * each handler uses auth() / Supabase as needed (avoids breaking fetch JSON).
 */
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api(.*)',
  '/train(.*)',
  '/results(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (!CLERK_READY) {
    return NextResponse.next();
  }
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
