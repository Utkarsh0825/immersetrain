'use client';
import { useEffect, useRef, useImperativeHandle, forwardRef, useState, useCallback } from 'react';
import { Play } from 'lucide-react';

export interface VideoPlayer360Handle {
  play: () => void;
  pause: () => void;
  getCurrentTime: () => number;
  onTimeUpdate: (cb: (time: number) => void) => () => void;
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
};

const RETRY_DELAY_MS = 350;
const MAX_PLAY_RETRIES = 4;
/** Scene “loaded” must not depend on the MP4 finishing — that was blocking the whole flow inside <a-assets>. */
const SCENE_READY_TIMEOUT_MS = 8000;

function waitSceneReady(scene: ASceneEl | null): Promise<void> {
  if (!scene) return Promise.resolve();
  if (scene.hasLoaded) return Promise.resolve();
  return new Promise((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      window.clearInterval(poll);
      window.clearTimeout(maxWait);
      resolve();
    };
    scene.addEventListener('loaded', done, { once: true });
    const poll = window.setInterval(() => {
      if (scene.hasLoaded) done();
    }, 100);
    const maxWait = window.setTimeout(done, SCENE_READY_TIMEOUT_MS);
  });
}

async function playWithRetries(video: HTMLVideoElement, muted: boolean): Promise<void> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < MAX_PLAY_RETRIES; attempt++) {
    try {
      video.muted = muted;
      await video.play();
      return;
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }
  }
  throw lastErr;
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

      const abortClear = window.setTimeout(() => {
        setVideoBuffering(false);
        startInProgress.current = false;
      }, 15000);

      try {
        const scene = document.querySelector('a-scene') as ASceneEl | null;
        await waitSceneReady(scene);

        const videoEl = document.getElementById('trainingvideo') as HTMLVideoElement | null;
        if (!videoEl) {
          console.error('[VideoPlayer360] no #trainingvideo');
          return;
        }

        videoRef.current = videoEl;

        const hideBuffering = () => setVideoBuffering(false);
        videoEl.addEventListener('playing', hideBuffering, { once: true });

        // User just tapped “start” — treat as unlock: get picture + sound going fast.
        videoEl.muted = true;
        try {
          await playWithRetries(videoEl, true);
        } catch (e) {
          console.error('[VideoPlayer360] muted play failed', e);
          await videoEl.play().catch(() => {});
        }

        // Unmute right after playback begins (same gesture stack); optional micro-delay for texture.
        requestAnimationFrame(() => {
          videoEl.muted = false;
          void videoEl.play().catch(() => {});
        });
      } catch (e) {
        console.error('[VideoPlayer360] start sequence', e);
      } finally {
        window.clearTimeout(abortClear);
        startInProgress.current = false;
        setVideoBuffering(false);
      }
    }, []);

    useImperativeHandle(ref, () => ({
      play: () => {
        const v = videoRef.current;
        if (!v) return;
        void playWithRetries(v, false).catch(() => v.play().catch(() => {}));
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
        scene?.enterVR?.();
      },
    }));

    const handleStartClick = useCallback(() => {
      if (overlayState !== 'visible') return;
      setOverlayState('fading');
      window.setTimeout(() => {
        setOverlayState('gone');
        setVideoBuffering(true);
        void startVideoSequence();
      }, 280);
    }, [overlayState, startVideoSequence]);

    useEffect(() => {
      if (aframeLoaded.current || typeof window === 'undefined') return;
      aframeLoaded.current = true;

      const loadAFrame = () => {
        const origin = window.location.origin;
        const resolvedSrc = videoUrl.startsWith('/') ? `${origin}${videoUrl}` : videoUrl;
        resolvedSrcRef.current = resolvedSrc;

        // Video is NOT inside <a-assets> — that was blocking scene "loaded" until the whole MP4 buffered.
        const sceneHTML = `
          <a-scene
            embedded
            style="height:100%;width:100%;position:absolute;top:0;left:0"
            renderer="colorManagement: true; physicallyCorrectLights: false"
            loading-screen="enabled: false"
            vr-mode-ui="enabled: true"
            device-orientation-permission-ui="enabled: true"
          >
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
              style="display:none;width:2px;height:2px;position:absolute;left:-9999px"
            ></video>
            <a-videosphere
              id="immersive-sphere"
              src="#trainingvideo"
              rotation="0 -90 0"
              visible="true"
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

          const wireReady = (scene: ASceneEl | null) => {
            const finish = () => {
              const videoEl = document.getElementById('trainingvideo') as HTMLVideoElement | null;
              if (videoEl) {
                attachVideoListeners(videoEl, resolvedSrc);
                onReady?.();
              }
            };
            if (!scene) {
              window.setTimeout(finish, 0);
              return;
            }
            if (scene.hasLoaded) finish();
            else scene.addEventListener('loaded', finish, { once: true });
          };

          const scene = containerRef.current.querySelector('a-scene') as ASceneEl | null;
          wireReady(scene);
        }
      };

      if (window.AFRAME) {
        loadAFrame();
        return () => {
          if (containerRef.current) containerRef.current.innerHTML = '';
        };
      }

      const script = document.createElement('script');
      script.src = 'https://aframe.io/releases/1.6.0/aframe.min.js';
      script.onload = loadAFrame;
      script.onerror = () => console.error('Failed to load A-Frame');
      document.head.appendChild(script);

      const poly = document.createElement('script');
      poly.src = 'https://unpkg.com/webvr-polyfill@0.10.12/build/webvr-polyfill.js';
      poly.async = true;
      document.head.appendChild(poly);

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
              background: 'rgba(0,0,0,0.88)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                border: '3px solid rgba(255,255,255,0.12)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'vp360spin 0.8s linear infinite',
              }}
            />
            <p
              style={{
                margin: 0,
                color: 'rgba(255,255,255,0.9)',
                fontSize: 15,
                fontFamily: 'var(--font-syne, system-ui)',
                fontWeight: 600,
              }}
            >
              Starting playback…
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
              transition: 'opacity 0.35s ease',
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
              Drag to look around. Use the VR icon or Cardboard on phone for stereo view.
            </p>
          </div>
        )}
      </div>
    );
  }
);

VideoPlayer360.displayName = 'VideoPlayer360';
export default VideoPlayer360;
