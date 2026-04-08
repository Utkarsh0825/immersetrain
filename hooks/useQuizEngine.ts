'use client';
import { useState, useCallback, useRef } from 'react';
import { Question, QuizState, QuizAnswer } from '@/types';

interface UseQuizEngineProps {
  questions: Question[];
  sessionId: string;
  onComplete: (score: number, answers: QuizAnswer[]) => void;
}

interface QuizEngineState {
  state: QuizState;
  currentQuestion: Question | null;
  currentQuestionIndex: number;
  answeredQuestions: Set<string>;
  answers: QuizAnswer[];
  score: number;
  lastAnswer: { isCorrect: boolean; explanation: string; pointsEarned: number } | null;
}

export function useQuizEngine({ questions, sessionId, onComplete }: UseQuizEngineProps) {
  const [engineState, setEngineState] = useState<QuizEngineState>({
    state: 'playing',
    currentQuestion: null,
    currentQuestionIndex: 0,
    answeredQuestions: new Set(),
    answers: [],
    score: 0,
    lastAnswer: null,
  });

  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkTimestamp = useCallback((currentTimeSeconds: number) => {
    if (engineState.state !== 'playing') return false;

    const triggered = questions.find(
      (q) =>
        !engineState.answeredQuestions.has(q.id) &&
        currentTimeSeconds >= q.timestamp_seconds &&
        currentTimeSeconds < q.timestamp_seconds + 2
    );

    if (triggered) {
      setEngineState((prev) => ({
        ...prev,
        state: 'paused_for_question',
        currentQuestion: triggered,
      }));
      return true; // signal to pause video
    }
    return false;
  }, [questions, engineState.state, engineState.answeredQuestions]);

  const submitAnswer = useCallback(async (chosenOption: 'a' | 'b') => {
    const { currentQuestion, score, answers, answeredQuestions } = engineState;
    if (!currentQuestion || engineState.state !== 'paused_for_question') return;

    const isCorrect = chosenOption === currentQuestion.correct_option;
    const pointsEarned = isCorrect ? currentQuestion.points : 0;
    const newScore = score + pointsEarned;

    const newAnswer: QuizAnswer = {
      questionId: currentQuestion.id,
      chosenOption,
      isCorrect,
      pointsEarned,
    };

    // Save answer to API (fire and forget)
    fetch('/api/answers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        questionId: currentQuestion.id,
        chosenOption,
        isCorrect,
        pointsEarned,
      }),
    }).catch(console.error);

    const newAnsweredQuestions = new Set(answeredQuestions);
    newAnsweredQuestions.add(currentQuestion.id);
    const newAnswers = [...answers, newAnswer];
    const allAnswered = newAnsweredQuestions.size >= questions.length;

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'immersetrain_quiz_progress',
          JSON.stringify({
            sessionId,
            answers: newAnswers,
            score: newScore,
            at: Date.now(),
          })
        );
      }
    } catch {
      /* ignore quota / private mode */
    }

    setEngineState((prev) => ({
      ...prev,
      state: 'showing_feedback',
      score: newScore,
      answers: newAnswers,
      answeredQuestions: newAnsweredQuestions,
      lastAnswer: {
        isCorrect,
        explanation: currentQuestion.explanation,
        pointsEarned,
      },
    }));

    // Auto-advance after feedback
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => {
      if (allAnswered) {
        setEngineState((prev) => ({ ...prev, state: 'completed', currentQuestion: null }));
        onComplete(newScore, newAnswers);
      } else {
        setEngineState((prev) => ({
          ...prev,
          state: 'playing',
          currentQuestion: null,
          lastAnswer: null,
        }));
      }
    }, 2500);
  }, [engineState, questions, sessionId, onComplete]);

  const dismissFeedback = useCallback(() => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    const { answeredQuestions } = engineState;
    const allAnswered = answeredQuestions.size >= questions.length;
    if (allAnswered) {
      setEngineState((prev) => ({ ...prev, state: 'completed', currentQuestion: null, lastAnswer: null }));
      onComplete(engineState.score, engineState.answers);
    } else {
      setEngineState((prev) => ({ ...prev, state: 'playing', currentQuestion: null, lastAnswer: null }));
    }
  }, [engineState, questions.length, onComplete]);

  return {
    quizState: engineState.state,
    currentQuestion: engineState.currentQuestion,
    score: engineState.score,
    answeredCount: engineState.answeredQuestions.size,
    totalQuestions: questions.length,
    lastAnswer: engineState.lastAnswer,
    checkTimestamp,
    submitAnswer,
    dismissFeedback,
  };
}
