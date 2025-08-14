// Quiz integration with the 91-item learning journey
import type { LearningItem } from '@/types/comprehensive-learning';
import type { QuizPlacement, Quiz } from '@/types/assessment';
import { COMPREHENSIVE_LEARNING_ITEMS } from './comprehensive-learning-data';

// Quiz placements - strategically placed throughout the journey
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

// Create quiz items for integration
export function createQuizItems(): LearningItem[] {
  const quizItems: LearningItem[] = [];
  
  QUIZ_PLACEMENTS.forEach((placement, index) => {
    const isLastQuiz = placement.quiz_type === 'final';
    const quizNumber = index + 1;
    
    const quizItem: LearningItem = {
      id: isLastQuiz ? 'final-exam' : `quiz-${quizNumber}`,
      type: 'quiz',
      number: isLastQuiz ? 100 : (placement.position + 1),
      title: isLastQuiz ? 'Final Comprehensive Exam' : `Progress Quiz ${quizNumber}`,
      titleAr: isLastQuiz ? 'الامتحان النهائي الشامل' : `اختبار التقدم ${quizNumber}`,
      description: isLastQuiz 
        ? 'Comprehensive final exam covering all course materials with 60 questions including MCQ, fill-in-blanks, and pronunciation tests'
        : `Assessment quiz covering lessons ${placement.covers_items[0]}-${placement.covers_items[placement.covers_items.length - 1]} with 20 questions focusing on ${placement.focus_areas.join(', ')}`,
      descriptionAr: isLastQuiz
        ? 'امتحان نهائي شامل يغطي جميع مواد الدورة مع 60 سؤالاً تشمل الاختيار من متعدد وملء الفراغات واختبارات النطق'
        : `اختبار تقييم يغطي الدروس ${placement.covers_items[0]}-${placement.covers_items[placement.covers_items.length - 1]} مع 20 سؤالاً يركز على ${placement.focus_areas.join('، ')}`,
      difficulty: isLastQuiz ? 'advanced' : 'intermediate',
      category: 'Assessment',
      prerequisites: placement.covers_items,
      estimatedTime: isLastQuiz ? 90 : 30, // 90 minutes for final exam, 30 for regular quizzes
      unlocked: false,
      completed: false,
      metadata: {
        quiz_type: placement.quiz_type,
        covers_items: placement.covers_items,
        focus_areas: placement.focus_areas,
        total_questions: isLastQuiz ? 60 : 20,
        passing_score: isLastQuiz ? 40 : 12,
        max_score: isLastQuiz ? 60 : 20
      }
    };
    
    quizItems.push(quizItem);
  });
  
  return quizItems;
}

// Integrate quizzes into the complete learning journey (91 + 9 = 100 items)
export function getCompleteJourneyWithQuizzes(): LearningItem[] {
  const originalItems = [...COMPREHENSIVE_LEARNING_ITEMS];
  const quizItems = createQuizItems();
  const completeJourney: LearningItem[] = [];
  
  let quizIndex = 0;
  
  // Insert original items and quizzes at appropriate positions
  for (let i = 0; i < originalItems.length; i++) {
    // Add the original learning item
    completeJourney.push(originalItems[i]);
    
    // Check if we need to insert a quiz after this item
    const currentPosition = i + 1;
    const nextQuiz = quizItems[quizIndex];
    
    if (nextQuiz && nextQuiz.metadata && currentPosition === QUIZ_PLACEMENTS[quizIndex].position) {
      // Insert quiz after this position
      completeJourney.push(nextQuiz);
      quizIndex++;
    }
  }
  
  // Add final exam at the end
  const finalExam = quizItems.find(q => q.id === 'final-exam');
  if (finalExam) {
    completeJourney.push(finalExam);
  }
  
  return completeJourney;
}

// Get quiz configuration for a specific quiz
export function getQuizConfig(quizId: string): QuizPlacement | null {
  const quizNumber = parseInt(quizId.replace('quiz-', ''));
  if (quizId === 'final-exam') {
    return QUIZ_PLACEMENTS[QUIZ_PLACEMENTS.length - 1]; // Last placement is final exam
  }
  if (quizNumber >= 1 && quizNumber <= 8) {
    return QUIZ_PLACEMENTS[quizNumber - 1];
  }
  return null;
}

// Check if user can access a quiz (based on completed prerequisites)
export function canAccessQuiz(quizId: string, completedItems: string[]): boolean {
  const config = getQuizConfig(quizId);
  if (!config) return false;
  
  // User must complete all items that the quiz covers
  const requiredItems = config.covers_items.map(num => `item-${num}`);
  return requiredItems.every(itemId => completedItems.includes(itemId));
}

// Get next quiz for a user based on their progress
export function getNextAvailableQuiz(completedItems: string[]): string | null {
  for (let i = 0; i < QUIZ_PLACEMENTS.length; i++) {
    const quizId = i === QUIZ_PLACEMENTS.length - 1 ? 'final-exam' : `quiz-${i + 1}`;
    
    if (canAccessQuiz(quizId, completedItems) && !completedItems.includes(quizId)) {
      return quizId;
    }
  }
  return null;
}

// Calculate total journey length (91 original + 8 quizzes + 1 final exam = 100)
export const TOTAL_JOURNEY_LENGTH = 100;
export const ORIGINAL_ITEMS_COUNT = 91;
export const QUIZ_COUNT = 8;
export const FINAL_EXAM_COUNT = 1;
