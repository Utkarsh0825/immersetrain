'use client';
import { useEffect, useRef, useImperativeHandle, forwardRef, useState, useCallback } from 'react';
import { Play } from 'lucide-react';

export interface VideoPlayer360Handle {
  play: () => void;
  pause: () => void;
  getCurrentTime: () => number;
  onTimeUpdate: (cb: (time: number) => void) => () => void;
  /** Enter stereo / device-orientation VR (Cardboard, mobile Safari). */
  enterVR: () => void;
}

interface VideoPlayer360Props {
  videoUrl: string;
  onReady?: () => void;
}

declare global {
  interface Window {
    AFRAME?: unknown;
  }
}

type ASceneEl = HTMLElement & {
  hasLoaded?: boolean;
  enterVR?: () => void;
  enterFullscreen?: () => void;
};

const RETRY_DELAY_MS = 500;
const MAX_PLAY_RETRIES = 3;
const TEXTURE_BIND_DELAY_MS = 1000;

function waitCanPlay(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => resolve();
    video.addEventListener('canplay', done, { once: true });
    video.addEventListener('loadeddata', done, { once: true });
    video.addEventListener('error', done, { once: true });
  });
}

function waitSceneLoaded(scene: ASceneEl | null): Promise<void> {
  if (!scene) return Promise.resolve();
  if (scene.hasLoaded) return Promise.resolve();
  return new Promise((resolve) => {
    scene.addEventListener('loaded', () => resolve(), { once: true });
  });
}

async function playWithRetries(video: HTMLVideoElement): Promise<void> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < MAX_PLAY_RETRIES; attempt++) {
    try {
      video.muted = true;
      await video.play();
      await new Promise((r) => setTimeout(r, 120));
      try {
        video.muted = false;
        await video.play();
      } catch {
        /* some browsers need one muted play first */
      }
      return;
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      try {
        video.load();
      } catch {
        /* ignore */
      }
    }
  }
  throw lastErr;
}

function showVideosphere() {
  const sphere = document.querySelector('#immersive-sphere') as HTMLElement | null;
  if (sphere) {
    sphere.setAttribute('src', '#trainingvideo');
    sphere.setAttribute('visible', 'true');
  }
}

