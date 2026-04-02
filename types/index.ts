export interface Scenario {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  duration_seconds: number;
  published: boolean;
  created_at: string;
}

export interface Question {
  id: string;
  scenario_id: string;
  timestamp_seconds: number;
  question_text: string;
  option_a: string;
  option_b: string;
  correct_option: 'a' | 'b';
  explanation: string;
  points: number;
  sort_order: number;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  scenario_id: string;
  score: number;
  max_score: number;
  completed: boolean;
  started_at: string;
  completed_at?: string;
}

export interface Answer {
  id: string;
  session_id: string;
  question_id: string;
  chosen_option: 'a' | 'b';
  is_correct: boolean;
  points_earned: number;
  answered_at: string;
}

export interface ScenarioWithQuestions extends Scenario {
  questions: Question[];
}

export interface SessionWithAnswers extends Session {
  answers: Answer[];
  scenario?: Scenario;
}

export type QuizState = 'playing' | 'paused_for_question' | 'showing_feedback' | 'completed';

export interface QuizAnswer {
  questionId: string;
  chosenOption: 'a' | 'b';
  isCorrect: boolean;
  pointsEarned: number;
}
