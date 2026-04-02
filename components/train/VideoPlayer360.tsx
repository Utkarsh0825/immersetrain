'use client';
import { useEffect, useRef, useImperativeHandle, forwardRef, useState, useCallback } from 'react';
import { Play } from 'lucide-react';

export interface VideoPlayer360Handle {
  play: () => void;
  pause: () => void;
  getCurrentTime: () => number;
  onTimeUpdate: (cb: (time: number) => void) => () => void;
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

const VideoPlayer360 = forwardRef<VideoPlayer360Handle, VideoPlayer360Props>(
  ({ videoUrl, onReady }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const aframeLoaded = useRef(false);
    const timeCallbacks = useRef<Set<(t: number) => void>>(new Set());
    const [overlayState, setOverlayState] = useState<'visible' | 'fading' | 'gone'>('visible');

    const attachVideoListeners = useCallback((videoEl: HTMLVideoElement, resolvedSrc: string) => {
      videoRef.current = videoEl;
      videoEl.addEventListener('error', () => {
        console.error(
          '[VideoPlayer360] Failed to load video',
          resolvedSrc,
          videoEl.error?.code,
          videoEl.error?.message
        );
      });
      videoEl.addEventListener('timeupdate', () => {
        timeCallbacks.current.forEach((cb) => cb(videoEl.currentTime));
      });
    }, []);

    useImperativeHandle(ref, () => ({
      play: () => {
        const v = videoRef.current;
        if (!v) return;
        v.muted = true;
        v.play()
          .then(() => {
            v.muted = false;
          })
          .catch(() => {});
      },
      pause: () => {
        videoRef.current?.pause();
      },
      getCurrentTime: () => {
        return videoRef.current?.currentTime ?? 0;
      },
      onTimeUpdate: (cb) => {
        timeCallbacks.current.add(cb);
        return () => timeCallbacks.current.delete(cb);
      },
    }));

    const handleStartClick = useCallback(() => {
      if (overlayState !== 'visible') return;
      const videoEl = document.getElementById('trainingvideo') as HTMLVideoElement | null;
      if (videoEl) {
        videoRef.current = videoEl;
        videoEl.muted = true;
        void videoEl
          .play()
          .then(() => {
            videoEl.muted = false;
          })
          .catch(() => {});
      }
      setOverlayState('fading');
      window.setTimeout(() => setOverlayState('gone'), 500);
    }, [overlayState]);

    useEffect(() => {
      if (aframeLoaded.current || typeof window === 'undefined') return;
      aframeLoaded.current = true;

      const loadAFrame = () => {
        const origin = window.location.origin;
        const resolvedSrc = videoUrl.startsWith('/')
          ? `${origin}${videoUrl}`
          : videoUrl;

        const sceneHTML = `
          <a-scene embedded style="height:100%;width:100%;position:absolute;top:0;left:0" vr-mode-ui="enabled:true">
            <a-assets timeout="60000">
              <video
                id="trainingvideo"
                src="${resolvedSrc}"
                muted
                playsinline
                webkit-playsinline
                crossorigin="anonymous"
                loop="false"
                preload="auto"
              ></video>
            </a-assets>
            <a-videosphere
              id="player"
              src="#trainingvideo"
              rotation="0 -90 0"
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
            const scene = containerRef.current?.querySelector('a-scene');
            if (scene && (scene as HTMLElement & { hasLoaded?: boolean }).hasLoaded) {
              const videoEl = document.getElementById('trainingvideo') as HTMLVideoElement;
              if (videoEl) {
                attachVideoListeners(videoEl, resolvedSrc);
                onReady?.();
              }
            } else {
              const sceneEl = scene as (HTMLElement & { addEventListener: (e: string, cb: () => void) => void }) | null;
              sceneEl?.addEventListener('loaded', () => {
                const videoEl = document.getElementById('trainingvideo') as HTMLVideoElement;
                if (videoEl) {
                  attachVideoListeners(videoEl, resolvedSrc);
                  onReady?.();
                }
              });
            }
          };

          setTimeout(waitForScene, 500);
        }
      };

      if (window.AFRAME) {
        loadAFrame();
      } else {
        const script = document.createElement('script');
        script.src = 'https://aframe.io/releases/1.6.0/aframe.min.js';
        script.onload = loadAFrame;
        script.onerror = () => console.error('Failed to load A-Frame');
        document.head.appendChild(script);
      }

      return () => {
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
      };
    }, [videoUrl, onReady, attachVideoListeners]);

    const showOverlay = overlayState !== 'gone';

    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      >
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
              Look around by dragging. Answer questions as they appear.
            </p>
          </div>
        )}
      </div>
    );
  }
);

VideoPlayer360.displayName = 'VideoPlayer360';
export default VideoPlayer360;
