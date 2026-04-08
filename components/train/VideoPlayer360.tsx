'use client';
import { useEffect, useRef, useImperativeHandle, forwardRef, useState, useCallback } from 'react';
import { Play } from 'lucide-react';
import { enterTrainImmersive } from '@/lib/trainImmersive';

export interface VideoPlayer360Handle {
  play: () => void;
  pause: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  seek: (timeSeconds: number) => void;
  onTimeUpdate: (cb: (time: number) => void) => () => void;
  enterVR: () => void;
  setVrQuizVisible: (visible: boolean) => void;
  showVrQuiz: (payload: VrQuizPayload) => void;
  hideVrQuiz: () => void;
  freezeFrame: () => void;
  resumeFromFreeze: (skipSeconds?: number) => void;
}

export type VrQuizPayload = {
  id: string;
  questionIndex: number;
  totalQuestions: number;
  questionText: string;
  optionA: string;
  optionB: string;
  correctOption: 'a' | 'b';
  explanation?: string;
  points?: number;
};

interface VideoPlayer360Props {
  videoUrl: string;
  onReady?: () => void;
  /** Training page root — fullscreen on the same tap as “Start” (phone + headset). */
  fullscreenRootRef?: React.RefObject<HTMLElement | null>;
  /** When true with fullscreenRootRef, enter fullscreen immediately on user start tap. */
  fullscreenOnStart?: boolean;
  /** Called when user answers inside VR quiz panel. */
  onVrQuizAnswer?: (args: { questionId: string; chosenOption: 'a' | 'b' }) => void;
  /** Notifies parent when WebXR immersive mode toggles. */
  onVrModeChange?: (inVr: boolean) => void;
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
  ({ videoUrl, onReady, fullscreenRootRef, fullscreenOnStart, onVrQuizAnswer, onVrModeChange }, ref) => {
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
    const [inVr, setInVr] = useState(false);
    const lastPausedTimeRef = useRef<number>(0);
    const lastKnownTimeRef = useRef<number>(0);
    const timeGuardRef = useRef<number | null>(null);
    const freezeGuardRef = useRef<number | null>(null);
    const frozenAtRef = useRef<number>(0);
    const inFreezeRef = useRef<boolean>(false);
    const freezeCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const sphereRef = useRef<HTMLElement | null>(null);
    const vrStartScreenRef = useRef<HTMLElement | null>(null);
    const vrStartBtnRef = useRef<HTMLElement | null>(null);
    const vrStartTextRef = useRef<HTMLElement | null>(null);
    const questRef = useRef(false);
    const vrVideoStartedRef = useRef(false);
    const vrStartHandlersRef = useRef<{
      click?: ((e: Event) => void) | null;
      trigger?: ((e: Event) => void) | null;
      select?: ((e: Event) => void) | null;
    }>({});
    const vrElsRef = useRef<{
      panel?: HTMLElement | null;
      cursor?: HTMLElement | null;
      label?: HTMLElement | null;
      points?: HTMLElement | null;
      q?: HTMLElement | null;
      aBtn?: HTMLElement | null;
      bBtn?: HTMLElement | null;
      aBg?: HTMLElement | null;
      bBg?: HTMLElement | null;
      aText?: HTMLElement | null;
      bText?: HTMLElement | null;
      feedback?: HTMLElement | null;
    }>({});

    const vrHandlersRef = useRef<{
      a?: ((e: Event) => void) | null;
      b?: ((e: Event) => void) | null;
      aEnter?: ((e: Event) => void) | null;
      aLeave?: ((e: Event) => void) | null;
      bEnter?: ((e: Event) => void) | null;
      bLeave?: ((e: Event) => void) | null;
    }>({});

    const setVrQuizVisible = useCallback((visible: boolean) => {
      const els = vrElsRef.current;
      els.panel?.setAttribute('visible', visible ? 'true' : 'false');
      els.cursor?.setAttribute('visible', visible ? 'true' : 'false');
      if (!visible) {
        els.feedback?.setAttribute('visible', 'false');
        els.feedback?.setAttribute('value', '');
      }
    }, []);

    const hideVrQuiz = useCallback(() => {
      setVrQuizVisible(false);
    }, [setVrQuizVisible]);

    const showVrQuiz = useCallback(
      (payload: VrQuizPayload) => {
        const els = vrElsRef.current;
        if (!els.panel) return;

        // Text
        els.label?.setAttribute(
          'value',
          `QUESTION ${Math.min(payload.questionIndex + 1, payload.totalQuestions)} OF ${payload.totalQuestions}`
        );
        els.points?.setAttribute('value', `+ ${payload.points ?? 10} pts`);
        els.q?.setAttribute('value', payload.questionText ?? '');
        els.aText?.setAttribute('value', payload.optionA ?? '');
        els.bText?.setAttribute('value', payload.optionB ?? '');

        // Reset visuals
        els.aBg?.setAttribute('material', 'color: #1a1a2e; shader: flat; opacity: 0.98');
        els.bBg?.setAttribute('material', 'color: #1a1a2e; shader: flat; opacity: 0.98');
        els.feedback?.setAttribute('visible', 'false');
        els.feedback?.setAttribute('value', '');
        els.cursor?.setAttribute('visible', 'true');

        // Remove prior listeners
        const h = vrHandlersRef.current;
        if (els.aBtn && h.a) els.aBtn.removeEventListener('click', h.a);
        if (els.bBtn && h.b) els.bBtn.removeEventListener('click', h.b);
        if (els.aBtn && h.aEnter) els.aBtn.removeEventListener('mouseenter', h.aEnter);
        if (els.aBtn && h.aLeave) els.aBtn.removeEventListener('mouseleave', h.aLeave);
        if (els.bBtn && h.bEnter) els.bBtn.removeEventListener('mouseenter', h.bEnter);
        if (els.bBtn && h.bLeave) els.bBtn.removeEventListener('mouseleave', h.bLeave);

        const hoverOnA = () => els.aBg?.setAttribute('material', 'color: #2a2a4e; shader: flat; opacity: 0.98');
        const hoverOffA = () => els.aBg?.setAttribute('material', 'color: #1a1a2e; shader: flat; opacity: 0.98');
        const hoverOnB = () => els.bBg?.setAttribute('material', 'color: #2a2a4e; shader: flat; opacity: 0.98');
        const hoverOffB = () => els.bBg?.setAttribute('material', 'color: #1a1a2e; shader: flat; opacity: 0.98');

        const answer = (chosen: 'a' | 'b') => {
          const correct = payload.correctOption;
          const isCorrect = chosen === correct;
          const chosenBg = chosen === 'a' ? els.aBg : els.bBg;
          const correctBg = correct === 'a' ? els.aBg : els.bBg;

          if (isCorrect) {
            chosenBg?.setAttribute('material', 'color: #166534; shader: flat; opacity: 0.98');
            els.feedback?.setAttribute('value', `✓ Correct! +${payload.points ?? 10}`);
            els.feedback?.setAttribute('color', '#22c55e');
          } else {
            chosenBg?.setAttribute('material', 'color: #7f1d1d; shader: flat; opacity: 0.98');
            correctBg?.setAttribute('material', 'color: #166534; shader: flat; opacity: 0.98');
            const msg = (payload.explanation ?? '✗ Incorrect').slice(0, 110);
            els.feedback?.setAttribute('value', msg);
            els.feedback?.setAttribute('color', '#ef4444');
          }
          els.feedback?.setAttribute('visible', 'true');
          els.cursor?.setAttribute('visible', 'false');

          // Dispatch immediately to React quiz engine so score/answers update,
          // but keep VR panel visible for the full feedback duration.
          onVrQuizAnswer?.({ questionId: payload.id, chosenOption: chosen });
          window.setTimeout(() => hideVrQuiz(), 2500);
        };

        h.aEnter = hoverOnA;
        h.aLeave = hoverOffA;
        h.bEnter = hoverOnB;
        h.bLeave = hoverOffB;
        h.a = () => answer('a');
        h.b = () => answer('b');

        els.aBtn?.addEventListener('mouseenter', h.aEnter);
        els.aBtn?.addEventListener('mouseleave', h.aLeave);
        els.bBtn?.addEventListener('mouseenter', h.bEnter);
        els.bBtn?.addEventListener('mouseleave', h.bLeave);
        els.aBtn?.addEventListener('click', h.a);
        els.bBtn?.addEventListener('click', h.b);

        setVrQuizVisible(true);
      },
      [hideVrQuiz, onVrQuizAnswer, setVrQuizVisible]
    );

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
        lastKnownTimeRef.current = videoEl.currentTime;
        timeCallbacks.current.forEach((cb) => cb(videoEl.currentTime));
      });
    }, []);

    const freezeFrame = useCallback(() => {
      const v = videoRef.current;
      const sphere = sphereRef.current ?? (containerRef.current?.querySelector('#videosphere') as any | null);
      const canvas =
        freezeCanvasRef.current ??
        (containerRef.current?.querySelector('#freezeCanvas') as HTMLCanvasElement | null);
      if (!v || !sphere || !canvas) return;

      freezeCanvasRef.current = canvas;
      sphereRef.current = sphere;

      const t = v.currentTime || lastKnownTimeRef.current;
      frozenAtRef.current = t;
      inFreezeRef.current = true;

      try {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      } catch {}

      // Swap sphere to frozen canvas texture (no pause/play = no Quest decode reset).
      try {
        sphere.setAttribute('material', 'src: #freezeCanvas; side: back; shader: flat;');
      } catch {}

      // Mute while question is shown (video continues in background).
      v.muted = true;

      // Keep the underlying media time pinned close to the frozen moment (avoid drifting ahead).
      if (freezeGuardRef.current != null) window.clearInterval(freezeGuardRef.current);
      freezeGuardRef.current = window.setInterval(() => {
        const vv = videoRef.current;
        if (!vv) return;
        if (!inFreezeRef.current) return;
        const target = frozenAtRef.current;
        try {
          if (Number.isFinite(target) && target > 0.05 && Math.abs(vv.currentTime - target) > 0.35) {
            vv.currentTime = target;
          }
        } catch {}
      }, 200);
    }, []);

    const resumeFromFreeze = useCallback((skipSeconds: number = 0.6) => {
      const v = videoRef.current;
      const sphere = sphereRef.current ?? (containerRef.current?.querySelector('#videosphere') as any | null);
      if (!v || !sphere) return;

      const target = Math.max(0, (frozenAtRef.current || v.currentTime || lastKnownTimeRef.current) + skipSeconds);
      inFreezeRef.current = false;

      if (freezeGuardRef.current != null) {
        window.clearInterval(freezeGuardRef.current);
        freezeGuardRef.current = null;
      }

      // Swap back to live texture and force playback to continue.
      const swapBack = () => {
        try {
          sphere.setAttribute('material', 'src: #trainingvideo; side: back; shader: flat;');
        } catch {}
        v.muted = false;
        void v.play().catch(() => {});
      };

      // Seek to just after the question zone, then swap back to live video texture.
      const onSeeked = () => {
        swapBack();
      };
      v.addEventListener('seeked', onSeeked, { once: true });
      try {
        v.currentTime = target;
      } catch {
        swapBack();
      }
      // Quest sometimes fails to fire 'seeked' when seeking while playing; ensure we always swap back.
      window.setTimeout(() => swapBack(), 300);
    }, []);

    const startVrVideoFromGesture = useCallback(() => {
      const scene = sceneElRef.current as any;
      const v = videoRef.current;
      const sphere = sphereRef.current ?? (containerRef.current?.querySelector('#videosphere') as any | null);
      const startUi =
        vrStartBtnRef.current ?? (containerRef.current?.querySelector('#vr-start-btn') as HTMLElement | null);
      const startText =
        vrStartTextRef.current ?? (containerRef.current?.querySelector('#vr-start-text') as HTMLElement | null);
      if (!scene || !v || !sphere) return;
      if (vrVideoStartedRef.current) return;
      try {
        if (typeof scene?.is === 'function' && !scene.is('vr-mode')) return;
      } catch {}

      vrVideoStartedRef.current = true;
      try {
        startUi?.setAttribute('visible', 'false');
        startText?.setAttribute('visible', 'false');
      } catch {}

      // KEY: play() invoked from user gesture inside WebXR session.
      // Bind sphere BEFORE play; then play after a short delay to allow WebGL texture binding.
      try {
        sphere.setAttribute('material', 'src: #trainingvideo; side: back; shader: flat;');
      } catch {}

      window.setTimeout(() => {
        v.muted = false;
        void v
          .play()
          .then(() => {})
          .catch(() => {
            // fallback: start muted, then unmute shortly after
            try {
              v.muted = true;
            } catch {}
            void v.play().catch(() => {});
            window.setTimeout(() => {
              try {
                v.muted = false;
              } catch {}
            }, 600);
          });
      }, 300);
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
        if (timeGuardRef.current != null) {
          window.clearInterval(timeGuardRef.current);
          timeGuardRef.current = null;
        }
        // IMPORTANT: resume should never "re-init" playback. In some browsers/Quest,
        // toggling muted + retry loops can look like a restart. Preserve currentTime.
        const t = v.currentTime || lastPausedTimeRef.current || lastKnownTimeRef.current;
        // If something snapped to 0 while paused, restore immediately before play.
        try {
          if (Number.isFinite(t) && t > 0.05 && v.currentTime < Math.max(0, t - 0.15)) {
            v.currentTime = t;
          }
        } catch {}
        void v.play()
          .catch(() => {})
          .finally(() => {
            // If the browser reset playback, snap back to where we paused.
            try {
              if (Number.isFinite(t) && t > 0.05 && v.currentTime < Math.max(0, t - 0.15)) {
                v.currentTime = t;
              }
            } catch {}
          });
        // Some runtimes reset currentTime slightly after play() resolves.
        window.setTimeout(() => {
          const vv = videoRef.current;
          if (!vv) return;
          try {
            if (Number.isFinite(t) && t > 0.05 && vv.currentTime < Math.max(0, t - 0.25)) {
              vv.currentTime = t;
            }
          } catch {}
        }, 260);
      },
      pause: () => {
        const v = videoRef.current;
        if (!v) return;
        const saved = v.currentTime || lastKnownTimeRef.current;
        lastPausedTimeRef.current = saved;
        v.pause();
        // Quest/WebXR can snap the video element back to 0 while paused.
        // Guard continuously until we resume.
        if (timeGuardRef.current != null) {
          window.clearInterval(timeGuardRef.current);
          timeGuardRef.current = null;
        }
        timeGuardRef.current = window.setInterval(() => {
          const vv = videoRef.current;
          if (!vv) return;
          try {
            if (Number.isFinite(saved) && saved > 0.05 && vv.currentTime < Math.max(0, saved - 0.6)) {
              vv.currentTime = saved;
            }
          } catch {}
        }, 140);
      },
      getCurrentTime: () => videoRef.current?.currentTime ?? 0,
      getDuration: () => videoRef.current?.duration ?? 0,
      seek: (timeSeconds: number) => {
        const v = videoRef.current;
        if (!v) return;
        const t = Number.isFinite(timeSeconds) ? Math.max(0, timeSeconds) : 0;
        try {
          v.currentTime = t;
        } catch {}
      },
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
      setVrQuizVisible,
      showVrQuiz,
      hideVrQuiz,
      freezeFrame,
      resumeFromFreeze,
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
      return () => {
        if (timeGuardRef.current != null) {
          window.clearInterval(timeGuardRef.current);
          timeGuardRef.current = null;
        }
      };
    }, []);

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
        questRef.current = /OculusBrowser|Quest/i.test(window.navigator.userAgent ?? '');
        // VR button can be enabled again: quizzes render inside the scene for WebXR.
        const stereoUi = 'true';
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
              preload="auto"
              style="display:none;width:2px;height:2px;position:absolute;left:-9999px"
            ></video>
            <a-assets>
              <canvas id="freezeCanvas" width="1280" height="640"></canvas>
            </a-assets>
            <a-sphere
              id="videosphere"
              radius="100"
              position="0 0 0"
              rotation="0 -90 0"
              material="src: #trainingvideo; side: back; shader: flat;"
              segments-height="32"
              segments-width="32"
            ></a-sphere>
            <a-entity id="camera-rig" position="0 1.6 0">
              <a-camera id="main-camera" look-controls="pointerLockEnabled: false" wasd-controls="enabled: false">
                <a-entity id="vr-start-screen" visible="false">
                  <a-plane
                    position="0 0 -2"
                    width="2.5"
                    height="1.2"
                    material="color: #0d0d18; opacity: 0.95; shader: flat; side: double"
                  ></a-plane>
                  <a-text
                    value="ImmerseTrain"
                    color="#5B4CFF"
                    align="center"
                    width="3"
                    position="0 0.35 -1.99"
                  ></a-text>
                  <a-text
                    value="Press trigger or tap to begin training"
                    color="#FFFFFF"
                    align="center"
                    width="2.8"
                    position="0 0 -1.99"
                  ></a-text>
                  <a-ring
                    position="0 -0.35 -1.99"
                    radius-inner="0.08"
                    radius-outer="0.12"
                    color="#5B4CFF"
                    material="shader: flat"
                    animation="property: scale; to: 1.3 1.3 1; dur: 1000; loop: true; dir: alternate; easing: easeInOutSine"
                  ></a-ring>
                </a-entity>
                <a-entity
                  id="vr-start-btn"
                  class="clickable"
                  geometry="primitive: plane; width: 1.8; height: 0.6"
                  material="color: #5B4CFF; shader: flat; opacity: 0.95; side: double"
                  position="0 0 -2.5"
                  visible="false"
                ></a-entity>
                <a-text
                  id="vr-start-text"
                  value="PRESS TRIGGER OR TAP TO START"
                  color="#FFFFFF"
                  align="center"
                  width="2.6"
                  position="0 0 -2.49"
                  visible="false"
                ></a-text>

                <a-entity
                  id="gaze-cursor"
                  cursor="fuse: true; fuseTimeout: 1500"
                  position="0 0 -1"
                  geometry="primitive: ring; radiusInner: 0.014; radiusOuter: 0.02"
                  material="color: #FFFFFF; shader: flat; opacity: 0.85"
                  animation__fusing="property: scale; startEvents: fusing; from: 1 1 1; to: 0.5 0.5 0.5; dur: 1500; easing: easeInCubic"
                  animation__fusend="property: scale; startEvents: mouseleave; from: 0.5 0.5 0.5; to: 1 1 1; dur: 150"
                  raycaster="objects: .clickable; far: 8"
                  visible="false"
                ></a-entity>

                <a-entity id="quiz-panel" position="0 -0.25 -1.8" visible="false">
                  <a-plane
                    id="quiz-bg"
                    width="1.42"
                    height="0.88"
                    material="color: #0d0d18; shader: flat; opacity: 0.95; side: double"
                  ></a-plane>
                  <a-plane
                    width="1.42"
                    height="0.04"
                    position="0 0.42 0.001"
                    material="color: #5B4CFF; shader: flat; opacity: 1; side: double"
                  ></a-plane>

                  <a-text id="quiz-label" value="QUESTION 1 OF 10" color="#5B4CFF" align="left" anchor="left" width="1.25" position="-0.69 0.33 0.002"></a-text>
                  <a-text id="quiz-points" value="+ 10 pts" color="#00D4FF" align="right" anchor="right" width="1.0" position="0.69 0.33 0.002"></a-text>
                  <a-text id="quiz-question" value="Loading question..." color="#FFFFFF" align="left" anchor="left" width="1.25" wrap-count="40" position="-0.69 0.15 0.002"></a-text>

                  <a-entity id="option-a-btn" class="clickable" position="0 -0.12 0.002">
                    <a-plane id="option-a-bg" width="1.34" height="0.17" material="color: #1a1a2e; shader: flat; opacity: 0.98; side: double"></a-plane>
                    <a-text id="option-a-label" value="A" color="#5B4CFF" align="left" anchor="left" width="0.3" position="-0.62 0 0.001"></a-text>
                    <a-text id="option-a-text" value="Option A" color="#FFFFFF" align="left" anchor="left" width="1.1" wrap-count="38" position="-0.52 0 0.001"></a-text>
                  </a-entity>

                  <a-entity id="option-b-btn" class="clickable" position="0 -0.33 0.002">
                    <a-plane id="option-b-bg" width="1.34" height="0.17" material="color: #1a1a2e; shader: flat; opacity: 0.98; side: double"></a-plane>
                    <a-text id="option-b-label" value="B" color="#5B4CFF" align="left" anchor="left" width="0.3" position="-0.62 0 0.001"></a-text>
                    <a-text id="option-b-text" value="Option B" color="#FFFFFF" align="left" anchor="left" width="1.1" wrap-count="38" position="-0.52 0 0.001"></a-text>
                  </a-entity>

                  <a-text id="quiz-feedback" value="" color="#22c55e" align="center" width="1.25" wrap-count="44" position="0 -0.55 0.002" visible="false"></a-text>
                </a-entity>
              </a-camera>
            </a-entity>

            <a-entity laser-controls="hand: right" raycaster="objects: .clickable; far: 10"></a-entity>
            <a-entity laser-controls="hand: left" raycaster="objects: .clickable; far: 10"></a-entity>
          </a-scene>
        `;

        const videoEl = container.querySelector('#trainingvideo') as HTMLVideoElement | null;
        if (videoEl) {
          videoEl.src = resolvedSrc;
          videoEl.load();
        }

        const scene = container.querySelector('a-scene') as ASceneEl | null;
        sceneElRef.current = scene;
        sphereRef.current = container.querySelector('#videosphere') as any | null;
        freezeCanvasRef.current = container.querySelector('#freezeCanvas') as HTMLCanvasElement | null;
        vrStartScreenRef.current = container.querySelector('#vr-start-screen') as HTMLElement | null;
        vrStartBtnRef.current = container.querySelector('#vr-start-btn') as HTMLElement | null;
        vrStartTextRef.current = container.querySelector('#vr-start-text') as HTMLElement | null;

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
        const wireVr = () => {
          if (!sceneElRef.current) return;
          const s = sceneElRef.current as any;

          const forceTextureUpdate = () => {
            const sphere = sphereRef.current ?? (containerRef.current?.querySelector('#videosphere') as any | null);
            if (!sphere) return;
            try {
              const mat = sphere?.components?.material?.material;
              if (mat?.map) mat.map.needsUpdate = true;
              if (mat) mat.needsUpdate = true;
            } catch {}
            try {
              const mesh = sphere.getObject3D?.('mesh');
              const m = mesh?.material;
              if (m?.map) m.map.needsUpdate = true;
              if (m) m.needsUpdate = true;
            } catch {}
          };

          const enter = () => {
            setInVr(true);
            onVrModeChange?.(true);

            // Quest: require an in-VR gesture to start video decode reliably.
            if (questRef.current) {
              vrVideoStartedRef.current = false;
              try {
                vrStartScreenRef.current?.setAttribute('visible', 'false');
                vrStartBtnRef.current?.setAttribute('visible', 'true');
                vrStartTextRef.current?.setAttribute('visible', 'true');
              } catch {}
              try {
                // Delay binding sphere until play succeeds inside VR.
                sphereRef.current?.setAttribute('material', 'src: ; side: back; shader: flat;');
              } catch {}
              try {
                if (videoRef.current) videoRef.current.muted = true;
              } catch {}
              try {
                // Best-effort: if video was playing from inline start, pause it until VR gesture.
                if (videoRef.current && !videoRef.current.paused) videoRef.current.pause();
              } catch {}
            }

            // Force texture update burst on enter-vr (Quest WebXR black texture mitigation).
            forceTextureUpdate();
            window.setTimeout(forceTextureUpdate, 500);
            let count = 0;
            const interval = window.setInterval(() => {
              forceTextureUpdate();
              count++;
              if (count > 30) window.clearInterval(interval);
            }, 100);
          };
          const exit = () => {
            setInVr(false);
            onVrModeChange?.(false);
            hideVrQuiz();
            if (questRef.current) {
              vrVideoStartedRef.current = false;
              try {
                vrStartBtnRef.current?.setAttribute('visible', 'false');
                vrStartTextRef.current?.setAttribute('visible', 'false');
              } catch {}
              // Restore normal binding on exit.
              try {
                sphereRef.current?.setAttribute('material', 'src: #trainingvideo; side: back; shader: flat;');
              } catch {}
            }
          };
          sceneElRef.current?.addEventListener('enter-vr', enter);
          sceneElRef.current?.addEventListener('exit-vr', exit);

          // Gesture listeners inside VR (Quest).
          const handlers = vrStartHandlersRef.current;
          handlers.click = () => startVrVideoFromGesture();
          handlers.trigger = () => startVrVideoFromGesture();
          handlers.select = () => startVrVideoFromGesture();
          sceneElRef.current?.addEventListener('click', handlers.click);
          sceneElRef.current?.addEventListener('triggerdown', handlers.trigger);
          sceneElRef.current?.addEventListener('select', handlers.select);

          // Also attach directly to the VR start button entity so laser clicks work.
          const btn = vrStartBtnRef.current;
          if (btn) {
            btn.addEventListener('click', handlers.click);
            btn.addEventListener('triggerdown', handlers.trigger);
          }

          // If already in vr-mode, sync.
          try {
            if (typeof s?.is === 'function' && s.is('vr-mode')) {
              enter();
            }
          } catch {}
        };

        const cacheVrEls = () => {
          const root = containerRef.current;
          if (!root) return;
          vrElsRef.current = {
            panel: root.querySelector('#quiz-panel') as HTMLElement | null,
            cursor: root.querySelector('#gaze-cursor') as HTMLElement | null,
            label: root.querySelector('#quiz-label') as HTMLElement | null,
            points: root.querySelector('#quiz-points') as HTMLElement | null,
            q: root.querySelector('#quiz-question') as HTMLElement | null,
            aBtn: root.querySelector('#option-a-btn') as HTMLElement | null,
            bBtn: root.querySelector('#option-b-btn') as HTMLElement | null,
            aBg: root.querySelector('#option-a-bg') as HTMLElement | null,
            bBg: root.querySelector('#option-b-bg') as HTMLElement | null,
            aText: root.querySelector('#option-a-text') as HTMLElement | null,
            bText: root.querySelector('#option-b-text') as HTMLElement | null,
            feedback: root.querySelector('#quiz-feedback') as HTMLElement | null,
          };
        };

        const readyAll = () => {
          finishReady();
          cacheVrEls();
          wireVr();
        };

        if (scene.hasLoaded) readyAll();
        else scene.addEventListener('loaded', readyAll, { once: true });
      };

      void mount();

      return () => {
        cancelled = true;
        aliveRef.current = false;
        // Remove VR gesture listeners if present.
        if (sceneElRef.current) {
          const handlers = vrStartHandlersRef.current;
          if (handlers.click) sceneElRef.current.removeEventListener('click', handlers.click);
          if (handlers.trigger) sceneElRef.current.removeEventListener('triggerdown', handlers.trigger);
          if (handlers.select) sceneElRef.current.removeEventListener('select', handlers.select);
        }
        sceneElRef.current = null;
        videoRef.current = null;
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
      };
    }, [videoUrl, attachVideoListeners, fullscreenOnStart, hideVrQuiz, onVrModeChange, startVrVideoFromGesture]);

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
              {'Start 360° Training'}
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
              {'We’ll use fullscreen so the video + questions stay together. Allow motion if prompted, then move your head to look around.'}
            </p>
          </div>
        )}
      </div>
    );
  }
);

VideoPlayer360.displayName = 'VideoPlayer360';
export default VideoPlayer360;
