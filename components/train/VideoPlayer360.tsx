'use client';
import { useEffect, useRef, useImperativeHandle, forwardRef, useState, useCallback } from 'react';
import { Play } from 'lucide-react';
import { enterTrainImmersive } from '@/lib/trainImmersive';

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
  /** Training page root — fullscreen on the same tap as “Start” (phone + headset). */
  fullscreenRootRef?: React.RefObject<HTMLElement | null>;
  /** When true with fullscreenRootRef, enter fullscreen immediately on user start tap. */
  fullscreenOnStart?: boolean;
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

const AFRAME_SCRIPT_ID = 'immersetrain-aframe-160';
const RETRY_DELAY_MS = 350;
const MAX_PLAY_RETRIES = 4;
const SCENE_READY_TIMEOUT_MS = 8000;
const VIDEO_FIND_TIMEOUT_MS = 6000;

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

/** One shared loader so Strict Mode remounts and route changes do not duplicate A-Frame / THREE. */
function loadAframeScriptOnce(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.AFRAME) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(AFRAME_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (window.AFRAME) {
        resolve();
        return;
      }
      existing.addEventListener(
        'load',
        () => {
          if (window.AFRAME) resolve();
          else reject(new Error('A-Frame script present but AFRAME missing'));
        },
        { once: true }
      );
      existing.addEventListener('error', () => reject(new Error('A-Frame load error')), { once: true });
      queueMicrotask(() => {
        if (window.AFRAME) resolve();
      });
      return;
    }

    const script = document.createElement('script');
    script.id = AFRAME_SCRIPT_ID;
    script.async = true;
    script.src = 'https://aframe.io/releases/1.6.0/aframe.min.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load A-Frame'));
    document.head.appendChild(script);
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

async function waitForVideoInContainer(
  container: HTMLElement | null,
  cancelled: () => boolean
): Promise<HTMLVideoElement | null> {
  const start = Date.now();
  while (Date.now() - start < VIDEO_FIND_TIMEOUT_MS && !cancelled()) {
    const v = container?.querySelector('#trainingvideo') as HTMLVideoElement | null;
    if (v) return v;
    await new Promise((r) => setTimeout(r, 80));
  }
  return null;
}

const VideoPlayer360 = forwardRef<VideoPlayer360Handle, VideoPlayer360Props>(
  ({ videoUrl, onReady, fullscreenRootRef, fullscreenOnStart }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneElRef = useRef<ASceneEl | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const resolvedSrcRef = useRef('');
    const timeCallbacks = useRef<Set<(t: number) => void>>(new Set());
    const onReadyRef = useRef(onReady);
    onReadyRef.current = onReady;

    const [overlayState, setOverlayState] = useState<'visible' | 'fading' | 'gone'>('visible');
    const [videoBuffering, setVideoBuffering] = useState(false);
    const startInProgress = useRef(false);
    const aliveRef = useRef(true);

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
      }, 20000);

      try {
        const container = containerRef.current;
        const scene = container?.querySelector('a-scene') as ASceneEl | null;
        sceneElRef.current = scene;
        await waitSceneReady(scene);

        const videoEl = await waitForVideoInContainer(container, () => !aliveRef.current);
        if (!videoEl) {
          console.error('[VideoPlayer360] no #trainingvideo inside player container after wait');
          return;
        }

        videoRef.current = videoEl;

        const hideBuffering = () => setVideoBuffering(false);
        videoEl.addEventListener('playing', hideBuffering, { once: true });

        videoEl.muted = true;
        try {
          await playWithRetries(videoEl, true);
        } catch (e) {
          console.error('[VideoPlayer360] muted play failed', e);
          await videoEl.play().catch(() => {});
        }

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
        const scene =
          sceneElRef.current ??
          (containerRef.current?.querySelector('a-scene') as ASceneEl | null);
        scene?.enterVR?.();
      },
    }));

    const handleStartClick = useCallback(() => {
      if (overlayState !== 'visible') return;
      /* Fullscreen + orientation must run in the same user gesture as the tap (mobile). */
      if (fullscreenOnStart && fullscreenRootRef?.current) {
        enterTrainImmersive(fullscreenRootRef.current);
      }
      setOverlayState('fading');
      window.setTimeout(() => {
        setOverlayState('gone');
        setVideoBuffering(true);
        void startVideoSequence();
      }, 280);
    }, [overlayState, startVideoSequence, fullscreenOnStart, fullscreenRootRef]);

    useEffect(() => {
      if (typeof window === 'undefined') return;

      let cancelled = false;
      aliveRef.current = true;

      const mount = async () => {
        const container = containerRef.current;
        if (!container) return;

        try {
          await loadAframeScriptOnce();
        } catch (e) {
          console.error('[VideoPlayer360]', e);
          return;
        }
        if (cancelled || !containerRef.current) return;

        const origin = window.location.origin;
        const resolvedSrc = videoUrl.startsWith('/') ? `${origin}${videoUrl}` : videoUrl;
        resolvedSrcRef.current = resolvedSrc;

        /* src set in JS so query strings / encoding never break the inline scene HTML */
        const stereoUi = fullscreenOnStart ? 'false' : 'true';
        container.innerHTML = `
          <a-scene
            embedded
            style="height:100%;width:100%;position:absolute;top:0;left:0"
            renderer="colorManagement: true"
            loading-screen="enabled: false"
            vr-mode-ui="enabled: ${stereoUi}"
            device-orientation-permission-ui="enabled: true"
          >
            <video
              id="trainingvideo"
              muted
              playsinline
              webkit-playsinline
              crossorigin="anonymous"
              loop="false"
              preload="auto"
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

        const videoEl = container.querySelector('#trainingvideo') as HTMLVideoElement | null;
        if (videoEl) {
          videoEl.src = resolvedSrc;
          videoEl.load();
        }

        const scene = container.querySelector('a-scene') as ASceneEl | null;
        sceneElRef.current = scene;

        const finishReady = () => {
          if (cancelled || !containerRef.current) return;
          const v = containerRef.current.querySelector('#trainingvideo') as HTMLVideoElement | null;
          if (v) {
            attachVideoListeners(v, resolvedSrc);
            onReadyRef.current?.();
          }
        };

        if (!scene) {
          window.setTimeout(finishReady, 0);
          return;
        }
        if (scene.hasLoaded) finishReady();
        else scene.addEventListener('loaded', finishReady, { once: true });
      };

      void mount();

      return () => {
        cancelled = true;
        aliveRef.current = false;
        sceneElRef.current = null;
        videoRef.current = null;
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
      };
    }, [videoUrl, attachVideoListeners, fullscreenOnStart]);

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
              {fullscreenOnStart ? 'Tap to Start 360° Training' : 'Click to Start 360° Training'}
            </p>
            <p
              style={{
                margin: '12px 0 0',
                fontSize: 15,
                color: 'rgba(255,255,255,0.72)',
                textAlign: 'center',
                maxWidth: 380,
                padding: '0 24px',
                lineHeight: 1.5,
              }}
            >
              {fullscreenOnStart
                ? 'Uses full screen on your phone (Android: browser fullscreen; iPhone: edge-to-edge view—like inline YouTube, but for 360°). Allow motion if prompted, then move your head to look around.'
                : 'Drag to look around. Dedicated VR headsets can use the scene’s VR control when available.'}
            </p>
          </div>
        )}
      </div>
    );
  }
);

VideoPlayer360.displayName = 'VideoPlayer360';
export default VideoPlayer360;
