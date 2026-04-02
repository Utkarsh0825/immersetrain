'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Zap } from 'lucide-react';
import { Question } from '@/types';

interface QuizOverlayProps {
  question: Question;
  onAnswer: (option: 'a' | 'b') => void;
  feedback: { isCorrect: boolean; explanation: string; pointsEarned: number } | null;
  questionIndex: number;
  totalQuestions: number;
}

export default function QuizOverlay({
  question,
  onAnswer,
  feedback,
  questionIndex,
  totalQuestions,
}: QuizOverlayProps) {
  const [selected, setSelected] = useState<'a' | 'b' | null>(null);

  const handleSelect = (opt: 'a' | 'b') => {
    if (selected || feedback) return;
    setSelected(opt);
    onAnswer(opt);
  };

  const getOptionStyle = (opt: 'a' | 'b') => {
    const base: React.CSSProperties = {
      width: '100%',
      padding: '14px 18px',
      borderRadius: 12,
      border: '1px solid rgba(255,255,255,0.1)',
      background: 'rgba(255,255,255,0.04)',
      color: 'rgba(255,255,255,0.8)',
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 1.4,
      textAlign: 'left',
      cursor: selected ? 'default' : 'pointer',
      transition: 'all 0.25s ease',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
    };

    if (!feedback || selected !== opt) {
      if (selected === opt && !feedback) {
        return { ...base, background: 'rgba(0,102,255,0.15)', borderColor: 'rgba(0,102,255,0.4)' };
      }
      return base;
    }

    // Show feedback colors
    const isCorrectAnswer = opt === question.correct_option;
    const isSelectedAnswer = selected === opt;

    if (isCorrectAnswer) {
      return {
        ...base,
        background: 'rgba(34,197,94,0.12)',
        borderColor: 'rgba(34,197,94,0.5)',
        color: '#22c55e',
      };
    }
    if (isSelectedAnswer && !isCorrectAnswer) {
      return {
        ...base,
        background: 'rgba(239,68,68,0.12)',
        borderColor: 'rgba(239,68,68,0.5)',
        color: '#ef4444',
      };
    }
    return { ...base, opacity: 0.4 };
  };

  const getOptionIcon = (opt: 'a' | 'b') => {
    if (!feedback || selected !== opt) {
      if (opt === question.correct_option && feedback) {
        return <CheckCircle2 size={16} color="#22c55e" style={{ flexShrink: 0, marginTop: 1 }} />;
      }
      return (
        <span style={{
          width: 20, height: 20, borderRadius: 6,
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, flexShrink: 0,
          color: 'rgba(255,255,255,0.5)',
        }}>
          {opt.toUpperCase()}
        </span>
      );
    }

    const isCorrect = opt === question.correct_option;
    const isSelected = selected === opt;

    if (isCorrect) return <CheckCircle2 size={16} color="#22c55e" style={{ flexShrink: 0, marginTop: 1 }} />;
    if (isSelected && !isCorrect) return <XCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />;

    return (
      <span style={{
        width: 20, height: 20, borderRadius: 6,
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, flexShrink: 0,
        color: 'rgba(255,255,255,0.25)',
      }}>
        {opt.toUpperCase()}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: '0 16px 32px',
        zIndex: 20,
        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 40%, transparent 70%)',
      }}
    >
      <motion.div
        initial={{ y: 60, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        style={{
          width: '100%', maxWidth: 560,
          background: 'rgba(8,8,12,0.92)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24,
          padding: '24px',
          boxShadow: '0 -8px 60px rgba(0,0,0,0.5), 0 30px 80px rgba(0,0,0,0.6)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(0,102,255,0.5), transparent)',
        }} />

        {/* Progress indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: '#0066FF',
          }}>
            Question {questionIndex + 1} of {totalQuestions}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Zap size={11} color="#0066FF" fill="#0066FF" />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#0066FF' }}>
              {question.points} pts
            </span>
          </div>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 3, flex: 1, borderRadius: 2,
                background: i <= questionIndex ? '#0066FF' : 'rgba(255,255,255,0.1)',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        {/* Question text */}
        <h3 style={{
          fontFamily: 'var(--font-syne, system-ui)',
          fontSize: 16, fontWeight: 700, color: 'white',
          lineHeight: 1.45, marginBottom: 20,
        }}>
          {question.question_text}
        </h3>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(['a', 'b'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              style={getOptionStyle(opt) as React.CSSProperties}
              onMouseEnter={(e) => {
                if (!selected && !feedback) {
                  const el = e.currentTarget;
                  el.style.background = 'rgba(0,102,255,0.1)';
                  el.style.borderColor = 'rgba(0,102,255,0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!selected && !feedback) {
                  const el = e.currentTarget;
                  el.style.background = 'rgba(255,255,255,0.04)';
                  el.style.borderColor = 'rgba(255,255,255,0.1)';
                }
              }}
            >
              {getOptionIcon(opt)}
              <span style={{ lineHeight: 1.45 }}>
                {opt === 'a' ? question.option_a : question.option_b}
              </span>
            </button>
          ))}
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                marginTop: 16, padding: '14px 16px', borderRadius: 12,
                background: feedback.isCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${feedback.isCorrect ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
                }}>
                  {feedback.isCorrect
                    ? <CheckCircle2 size={15} color="#22c55e" />
                    : <XCircle size={15} color="#ef4444" />}
                  <span style={{
                    fontSize: 13, fontWeight: 700,
                    color: feedback.isCorrect ? '#22c55e' : '#ef4444',
                  }}>
                    {feedback.isCorrect ? `Correct! +${feedback.pointsEarned} points` : 'Incorrect'}
                  </span>
                </div>
                {!feedback.isCorrect && (
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                    {feedback.explanation}
                  </p>
                )}
              </div>

              {/* Floating points animation */}
              {feedback.isCorrect && (
                <motion.div
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 0, y: -40 }}
                  transition={{ duration: 1.5, delay: 0.3 }}
                  style={{
                    position: 'absolute', top: 20, right: 24,
                    fontSize: 20, fontWeight: 900, color: '#22c55e',
                    pointerEvents: 'none',
                    textShadow: '0 0 20px rgba(34,197,94,0.5)',
                  }}
                >
                  +{feedback.pointsEarned}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
