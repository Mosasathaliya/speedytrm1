// Types for the comprehensive 91-item learning system
export interface LearningItem {
  id: string;
  type: 'lesson' | 'game';
  number: number;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  prerequisites: string[];
  estimatedTime: number; // in minutes
  unlocked: boolean;
  completed: boolean;
  score?: number;
}

export interface GameConfig {
  gameType: 'vocabulary-matching' | 'grammar-adventure' | 'story-builder' | 'pronunciation-practice' | 
           'listening-comprehension' | 'word-puzzle' | 'conversation-simulator' | 'image-quiz' | 
           'memory-cards' | 'spelling-challenge';
  difficulty: 'easy' | 'medium' | 'hard';
  topics: string[];
  timeLimit?: number;
  maxAttempts?: number;
}

export interface LessonConfig {
  topic: string;
  objectives: string[];
  vocabulary: string[];
  grammarPoints: string[];
  examples: number;
}

export interface LearningProgress {
  userId: string;
  currentItem: number;
  completedItems: number[];
  totalScore: number;
  streakDays: number;
  achievements: string[];
  lastActivity: Date;
}

// Game-specific types
export interface VocabularyMatchingGame {
  theme: string;
  themeAr: string;
  pairs: {
    english: string;
    arabic: string;
    emoji: string;
    image?: string;
  }[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GrammarAdventureGame {
  story: string;
  storyAr: string;
  imageUrl: string;
  question: string;
  questionAr: string;
  options: {
    text: string;
    textAr: string;
    isCorrect: boolean;
  }[];
  explanation: string;
  explanationAr: string;
}

export interface StoryBuilderGame {
  theme: string;
  sceneDescription: string;
  sceneDescriptionAr: string;
  imageUrl: string;
  vocabulary: {
    word: string;
    definition: string;
    definitionAr: string;
  }[];
  choices: {
    text: string;
    textAr: string;
    consequence: string;
  }[];
}

export interface PronunciationGame {
  words: {
    text: string;
    phonetic: string;
    audioUrl: string;
    difficulty: number;
  }[];
  targetAccuracy: number;
}

export interface ListeningGame {
  audioUrl: string;
  transcript: string;
  transcriptAr: string;
  questions: {
    question: string;
    questionAr: string;
    options: string[];
    optionsAr: string[];
    correctAnswer: number;
  }[];
}

export interface WordPuzzleGame {
  type: 'crossword' | 'wordsearch' | 'anagram';
  title: string;
  titleAr: string;
  grid?: string[][];
  words: {
    word: string;
    clue: string;
    clueAr: string;
    position?: { x: number; y: number; direction: 'horizontal' | 'vertical' };
  }[];
}

export interface ConversationGame {
  scenario: string;
  scenarioAr: string;
  character: string;
  characterAr: string;
  imageUrl: string;
  dialogue: {
    speaker: 'user' | 'character';
    text: string;
    textAr: string;
    options?: {
      text: string;
      textAr: string;
      response: string;
      responseAr: string;
    }[];
  }[];
}

export interface ImageQuizGame {
  images: {
    url: string;
    correctAnswer: string;
    correctAnswerAr: string;
    options: string[];
    optionsAr: string[];
    hint?: string;
    hintAr?: string;
  }[];
}

export interface MemoryCardsGame {
  theme: string;
  themeAr: string;
  cards: {
    id: string;
    type: 'word' | 'image' | 'sound';
    content: string;
    contentAr?: string;
    imageUrl?: string;
    audioUrl?: string;
    matchId: string;
  }[];
}

export interface SpellingGame {
  words: {
    word: string;
    definition: string;
    definitionAr: string;
    audioUrl: string;
    hint?: string;
    hintAr?: string;
    difficulty: number;
  }[];
  gameMode: 'dictation' | 'fill-blanks' | 'scrambled';
}
