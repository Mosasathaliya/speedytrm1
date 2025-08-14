// User-specific content management types

export interface UserGeneratedContent {
  id: string;
  user_id: string;
  content_type: 'lesson' | 'game' | 'story' | 'quiz';
  item_id: string;           // lesson-1, game-1, quiz-1, etc.
  content_data: any;         // Generated content (lesson, game data, quiz questions)
  generated_at: string;      // When it was generated
  accessed_count: number;    // How many times user accessed this content
  last_accessed: string;     // Last access timestamp
  is_completed: boolean;     // Whether user completed this content
  completion_data?: any;     // Score, answers, game results, etc.
  locked: boolean;           // Whether content is locked (e.g., passed quizzes)
}

export interface UserProgress {
  user_id: string;
  current_item_index: number;          // Current position in 100-item journey
  completed_items: string[];           // List of completed item IDs
  passed_quizzes: string[];            // List of passed quiz IDs (these get locked)
  failed_quizzes: string[];            // List of failed quiz IDs (can retake)
  total_score: number;                 // Overall learning score
  quiz_scores: Record<string, number>; // quiz_id -> score
  game_scores: Record<string, number>; // game_id -> score
  lesson_completion: Record<string, boolean>; // lesson_id -> completed
  navigation_history: string[];       // Track user navigation through items
  last_accessed_item: string;         // Last item user was on
  created_at: string;
  updated_at: string;
}

export interface NavigationState {
  canGoNext: boolean;
  canGoPrevious: boolean;
  nextItemId?: string;
  previousItemId?: string;
  currentIndex: number;
  totalItems: number;
  isQuizLocked: boolean;              // If current item is a passed quiz
  lockedReason?: string;              // Why item is locked
}

export interface ContentGenerationRequest {
  user_id: string;
  item_id: string;
  content_type: 'lesson' | 'game' | 'story' | 'quiz';
  item_metadata: any;                 // Item configuration data
  user_learning_context: any;        // User's learning history for personalization
}

export interface ContentGenerationResponse {
  success: boolean;
  content: UserGeneratedContent | null;
  cached: boolean;                    // Whether content was retrieved from cache
  generation_time?: number;           // Time taken to generate (if new)
  message: string;
}

export interface UserNavigationSession {
  user_id: string;
  session_id: string;
  current_item_index: number;
  journey_items: string[];            // Full list of 100 item IDs
  progress_state: UserProgress;
  navigation_state: NavigationState;
  created_at: string;
  expires_at: string;
}

// User content access control
export interface ContentAccessRule {
  item_id: string;
  access_type: 'always' | 'after_completion' | 'locked_after_pass' | 'prerequisite';
  prerequisites?: string[];           // Required completed items
  lock_condition?: 'quiz_passed' | 'time_limit' | 'attempt_limit';
  lock_data?: any;                   // Additional lock configuration
}

// Content generation caching strategy
export interface ContentCacheConfig {
  cache_duration_hours: number;      // How long to cache generated content
  regenerate_on_fail: boolean;       // Regenerate if user fails quiz/game
  personalization_level: 'high' | 'medium' | 'low'; // How much to personalize
  max_cached_items_per_user: number; // Storage limit per user
}

// User journey item with navigation data
export interface NavigableItem {
  id: string;
  type: 'lesson' | 'game' | 'quiz' | 'story';
  index: number;                      // Position in 100-item journey
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  is_generated: boolean;              // Whether content needs generation
  is_accessible: boolean;             // Whether user can access this item
  is_completed: boolean;              // Whether user completed this item
  is_locked: boolean;                 // Whether item is locked (passed quizzes)
  lock_reason?: string;               // Why item is locked
  prerequisites: string[];            // Required items before this one
  user_content?: UserGeneratedContent; // User's generated content for this item
  navigation: {
    canGoNext: boolean;
    canGoPrevious: boolean;
    nextItemId?: string;
    previousItemId?: string;
  };
}

// Database schema interfaces
export interface UserContentDB {
  id: string;
  user_id: string;
  item_id: string;
  content_type: string;
  content_data: string;              // JSON string
  generated_at: string;
  accessed_count: number;
  last_accessed: string;
  is_completed: boolean;
  completion_data?: string;          // JSON string
  locked: boolean;
}

export interface UserProgressDB {
  user_id: string;
  current_item_index: number;
  completed_items: string;           // JSON array
  passed_quizzes: string;            // JSON array
  failed_quizzes: string;            // JSON array
  total_score: number;
  quiz_scores: string;               // JSON object
  game_scores: string;               // JSON object
  lesson_completion: string;         // JSON object
  navigation_history: string;        // JSON array
  last_accessed_item: string;
  created_at: string;
  updated_at: string;
}

// API response types
export interface UserJourneyResponse {
  success: boolean;
  user_id: string;
  journey_items: NavigableItem[];
  current_item: NavigableItem;
  progress: UserProgress;
  navigation: NavigationState;
  message: string;
}

export interface NavigationResponse {
  success: boolean;
  new_item: NavigableItem;
  navigation_state: NavigationState;
  progress_updated: boolean;
  message: string;
}
