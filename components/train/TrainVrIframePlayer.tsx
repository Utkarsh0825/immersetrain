'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { Play } from 'lucide-react';
import { enterTrainImmersive } from '@/lib/trainImmersive';
import type { VideoPlayer360Handle, VrQuizPayload } from '@/components/train/VideoPlayer360';

const CHANNEL = 'IT_VR';

type IframeMessage = {
  channel: typeof CHANNEL;
  type: string;
  [key: string]: unknown;
};

interface TrainVrIframePlayerProps {
  videoUrl: string;
  onReady?: () => void;
  fullscreenRootRef?: RefObject<HTMLElement | null>;
  fullscreenOnStart?: boolean;
  onVrQuizAnswer?: (args: { questionId: string; chosenOption: 'a' | 'b' }) => void;
  onVrModeChange?: (inVr: boolean) => void;
}

function postToIframe(win: Window | null | undefined, msg: Record<string, unknown>) {
  if (!win || typeof window === 'undefined') return;
  win.postMessage({ channel: CHANNEL, ...msg } as IframeMessage, window.location.origin);
}

const TrainVrIframePlayer = forwardRef<VideoPlayer360Handle, TrainVrIframePlayerProps>(
  (
    { videoUrl, onReady, fullscreenRootRef, fullscreenOnStart, onVrQuizAnswer, onVrModeChange },
    ref
  ) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const timeCallbacks = useRef(new Set<(t: number) => void>());
    const onReadyRef = useRef(onReady);
    onReadyRef.current = onReady;
    const onVrQuizAnswerRef = useRef(onVrQuizAnswer);
    onVrQuizAnswerRef.current = onVrQuizAnswer;
    const onVrModeChangeRef = useRef(onVrModeChange);
    onVrModeChangeRef.current = onVrModeChange;

    const [overlayState, setOverlayState] = useState<'visible' | 'fading' | 'gone'>('visible');
    const [videoBuffering, setVideoBuffering] = useState(false);
    const clearBufferingOnTimeRef = useRef(false);

    const resolvedUrl =
      typeof window !== 'undefined' && videoUrl.startsWith('/')
        ? `${window.location.origin}${videoUrl}`
        : videoUrl;

    useEffect(() => {
      const onMsg = (e: MessageEvent) => {
        if (e.origin !== window.location.origin) return;
        if (e.source !== iframeRef.current?.contentWindow) return;
        const d = e.data as IframeMessage;
        if (!d || d.channel !== CHANNEL) return;

        switch (d.type) {
          case 'READY_FOR_INIT': {
            const w = iframeRef.current?.contentWindow;
            postToIframe(w, { type: 'INIT', videoUrl: resolvedUrl });
            break;
          }
          case 'PLAYER_READY':
            onReadyRef.current?.();
            break;
          case 'TIME_UPDATE': {
            const t = typeof d.time === 'number' ? d.time : 0;
            if (clearBufferingOnTimeRef.current) {
              clearBufferingOnTimeRef.current = false;
              setVideoBuffering(false);
            }
            timeCallbacks.current.forEach((cb) => cb(t));
            break;
          }
          case 'IN_VR':
            onVrModeChangeRef.current?.(!!d.value);
            break;
          case 'VR_QUIZ_ANSWER': {
            const qid = typeof d.questionId === 'string' ? d.questionId : '';
            const opt = d.chosenOption === 'b' ? 'b' : 'a';
            if (qid) onVrQuizAnswerRef.current?.({ questionId: qid, chosenOption: opt });
            break;
          }
          default:
            break;
        }
      };
      window.addEventListener('message', onMsg);
      return () => window.removeEventListener('message', onMsg);
    }, [resolvedUrl]);

    const handleStartClick = useCallback(() => {
      if (overlayState !== 'visible') return;
      if (fullscreenOnStart && fullscreenRootRef?.current) {
        enterTrainImmersive(fullscreenRootRef.current);
      }
      setOverlayState('fading');
      window.setTimeout(() => {
        setOverlayState('gone');
        setVideoBuffering(true);
        clearBufferingOnTimeRef.current = true;
        postToIframe(iframeRef.current?.contentWindow, { type: 'START_PLAYBACK' });
        window.setTimeout(() => setVideoBuffering(false), 12000);
      }, 280);
    }, [overlayState, fullscreenOnStart, fullscreenRootRef]);

    useImperativeHandle(ref, () => ({
      play: () => postToIframe(iframeRef.current?.contentWindow, { type: 'PLAY' }),
      pause: () => postToIframe(iframeRef.current?.contentWindow, { type: 'PAUSE' }),
      getCurrentTime: () => 0,
      getDuration: () => 0,
      seek: (timeSeconds: number) =>
        postToIframe(iframeRef.current?.contentWindow, { type: 'SEEK', timeSeconds }),
      onTimeUpdate: (cb) => {
        timeCallbacks.current.add(cb);
        return () => timeCallbacks.current.delete(cb);
      },
      enterVR: () => {
        const scene = iframeRef.current?.contentWindow?.document.querySelector(
          'a-scene'
        ) as { enterVR?: () => void } | null;
        scene?.enterVR?.();
      },
      setVrQuizVisible: (visible: boolean) => {
        if (!visible) postToIframe(iframeRef.current?.contentWindow, { type: 'HIDE_VR_QUIZ' });
      },
      showVrQuiz: (payload: VrQuizPayload) =>
        postToIframe(iframeRef.current?.contentWindow, { type: 'SHOW_VR_QUIZ', payload }),
      hideVrQuiz: () => postToIframe(iframeRef.current?.contentWindow, { type: 'HIDE_VR_QUIZ' }),
      freezeFrame: () => postToIframe(iframeRef.current?.contentWindow, { type: 'FREEZE_FRAME' }),
      resumeFromFreeze: (skipSeconds?: number) =>
        postToIframe(iframeRef.current?.contentWindow, {
          type: 'RESUME_FROM_FREEZE',
          skipSeconds: skipSeconds ?? 0.35,
        }),
    }));

    const showOverlay = overlayState !== 'gone';

    return (
      <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <iframe
          key={resolvedUrl}
          ref={iframeRef}
          src="/vr-player.html"
          title="360° VR training player"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            border: 0,
            display: 'block',
          }}
          allow="xr-spatial-tracking; accelerometer; gyroscope; autoplay; fullscreen"
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
              pointerEvents: 'none',
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
              Start 360° Training
            </p>
            <p
              style={{
                margin: '12px 0 0',
                fontSize: 15,
                color: 'rgba(255,255,255,0.72)',
                textAlign: 'center',
                maxWidth: 420,
                padding: '0 24px',
                lineHeight: 1.5,
              }}
            >
              VR runs in an isolated player (iframe) for stable WebXR. Use the headset VR button after
              playback starts. On desktop, fullscreen keeps the HTML quiz visible.
            </p>
          </div>
        )}
      </div>
    );
  }
);

TrainVrIframePlayer.displayName = 'TrainVrIframePlayer';
export default TrainVrIframePlayer;