const VideoPlayer360 = forwardRef<VideoPlayer360Handle, VideoPlayer360Props>(
  ({ videoUrl, onReady }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const resolvedSrcRef = useRef('');
    const aframeLoaded = useRef(false);
    const timeCallbacks = useRef<Set<(t: number) => void>>(new Set());
    const [overlayState, setOverlayState] = useState<'visible' | 'fading' | 'gone'>('visible');
    const [videoBuffering, setVideoBuffering] = useState(false);
    const startInProgress = useRef(false);

    const attachVideoListeners = useCallback((videoEl: HTMLVideoElement, resolvedSrc: string) => {
      resolvedSrcRef.current = resolvedSrc;
      videoRef.current = videoEl;

      const onError = () => {
        console.error(
          '[VideoPlayer360] video error',
          resolvedSrc,
          videoEl.error?.code,
          videoEl.error?.message
        );
        const t = videoEl.currentSrc || resolvedSrc;
        if (t) {
          videoEl.src = '';
          videoEl.src = t;
          videoEl.load();
        }
      };

      videoEl.addEventListener('error', onError);
      videoEl.addEventListener('timeupdate', () => {
        timeCallbacks.current.forEach((cb) => cb(videoEl.currentTime));
      });
    }, []);

    const startVideoSequence = useCallback(async () => {
      if (startInProgress.current) return;
      startInProgress.current = true;
      try {
        const scene = document.querySelector('a-scene') as ASceneEl | null;
        await waitSceneLoaded(scene);

        const videoEl = document.getElementById('trainingvideo') as HTMLVideoElement | null;
        if (!videoEl) {
          console.error('[VideoPlayer360] no #trainingvideo');
          return;
        }

        videoRef.current = videoEl;
        videoEl.muted = true;

        try {
          videoEl.load();
        } catch {
          /* ignore */
        }

        await waitCanPlay(videoEl);
        await new Promise((r) => setTimeout(r, TEXTURE_BIND_DELAY_MS));

        try {
          await playWithRetries(videoEl);
        } catch (e) {
          console.error('[VideoPlayer360] play retries exhausted', e);
          videoEl.muted = true;
          await videoEl.play().catch(() => {});
        }

        showVideosphere();
      } finally {
        startInProgress.current = false;
        setVideoBuffering(false);
      }
    }, []);

    useImperativeHandle(ref, () => ({
      play: () => {
        const v = videoRef.current;
        if (!v) return;
        v.muted = true;
        void v
          .play()
          .then(() => {
            v.muted = false;
          })
          .catch(() => {});
      },
      pause: () => {
        videoRef.current?.pause();
      },
      getCurrentTime: () => videoRef.current?.currentTime ?? 0,
      onTimeUpdate: (cb) => {
        timeCallbacks.current.add(cb);
        return () => timeCallbacks.current.delete(cb);
      },
      enterVR: () => {
        const scene = document.querySelector('a-scene') as ASceneEl | null;
        if (scene?.enterVR) {
          scene.enterVR();
          return;
        }
        const anyScene = scene as unknown as { enterVR?: () => void };
        anyScene?.enterVR?.();
      },
    }));

    const handleStartClick = useCallback(() => {
      if (overlayState !== 'visible') return;
      setOverlayState('fading');
      window.setTimeout(() => {
        setOverlayState('gone');
        setVideoBuffering(true);
        void startVideoSequence();
      }, 500);
    }, [overlayState, startVideoSequence]);

    useEffect(() => {
      if (aframeLoaded.current || typeof window === 'undefined') return;
      aframeLoaded.current = true;

      const loadAFrame = () => {
        const origin = window.location.origin;
        const resolvedSrc = videoUrl.startsWith('/') ? `${origin}${videoUrl}` : videoUrl;
        resolvedSrcRef.current = resolvedSrc;

        const sceneHTML = `
          <a-scene
            embedded
            style="height:100%;width:100%;position:absolute;top:0;left:0"
            renderer="colorManagement: true; physicallyCorrectLights: false"
            loading-screen="enabled: false"
            vr-mode-ui="enabled: true"
            device-orientation-permission-ui="enabled: true"
          >
            <a-assets timeout="120000">
              <video
                id="trainingvideo"
                src="${resolvedSrc}"
                muted
                playsinline
                webkit-playsinline
                crossorigin="anonymous"
                loop="false"
                preload="auto"
                x-webkit-airplay="allow"
                style="display:none"
              ></video>
            </a-assets>
            <a-videosphere
              id="immersive-sphere"
              src="#trainingvideo"
              rotation="0 -90 0"
              visible="false"
            ></a-videosphere>
            <a-camera>
              <a-cursor
                color="#0066FF"
                fuse="true"
                fuse-timeout="1500"
                animation__mouseenter="property: scale; startEvents: mouseenter; easing: easeInCubic; dur: 150; to: 1.3 1.3 1.3"
                animation__mouseleave="property: scale; startEvents: mouseleave; easing: easeInCubic; dur: 150; to: 1 1 1"
              ></a-cursor>
            </a-camera>
          </a-scene>
        `;

        if (containerRef.current) {
          containerRef.current.innerHTML = sceneHTML;

          const waitForScene = () => {
            const scene = containerRef.current?.querySelector('a-scene') as ASceneEl | null;
            if (scene && scene.hasLoaded) {
              const videoEl = document.getElementById('trainingvideo') as HTMLVideoElement;
              if (videoEl) {
                attachVideoListeners(videoEl, resolvedSrc);
                onReady?.();
              }
            } else {
              scene?.addEventListener('loaded', () => {
                const videoEl = document.getElementById('trainingvideo') as HTMLVideoElement;
                if (videoEl) {
                  attachVideoListeners(videoEl, resolvedSrc);
                  onReady?.();
                }
              });
            }
          };

          setTimeout(waitForScene, 400);
        }
      };

      const run = () => {
        if (window.AFRAME) {
          loadAFrame();
          return;
        }
        const poly = document.createElement('script');
        poly.src = 'https://unpkg.com/webvr-polyfill@0.10.12/build/webvr-polyfill.js';
        poly.async = true;
        poly.onload = () => {
          const script = document.createElement('script');
          script.src = 'https://aframe.io/releases/1.6.0/aframe.min.js';
          script.onload = loadAFrame;
          script.onerror = () => console.error('Failed to load A-Frame');
          document.head.appendChild(script);
        };
        poly.onerror = () => {
          const script = document.createElement('script');
          script.src = 'https://aframe.io/releases/1.6.0/aframe.min.js';
          script.onload = loadAFrame;
          script.onerror = () => console.error('Failed to load A-Frame');
          document.head.appendChild(script);
        };
        document.head.appendChild(poly);
      };

      run();

      return () => {
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
      };
    }, [videoUrl, onReady, attachVideoListeners]);

    const showOverlay = overlayState !== 'gone';

    return (
      <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <div
          ref={containerRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            background: '#000',
            cursor: 'grab',
          }}
        />
        {videoBuffering && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 9998,
              background: 'rgba(0,0,0,0.92)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                border: '3px solid rgba(255,255,255,0.15)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'vp360spin 0.85s linear infinite',
              }}
            />
            <p
              style={{
                margin: 0,
                color: 'rgba(255,255,255,0.85)',
                fontSize: 15,
                fontFamily: 'var(--font-syne, system-ui)',
                fontWeight: 600,
              }}
            >
              Loading 360° video…
            </p>
            <style>{`@keyframes vp360spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
        {showOverlay && (
          <div
            role="button"
            tabIndex={0}
            aria-label="Start 360 degree training"
            onClick={handleStartClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleStartClick();
              }
            }}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 9999,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.85)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              opacity: overlayState === 'fading' ? 0 : 1,
              transition: 'opacity 0.5s ease',
              pointerEvents: overlayState === 'fading' ? 'none' : 'auto',
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.12)',
                border: '2px solid rgba(255,255,255,0.95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}
            >
              <Play size={36} color="white" fill="white" style={{ marginLeft: 4 }} aria-hidden />
            </div>
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-syne, system-ui)',
                fontSize: 'clamp(18px, 4vw, 24px)',
                fontWeight: 700,
                color: 'white',
                textAlign: 'center',
                padding: '0 24px',
              }}
            >
              Click to Start 360° Training
            </p>
            <p
              style={{
                margin: '12px 0 0',
                fontSize: 15,
                color: 'rgba(255,255,255,0.72)',
                textAlign: 'center',
                maxWidth: 360,
                padding: '0 24px',
                lineHeight: 1.5,
              }}
            >
              Look around by dragging. On phone, use Cardboard mode for stereo view. Answer questions as they appear.
            </p>
          </div>
        )}
      </div>
    );
  }
);

VideoPlayer360.displayName = 'VideoPlayer360';
export default VideoPlayer360;
