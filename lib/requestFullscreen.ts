/**
 * Request browser fullscreen on a node (same user gesture as the call — required on mobile).
 * iOS Safari only reliably fullscreens native video; we still try standard + webkit APIs on the shell.
 */
export function requestElementFullscreen(el: HTMLElement | null): void {
  if (!el || typeof document === 'undefined') return;
  if (document.fullscreenElement === el) return;

  type WithLegacy = HTMLElement & {
    webkitRequestFullscreen?: () => void | Promise<void>;
    mozRequestFullScreen?: () => void | Promise<void>;
    msRequestFullscreen?: () => void | Promise<void>;
  };
  const node = el as WithLegacy;
  const tryCall = (fn: (() => void | Promise<void>) | undefined) => {
    if (typeof fn !== 'function') return false;
    void Promise.resolve(fn.call(el)).catch(() => {});
    return true;
  };
  if (tryCall(node.requestFullscreen)) return;
  if (tryCall(node.webkitRequestFullscreen)) return;
  if (tryCall(node.mozRequestFullScreen)) return;
  tryCall(node.msRequestFullscreen);
}

export function exitDocumentFullscreen(): void {
  if (typeof document === 'undefined') return;
  const doc = document as Document & {
    webkitExitFullscreen?: () => Promise<void>;
    mozCancelFullScreen?: () => Promise<void>;
    msExitFullscreen?: () => Promise<void>;
  };
  const exit =
    document.exitFullscreen?.bind(document) ||
    doc.webkitExitFullscreen?.bind(document) ||
    doc.mozCancelFullScreen?.bind(document) ||
    doc.msExitFullscreen?.bind(document);
  if (typeof exit === 'function') {
    void Promise.resolve(exit()).catch(() => {});
  }
}

/** Best-effort landscape lock for phone-in-headset (may reject if not fullscreen yet). */
export function tryLockLandscapeForHeadset(): void {
  if (typeof screen === 'undefined') return;
  const orient = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
  if (typeof orient?.lock !== 'function') return;
  void orient.lock('landscape').catch(() => {});
}
