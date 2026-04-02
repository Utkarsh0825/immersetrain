/**
 * True only when Supabase env vars look like real credentials (not placeholders).
 * Used server-side for API routes and client-side for offline-only UX.
 */
export function isSupabaseConfigured(): boolean {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();

  if (!url) return false;
  const u = url.toLowerCase();
  if (u.includes('replace_me') || u.includes('xxx') || u.includes('placeholder')) return false;
  if (!u.startsWith('https://') || !u.includes('supabase')) return false;

  // Server: require service role (not exposed to browser)
  if (typeof window === 'undefined') {
    if (!serviceKey) return false;
    if (serviceKey.includes('REPLACE') || serviceKey.includes('xxx') || serviceKey.length < 40) {
      return false;
    }
  }

  return true;
}

/** Client-safe: detect placeholder URL from NEXT_PUBLIC_* only (no secret on client). */
export function isSupabaseUrlPlaceholder(): boolean {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim();
  if (!url) return true;
  const u = url.toLowerCase();
  return u.includes('replace_me') || u.includes('xxx') || u.includes('placeholder');
}
