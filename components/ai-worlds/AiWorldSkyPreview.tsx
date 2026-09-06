'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    AFRAME?: unknown;
  }
}

const AFRAME_SCRIPT_ID = 'immersetrain-aframe-ai-worlds';

function loadAframeOnce(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.AFRAME) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(AFRAME_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      queueMicrotask(() => {
        if (window.AFRAME) resolve();
      });
      return;
    }
    const s = document.createElement('script');
    s.id = AFRAME_SCRIPT_ID;
    s.src = 'https://aframe.io/releases/1.6.0/aframe.min.js';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('A-Frame failed to load'));
    document.head.appendChild(s);
  });
}

export default function AiWorldSkyPreview({ imageUrl }: { imageUrl: string | null }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const mount = async () => {
      const el = containerRef.current;
      if (!el) return;
      if (!imageUrl) {
        el.innerHTML = '';
        return;
      }
      try {
        await loadAframeOnce();
      } catch {
        return;
      }
      if (cancelled || !containerRef.current) return;
      const safe = imageUrl.replace(/"/g, '&quot;');
      containerRef.current.innerHTML = `
        <a-scene
          embedded
          loading-screen="enabled: false"
          vr-mode-ui="enabled: false"
          style="width:100%;height:100%;position:absolute;inset:0"
          renderer="colorManagement: true"
        >
          <a-sky src="${safe}" rotation="0 -90 0"></a-sky>
          <a-camera look-controls="pointerLockEnabled: false" wasd-controls="enabled: false"></a-camera>
        </a-scene>
      `;
    };
    void mount();
    return () => {
      cancelled = true;
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [imageUrl]);

  if (!imageUrl) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: 320,
          display: 'grid',
          placeItems: 'center',
          background:
            'radial-gradient(ellipse at 30% 20%, rgba(91,76,255,0.18), transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(0,212,255,0.12), transparent 50%), #0a0a10',
          color: 'rgba(255,255,255,0.45)',
          fontFamily: 'var(--font-satoshi, system-ui)',
          fontSize: 14,
          textAlign: 'center',
          padding: 24,
        }}
      >
        Describe a workplace in the chat — your 360° world will appear here.
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 320, background: '#000' }}>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
      <p
        style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          right: 12,
          margin: 0,
          zIndex: 2,
          pointerEvents: 'none',
          fontSize: 12,
          color: 'rgba(255,255,255,0.55)',
          textShadow: '0 1px 4px rgba(0,0,0,0.8)',
          fontFamily: 'var(--font-satoshi, system-ui)',
        }}
      >
        Drag to look around your generated world
      </p>
    </div>
  );
}
