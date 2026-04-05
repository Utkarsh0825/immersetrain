import {
  exitDocumentFullscreen,
  requestElementFullscreen,
  tryLockLandscapeForHeadset,
} from '@/lib/requestFullscreen';

/**
 * iPhone / iPad / iOS WebKit (includes “Chrome” on iOS): no reliable fullscreen on a div.
 * YouTube-style path there is native <video> fullscreen; our 360 view stays WebGL, so we use a
 * fixed “pseudo-fullscreen” shell + scroll lock + safe-area padding (same gesture as Start).
 */
export function isAppleMobileWebKit(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/iPad|iPhone|iPod/i.test(ua)) return true;
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
}

let iosScrollLockY = 0;

function applyIOSPseudoImmersive(root: HTMLElement): void {
  if (root.getAttribute('data-train-ios-immersive') === 'true') return;
  root.setAttribute('data-train-ios-immersive', 'true');
  root.classList.add('train-shell-ios-immersive');

  iosScrollLockY = typeof window !== 'undefined' ? window.scrollY || window.pageYOffset : 0;
  document.documentElement.style.overflow = 'hidden';
  const body = document.body;
  body.style.overflow = 'hidden';
  body.style.position = 'fixed';
  body.style.width = '100%';
  body.style.height = '100%';
  body.style.top = `-${iosScrollLockY}px`;
}

/** Same user gesture as “Start”: real fullscreen where supported, else iOS pseudo-immersive. */
export function enterTrainImmersive(root: HTMLElement | null): void {
  if (!root || typeof document === 'undefined') return;

  requestElementFullscreen(root);
  tryLockLandscapeForHeadset();

  const tryIOSFallback = () => {
    if (document.fullscreenElement === root) return;
    if (!isAppleMobileWebKit()) return;
    applyIOSPseudoImmersive(root);
  };

  queueMicrotask(tryIOSFallback);
  requestAnimationFrame(tryIOSFallback);
  window.setTimeout(tryIOSFallback, 120);
}

export function exitTrainImmersive(): void {
  exitDocumentFullscreen();

  const root = document.querySelector('[data-train-ios-immersive="true"]') as HTMLElement | null;
  if (root) {
    root.removeAttribute('data-train-ios-immersive');
    root.classList.remove('train-shell-ios-immersive');
  }

  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.width = '';
  document.body.style.height = '';
  document.body.style.top = '';

  const y = iosScrollLockY;
  iosScrollLockY = 0;
  if (typeof window !== 'undefined' && y) {
    window.scrollTo(0, y);
  }
}
