'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ScenarioWithQuestions } from '@/types';
import { DEMO_SCENARIO, SUBWAY_TOUR_SCENARIO } from '@/lib/scenarios';
import { isSupabaseUrlPlaceholder } from '@/lib/supabaseConfigured';
import { useQuizEngine } from '@/hooks/useQuizEngine';
import QuizOverlay from '@/components/train/QuizOverlay';
import ProgressBar from '@/components/train/ProgressBar';
import ScoreHUD from '@/components/train/ScoreHUD';
import type { VideoPlayer360Handle } from '@/components/train/VideoPlayer360';
import { enterTrainImmersive, exitTrainImmersive, isAppleMobileWebKit } from '@/lib/trainImmersive';

const VideoPlayer360 = dynamic(() => import('@/components/train/VideoPlayer360'), {
  ssr: false,
  loading: () => (
    <div style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(0,102,255,0.3)', borderTopColor: '#0066FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Loading 360° player...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  ),
});

export default function TrainPage() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const router = useRouter();
  const { user, isLoaded } = useCurrentUser();

  const [scenario, setScenario] = useState<ScenarioWithQuestions | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [playerReady, setPlayerReady] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [isTouchLike, setIsTouchLike] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(max-width: 1024px)').matches ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0
    );
  });
  const [appleMobile, setAppleMobile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isQuest, setIsQuest] = useState(false);
  const [quest360Mode, setQuest360Mode] = useState(false);
  const vrShownForQuestionId = useRef<string>('');
  const questVideoStyleRef = useRef<{
    style: string;
    controls: boolean;
  } | null>(null);

  const playerRef = useRef<VideoPlayer360Handle>(null);
  const trainShellRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);
  const cleanupTimeUpdate = useRef<(() => void) | null>(null);

  // Load scenario
  useEffect(() => {
    const load = async () => {
      try {
        if (scenarioId === 'demo-scenario-001') {
          setScenario(DEMO_SCENARIO);
        } else if (scenarioId === 'subway-tour-001') {
          setScenario(SUBWAY_TOUR_SCENARIO);
        } else {
          const res = await fetch(`/api/scenarios/${scenarioId}`);
          if (!res.ok) throw new Error('Not found');
          const data = await res.json();
          setScenario(data);
        }
      } catch {
        setScenario(DEMO_SCENARIO);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [scenarioId]);

  // Create session (Supabase off: local-only id + APIs return 200 without DB)
  useEffect(() => {
    if (!isLoaded || !scenario) return;

    if (isSupabaseUrlPlaceholder()) {
      setSessionId(`local-${Date.now()}`);
      return;
    }

    if (!user) return;

    const create = async () => {
      try {
        const res = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scenarioId: scenario.id,
            userEmail: user.primaryEmailAddress?.emailAddress ?? '',
            userName: user.fullName ?? user.firstName ?? 'Trainee',
          }),
        });
        const data = await res.json();
        setSessionId(data.sessionId ?? `local-${Date.now()}`);
      } catch {
        setSessionId(`local-${Date.now()}`);
      }
    };
    create();
  }, [isLoaded, user, scenario]);

  const handleComplete = useCallback(
    async (finalScore: number, answers: import('@/types').QuizAnswer[]) => {
      setCompleted(true);
      // Persist answers for results page
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastQuizAnswers', JSON.stringify(answers));
        localStorage.setItem('lastQuizScore', String(finalScore));
        localStorage.setItem('lastScenarioTitle', scenario?.title ?? '');
      }
      if (sessionId) {
        try {
          await fetch('/api/sessions', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, score: finalScore, completed: true }),
          });
        } catch {}
      }
      setTimeout(() => {
        router.push(`/results/${sessionId || 'demo'}`);
      }, 2000);
    },
    [sessionId, router, scenario]
  );

  const quiz = useQuizEngine({
    questions: scenario?.questions ?? [],
    sessionId,
    onComplete: handleComplete,
  });

  const enterQuest360 = useCallback(async () => {
    const v = playerRef.current?.getVideoElement();
    if (!v) return;
    try {
      // Make the video "paintable" before fullscreen handoff (Quest native compositor).
      if (!questVideoStyleRef.current) {
        questVideoStyleRef.current = { style: v.getAttribute('style') ?? '', controls: v.hasAttribute('controls') };
      }
      v.setAttribute(
        'style',
        [
          'position:fixed',
          'inset:0',
          'width:100vw',
          'height:100vh',
          'opacity:1',
          'z-index:99999',
          'object-fit:cover',
          'background:#000',
        ].join(';')
      );
      v.setAttribute('controls', '');

      // Must be invoked in the same user gesture as fullscreen on Quest.
      // Try to ensure playback is "awake" before native 360 reprojection kicks in.
      try {
        v.muted = false;
      } catch {}
      await v.play().catch(() => {});

      // Quest shows a native “360°” projection option in its fullscreen player.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyV = v as any;
      if (typeof v.requestFullscreen === 'function') {
        await v.requestFullscreen();
      } else if (typeof anyV.webkitEnterFullscreen === 'function') {
        anyV.webkitEnterFullscreen();
      }
      // Some Quest builds need play() again after fullscreen.
      await v.play().catch(() => {});
      setQuest360Mode(true);
    } catch {}
  }, []);

  const exitQuest360 = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch {}
    // Restore video element styles.
    const v = playerRef.current?.getVideoElement();
    const prev = questVideoStyleRef.current;
    if (v && prev) {
      try {
        v.setAttribute('style', prev.style || 'width:1px;height:1px;opacity:0.01;position:absolute;left:0;top:0;pointer-events:none');
        if (!prev.controls) v.removeAttribute('controls');
      } catch {}
      questVideoStyleRef.current = null;
    }
    setQuest360Mode(false);
  }, []);

  // If user exits fullscreen via system UI, restore video styles.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!isQuest) return;
    const onFsChange = () => {
      if (document.fullscreenElement) return;
      if (quest360Mode) void exitQuest360();
    };
    document.addEventListener('fullscreenchange', onFsChange);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (document as any).addEventListener?.('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (document as any).removeEventListener?.('webkitfullscreenchange', onFsChange);
    };
  }, [isQuest, quest360Mode, exitQuest360]);

  // Register time-update listener once player is ready
  useEffect(() => {
    if (!playerReady || !playerRef.current) return;
    cleanupTimeUpdate.current = playerRef.current.onTimeUpdate((time) => {
      if (quiz.quizState !== 'playing') return;
      const shouldPause = quiz.checkTimestamp(time);
      if (shouldPause && !isPausedRef.current) {
        isPausedRef.current = true;
        if (isQuest && quest360Mode) {
          // Native Quest fullscreen mode: exit fullscreen so HTML quiz can appear, then pause video.
          void exitQuest360();
          playerRef.current?.pause();
        } else {
          // Default: freeze the sphere.
          playerRef.current?.freezeFrame();
        }
      }
    });
    return () => cleanupTimeUpdate.current?.();
  }, [playerReady, quiz.quizState, quiz.checkTimestamp, isQuest, quest360Mode, exitQuest360]);

  // Resume video when quiz returns to 'playing'
  useEffect(() => {
    if (quiz.quizState === 'playing' && isPausedRef.current) {
      isPausedRef.current = false;
      if (isQuest && quest360Mode) {
        // Browsers generally require a user gesture to re-enter fullscreen.
        // Resume playback and let the user tap fullscreen again.
        setTimeout(() => {
          playerRef.current?.play();
        }, 60);
      } else {
        setTimeout(() => playerRef.current?.resumeFromFreeze(0.6), 60);
      }
    }
  }, [quiz.quizState, isQuest, quest360Mode]);

  const maxScore = (scenario?.questions.length ?? 10) * 10;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 1024px)');
    const check = () =>
      setIsTouchLike(mq.matches || 'ontouchstart' in window || navigator.maxTouchPoints > 0);
    check();
    mq.addEventListener('change', check);
    return () => mq.removeEventListener('change', check);
  }, []);

  useEffect(() => () => exitTrainImmersive(), []);

  useEffect(() => {
    setAppleMobile(isAppleMobileWebKit());
  }, []);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    setIsQuest(/OculusBrowser|Quest/i.test(navigator.userAgent ?? ''));
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    // Safari legacy (best-effort)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (document as any).addEventListener?.('webkitfullscreenchange', onFsChange);
    onFsChange();
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (document as any).removeEventListener?.('webkitfullscreenchange', onFsChange);
    };
  }, []);

  if (loading) {
    return (
      <div style={{ height: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 44, height: 44, border: '3px solid rgba(0,102,255,0.2)', borderTopColor: '#0066FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>Loading training scenario...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div
      ref={trainShellRef}
      data-train-fullscreen-root
      style={{
        minHeight: '100dvh',
        height: '100vh',
        width: '100%',
        maxWidth: '100vw',
        background: '#000',
        position: 'relative',
        overflow: 'hidden',
      }}
    >

      {/* ── Top HUD ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
        padding: '14px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)',
        pointerEvents: 'none',
      }}>
        {/* Back + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, pointerEvents: 'all' }}>
          <Link
            href="/dashboard"
            onClick={() => exitTrainImmersive()}
            style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', textDecoration: 'none',
            }}
          >
            <ArrowLeft size={15} />
          </Link>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Training</p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '28vw' }}>
              {scenario?.title}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="hidden sm:block">
          <ProgressBar answered={quiz.answeredCount} total={quiz.totalQuestions} />
        </div>

        {/* Score */}
        <ScoreHUD score={quiz.score} maxScore={maxScore} />
      </div>

      {/* ── 360° Video ── */}
      <VideoPlayer360
        ref={playerRef}
        videoUrl={scenario?.video_url ?? DEMO_SCENARIO.video_url}
        fullscreenRootRef={trainShellRef}
        fullscreenOnStart
        onReady={() => {
          setPlayerReady(true);
        }}
      />

      {/* ── Quiz overlay ── */}
      <AnimatePresence>
        {(quiz.quizState === 'paused_for_question' || quiz.quizState === 'showing_feedback') &&
          quiz.currentQuestion && (
          <QuizOverlay
            key={quiz.currentQuestion.id}
            question={quiz.currentQuestion}
            onAnswer={quiz.submitAnswer}
            feedback={quiz.lastAnswer}
            questionIndex={quiz.answeredCount > 0 && quiz.lastAnswer ? quiz.answeredCount - 1 : quiz.answeredCount}
            totalQuestions={quiz.totalQuestions}
          />
        )}
      </AnimatePresence>

      {/* ── Completion screen ── */}
      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'absolute', inset: 0, zIndex: 50,
              background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(24px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              style={{ textAlign: 'center', color: 'white', padding: '0 24px' }}
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                transition={{ duration: 0.6, delay: 0.3 }}
                style={{ fontSize: 72, marginBottom: 20, display: 'inline-block' }}
              >
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#5B4CFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" fill="#5B4CFF" /></svg>
              </motion.div>
              <h2 style={{ fontFamily: 'var(--font-syne, system-ui)', fontSize: 36, fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
                Training Complete!
              </h2>
              <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.6)', margin: '0 0 6px' }}>
                Score: <span style={{ color: 'white', fontWeight: 700 }}>{quiz.score}</span> / {maxScore}
              </p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>Redirecting to your results...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── VR hint ── */}
      {playerReady && !completed && (
        <div style={{
          position: 'absolute', bottom: 16, right: 16, zIndex: 10,
          fontSize: 11, color: 'rgba(255,255,255,0.22)',
          background: 'rgba(0,0,0,0.5)', borderRadius: 8, padding: '6px 12px',
          backdropFilter: 'blur(8px)', letterSpacing: '0.02em',
        }}>
          {appleMobile
            ? 'iPhone/iPad: immersive view after Start · allow motion · Back exits'
            : 'Fullscreen keeps questions visible · allow motion if prompted · Back exits'}
        </div>
      )}

      {/* Fullscreen toggle (desktop: fullscreen shell, Quest: fullscreen video element) */}
      {playerReady && !completed && (
        <button
          type="button"
          onClick={() => {
            if (isQuest) {
              // YouTube-style: fullscreen the <video> itself so Quest can enable native 360 reprojection.
              if (quest360Mode) void exitQuest360();
              else void enterQuest360();
              return;
            }

            // Desktop / mobile: fullscreen the shell so HTML quiz overlay remains visible.
            if (isFullscreen) exitTrainImmersive();
            else enterTrainImmersive(trainShellRef.current);
          }}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            zIndex: 12,
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'rgba(0,0,0,0.55)',
            border: '1px solid rgba(255,255,255,0.16)',
            color: 'rgba(255,255,255,0.86)',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
          }}
        >
          {isFullscreen ? '⤢' : '⛶'}
        </button>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
