'use client';
import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

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

    useImperativeHandle(ref, () => ({
      play: () => {
        videoRef.current?.play().catch(() => {});
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

    useEffect(() => {
      if (aframeLoaded.current || typeof window === 'undefined') return;
      aframeLoaded.current = true;

      const loadAFrame = () => {
        const sceneHTML = `
          <a-scene embedded style="height:100%;width:100%;position:absolute;top:0;left:0" vr-mode-ui="enabled:true">
            <a-assets timeout="30000">
              <video
                id="trainingvideo"
                src="${videoUrl}"
                crossorigin="anonymous"
                loop="false"
                preload="auto"
                playsinline
                webkit-playsinline
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

          // Wait for A-Frame scene to init, then grab the video element
          const waitForScene = () => {
            const scene = containerRef.current?.querySelector('a-scene');
            if (scene && (scene as HTMLElement & { hasLoaded?: boolean }).hasLoaded) {
              const videoEl = document.getElementById('trainingvideo') as HTMLVideoElement;
              if (videoEl) {
                videoRef.current = videoEl;
                videoEl.addEventListener('timeupdate', () => {
                  timeCallbacks.current.forEach((cb) => cb(videoEl.currentTime));
                });
                onReady?.();
              }
            } else {
              const sceneEl = scene as (HTMLElement & { addEventListener: (e: string, cb: () => void) => void }) | null;
              sceneEl?.addEventListener('loaded', () => {
                const videoEl = document.getElementById('trainingvideo') as HTMLVideoElement;
                if (videoEl) {
                  videoRef.current = videoEl;
                  videoEl.addEventListener('timeupdate', () => {
                    timeCallbacks.current.forEach((cb) => cb(videoEl.currentTime));
                  });
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
    }, [videoUrl, onReady]);

    return (
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
    );
  }
);

VideoPlayer360.displayName = 'VideoPlayer360';
export default VideoPlayer360;
