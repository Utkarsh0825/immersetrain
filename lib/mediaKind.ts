/** Detect equirect / AI-world stills vs video URLs. */
export function isEquirectImageUrl(url: string): boolean {
  if (!url) return false;
  const u = url.toLowerCase();
  if (u.startsWith('data:image/')) return true;
  if (/\.(jpg|jpeg|png|webp|avif|gif)(\?|#|$)/i.test(u)) return true;
  if (u.includes('/ai-worlds/') || u.includes('ai-generated')) return true;
  return false;
}
