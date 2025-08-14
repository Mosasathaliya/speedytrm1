// Assessment system types for quizzes and final exam

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'fill-blank' | 'pronunciation';
  question_english: string;
  question_arabic: string;
  options?: string[];           // For MCQ
  correct_answer: string;
  explanation_english: string;
  explanation_arabic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  grammar_focus: string;        // e.g., "past_tense", "articles", "modal_verbs"
  lesson_reference: number[];   // Which lessons this question relates to
}

export interface FillBlankQuestion extends QuizQuestion {
  type: 'fill-blank';
  sentence_with_blank: string;   // "I _____ to school yesterday"
  blank_position: number;        // Position of the blank
  acceptable_answers: string[];  // Multiple correct possibilities
}

export interface PronunciationQuestion extends QuizQuestion {
  type: 'pronunciation';
  target_word: string;          // Word to pronounce
  phonetic_spelling: string;    // /wɜːrd/ or "WERD"
  audio_example_url?: string;   // Reference pronunciation
  minimum_accuracy: number;     // 70% default
}

export interface Quiz {
  id: string;
  title: string;
  description_english: string;
  description_arabic: string;
  position: number;            // Position in the 91-item journey (e.g., 12, 24, 36...)
  questions: QuizQuestion[];
  total_questions: number;     // 20 for regular quizzes, 60 for final exam
  passing_score: number;       // 12 for quizzes, 40 for final exam
  max_score: number;          // 20 for quizzes, 60 for final exam
  time_limit?: number;        // In minutes
  attempts_allowed: number;   // Reset on exit without completion
  covers_lessons: number[];   // Which lessons this quiz covers
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  attempt_number: number;
  started_at: string;
  completed_at?: string;
  is_completed: boolean;
  score: number;
  total_possible: number;
  passing_score: number;
  result: 'failed' | 'pass' | 'good' | 'excellent';
  answers: UserAnswer[];
  time_taken?: number;        // In seconds
}

export interface UserAnswer {
  question_id: string;
  user_answer: string;
  is_correct: boolean;
  pronunciation_accuracy?: number;  // For pronunciation questions
  time_spent: number;              // Seconds spent on this question
}

export interface AssessmentResult {
  score: number;
  total_possible: number;
  percentage: number;
  result: 'failed' | 'pass' | 'good' | 'excellent';
  message_english: string;
  message_arabic: string;
  animation_type: 'celebration' | 'encouragement' | 'failure';
  recommendations: string[];
  weak_areas: string[];        // Grammar topics to review
  strong_areas: string[];      // Grammar topics mastered
}

export interface QuizSession {
  quiz_id: string;
  user_id: string;
  session_token: string;
  started_at: string;
  expires_at: string;
  current_question: number;
  answers_so_far: UserAnswer[];
  is_final_exam: boolean;
}

// Quiz placement configuration
export interface QuizPlacement {
  position: number;           // After which item in the journey
  quiz_type: 'regular' | 'final';
  covers_items: number[];     // Which learning items it covers
  focus_areas: string[];      // Main grammar/vocabulary focus
}

// The 8 quiz placements + final exam
export const QUIZ_PLACEMENTS: QuizPlacement[] = [
  {
    position: 11,     // After item 11 (covers items 1-11)
    quiz_type: 'regular',
    covers_items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    focus_areas: ['alphabet', 'basic_greetings', 'numbers', 'colors', 'simple_present']
  },
  {
    position: 23,     // After item 23 (covers items 12-23)
    quiz_type: 'regular',
    covers_items: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    focus_areas: ['articles', 'pronouns', 'basic_vocabulary', 'question_formation']
  },
  {
    position: 34,     // After item 34 (covers items 24-34)
    quiz_type: 'regular',
    covers_items: [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34],
    focus_areas: ['past_tense', 'irregular_verbs', 'time_expressions']
  },
  {
    position: 45,     // After item 45 (covers items 35-45)
    quiz_type: 'regular',
    covers_items: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    focus_areas: ['future_tense', 'modal_verbs', 'conditional_sentences']
  },
  {
    position: 56,     // After item 56 (covers items 46-56)
    quiz_type: 'regular',
    covers_items: [46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56],
    focus_areas: ['perfect_tenses', 'passive_voice', 'reported_speech']
  },
  {
    position: 67,     // After item 67 (covers items 57-67)
    quiz_type: 'regular',
    covers_items: [57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67],
    focus_areas: ['complex_sentences', 'relative_clauses', 'advanced_vocabulary']
  },
  {
    position: 78,     // After item 78 (covers items 68-78)
    quiz_type: 'regular',
    covers_items: [68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78],
    focus_areas: ['phrasal_verbs', 'idioms', 'business_english']
  },
  {
    position: 89,     // After item 89 (covers items 79-89)
    quiz_type: 'regular',
    covers_items: [79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89],
    focus_areas: ['advanced_grammar', 'academic_writing', 'formal_language']
  },
  {
    position: 100,    // Final exam (covers all 91 items)
    quiz_type: 'final',
    covers_items: Array.from({length: 91}, (_, i) => i + 1),
    focus_areas: ['comprehensive_review', 'all_grammar_topics', 'practical_application']
  }
];

export const QUIZ_SCORING = {
  regular: {
    total_questions: 20,
    passing_score: 12,
    max_score: 20,
    scoring_bands: {
      failed: { min: 0, max: 11, message_en: "Failed - Review Required", message_ar: "راسب - يتطلب مراجعة" },
      pass: { min: 12, max: 16, message_en: "Passed - Good Work", message_ar: "نجح - عمل جيد" },
      good: { min: 17, max: 18, message_en: "Good Performance", message_ar: "أداء جيد" },
      excellent: { min: 19, max: 20, message_en: "Excellent Work!", message_ar: "عمل ممتاز!" }
    }
  },
  final: {
    total_questions: 60,
    passing_score: 40,
    max_score: 60,
    scoring_bands: {
      failed: { min: 0, max: 39, message_en: "Failed - Course Review Required", message_ar: "راسب - يتطلب مراجعة الدورة" },
      pass: { min: 40, max: 47, message_en: "Passed - Satisfactory", message_ar: "نجح - مرضي" },
      good: { min: 48, max: 53, message_en: "Good Performance", message_ar: "أداء جيد" },
      excellent: { min: 54, max: 60, message_en: "Excellent Mastery!", message_ar: "إتقان ممتاز!" }
    }
  }
};
