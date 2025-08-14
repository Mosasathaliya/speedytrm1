-- Speed of Mastery English Learning App Database Schema
-- This schema supports the RAG system and user progress tracking

-- Users table for authentication and basic info
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    id_number TEXT UNIQUE, -- National ID for external auth
    password TEXT, -- For migrated users
    phone_number TEXT, -- Additional phone field for migration
    term_enrolled TEXT, -- Which term user is enrolled in
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1,
    subscription_status TEXT DEFAULT 'free',
    subscription_expires DATETIME,
    term1_paid BOOLEAN DEFAULT 0,
    term1_payment_date DATETIME,
    last_login DATETIME
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    lesson_id INTEGER NOT NULL,
    completed BOOLEAN DEFAULT 0,
    score INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- in seconds
    attempts INTEGER DEFAULT 1,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, lesson_id)
);

-- Lesson metadata and content
CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id INTEGER UNIQUE NOT NULL,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    duration INTEGER DEFAULT 0, -- in minutes
    level TEXT DEFAULT 'beginner', -- beginner, intermediate, advanced
    category TEXT,
    content_type TEXT,
    tags TEXT, -- JSON array as text
    unit_id INTEGER,
    order_in_unit INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Learning units
CREATE TABLE IF NOT EXISTS units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_id INTEGER UNIQUE NOT NULL,
    title TEXT NOT NULL,
    focus TEXT,
    description TEXT,
    total_lessons INTEGER DEFAULT 0,
    estimated_duration INTEGER DEFAULT 0, -- in minutes
    difficulty_level TEXT DEFAULT 'beginner',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User learning sessions
CREATE TABLE IF NOT EXISTS learning_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    lesson_id INTEGER,
    session_start DATETIME DEFAULT CURRENT_TIMESTAMP,
    session_end DATETIME,
    duration INTEGER DEFAULT 0, -- in seconds
    activities_completed INTEGER DEFAULT 0,
    session_type TEXT DEFAULT 'lesson', -- lesson, practice, quiz, review
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id)
);

-- User achievements and badges
CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    achievement_type TEXT NOT NULL, -- lesson_completed, streak, score_milestone, etc.
    achievement_name TEXT NOT NULL,
    description TEXT,
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT, -- JSON data about the achievement
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Learning recommendations cache
CREATE TABLE IF NOT EXISTS learning_recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    lesson_id INTEGER NOT NULL,
    recommendation_reason TEXT,
    priority_score REAL DEFAULT 0.0,
    is_consumed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id)
);

-- User preferences and settings
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id TEXT PRIMARY KEY,
    preferred_language TEXT DEFAULT 'ar', -- ar, en, both
    difficulty_adjustment BOOLEAN DEFAULT 1,
    daily_goal_minutes INTEGER DEFAULT 30,
    notification_enabled BOOLEAN DEFAULT 1,
    theme_preference TEXT DEFAULT 'auto', -- light, dark, auto
    audio_enabled BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Study streaks and daily progress
CREATE TABLE IF NOT EXISTS study_streaks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_study_date DATE,
    total_study_days INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Daily study records
CREATE TABLE IF NOT EXISTS daily_study_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    study_date DATE NOT NULL,
    total_time INTEGER DEFAULT 0, -- in seconds
    lessons_completed INTEGER DEFAULT 0,
    practice_sessions INTEGER DEFAULT 0,
    quizzes_taken INTEGER DEFAULT 0,
    average_score REAL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, study_date)
);

-- RAG system metadata
CREATE TABLE IF NOT EXISTS rag_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chunk_id TEXT UNIQUE NOT NULL,
    lesson_id INTEGER NOT NULL,
    embedding_model TEXT DEFAULT 'bge-base-en-v1.5',
    chunk_size INTEGER DEFAULT 0,
    content_hash TEXT, -- for content change detection
    vector_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lessons_level ON lessons(level);
CREATE INDEX IF NOT EXISTS idx_lessons_category ON lessons(category);
CREATE INDEX IF NOT EXISTS idx_lessons_unit_id ON lessons(unit_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_id ON learning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON learning_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_study_streaks_user_id ON study_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_study_user_date ON daily_study_records(user_id, study_date);
CREATE INDEX IF NOT EXISTS idx_rag_metadata_chunk_id ON rag_metadata(chunk_id);
CREATE INDEX IF NOT EXISTS idx_rag_metadata_lesson_id ON rag_metadata(lesson_id);

-- Insert default units data
INSERT OR IGNORE INTO units (unit_id, title, focus, description, total_lessons, estimated_duration, difficulty_level) VALUES
(1, 'It''s a wonderful world!', 'Tenses, auxiliary verbs, short answers', 'Introduction to basic English grammar concepts', 10, 120, 'beginner'),
(2, 'Get happy!', 'Emotions and feelings', 'Learning to express emotions and feelings in English', 10, 120, 'beginner'),
(3, 'What time is it?', 'Time expressions and daily routines', 'Mastering time-related vocabulary and expressions', 10, 120, 'beginner'),
(4, 'Let''s go shopping!', 'Shopping vocabulary and conversations', 'Essential shopping and commerce language skills', 10, 120, 'beginner'),
(5, 'Food and dining', 'Food vocabulary and restaurant conversations', 'Learning about food, dining, and restaurant etiquette', 10, 120, 'beginner'),
(6, 'Travel and transportation', 'Travel vocabulary and transportation', 'Essential language for traveling and getting around', 10, 120, 'beginner'),
(7, 'Family and relationships', 'Family vocabulary and relationship terms', 'Learning about family members and relationships', 10, 120, 'beginner'),
(8, 'Work and careers', 'Professional vocabulary and workplace language', 'Essential language for work and career development', 10, 120, 'beginner'),
(9, 'Health and wellness', 'Health vocabulary and medical conversations', 'Language for health, wellness, and medical situations', 10, 120, 'beginner'),
(10, 'Technology and internet', 'Tech vocabulary and digital communication', 'Modern technology and internet language skills', 10, 120, 'beginner'),
(11, 'Entertainment and media', 'Entertainment vocabulary and media language', 'Language for movies, music, books, and entertainment', 10, 120, 'beginner'),
(12, 'Advanced communication', 'Advanced grammar and communication skills', 'Advanced English communication and expression', 10, 120, 'intermediate');

-- Insert default lessons data (first few as examples)
INSERT OR IGNORE INTO lessons (lesson_id, title_ar, title_en, description_ar, description_en, duration, level, category, content_type, tags, unit_id, order_in_unit) VALUES
(1, 'الفصل الأول: مقدمة في اللغة الإنجليزية', 'Chapter 1: Introduction to English Language', 'مقدمة أساسية في اللغة الإنجليزية للمبتدئين', 'Basic introduction to English language for beginners', 10, 'beginner', 'introduction', 'grammar', '["introduction", "basics", "beginner", "grammar"]', 1, 1),
(2, 'الفصل الثاني: الأبجدية الإنجليزية', 'Chapter 2: English Alphabet', 'تعلم الحروف الأبجدية الإنجليزية والنطق', 'Learn English alphabet letters and pronunciation', 30, 'beginner', 'alphabet', 'vocabulary', '["alphabet", "pronunciation", "beginner", "vocabulary"]', 1, 2),
(3, 'الفصل الثالث: الأرقام الإنجليزية', 'Chapter 3: English Numbers', 'تعلم الأرقام من 1 إلى 100', 'Learn numbers from 1 to 100', 20, 'beginner', 'numbers', 'vocabulary', '["numbers", "counting", "beginner", "vocabulary"]', 1, 3),
(4, 'الفصل الرابع: الألوان الأساسية', 'Chapter 4: Basic Colors', 'تعلم الألوان الأساسية في اللغة الإنجليزية', 'Learn basic colors in English', 15, 'beginner', 'colors', 'vocabulary', '["colors", "visual", "beginner", "vocabulary"]', 1, 4),
(5, 'الفصل الخامس: التحيات والكلمات الأساسية', 'Chapter 5: Greetings and Basic Words', 'تعلم التحيات والكلمات الأساسية', 'Learn greetings and basic words', 25, 'beginner', 'greetings', 'conversation', '["greetings", "conversation", "beginner", "basic"]', 1, 5);

-- Create a view for user progress summary
CREATE VIEW IF NOT EXISTS user_progress_summary AS
SELECT 
    up.user_id,
    u.full_name,
    COUNT(up.lesson_id) as total_lessons_started,
    SUM(CASE WHEN up.completed = 1 THEN 1 ELSE 0 END) as completed_lessons,
    AVG(up.score) as average_score,
    SUM(up.time_spent) as total_time_spent,
    MAX(up.completed_at) as last_completion_date
FROM user_progress up
JOIN users u ON up.user_id = u.id
GROUP BY up.user_id, u.full_name;

-- Create a view for lesson statistics
CREATE VIEW IF NOT EXISTS lesson_statistics AS
SELECT 
    l.lesson_id,
    l.title_en,
    l.level,
    l.category,
    COUNT(up.user_id) as total_attempts,
    AVG(up.score) as average_score,
    SUM(CASE WHEN up.completed = 1 THEN 1 ELSE 0 END) as total_completions
FROM lessons l
LEFT JOIN user_progress up ON l.lesson_id = up.lesson_id
GROUP BY l.lesson_id, l.title_en, l.level, l.category;

-- User-specific generated content (games, stories, lessons, quizzes)
CREATE TABLE IF NOT EXISTS user_generated_content (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  content_type TEXT NOT NULL,
  content_data TEXT NOT NULL,
  generated_at TEXT NOT NULL,
  accessed_count INTEGER DEFAULT 0,
  last_accessed TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  completion_data TEXT,
  locked BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, item_id)
);

-- Enhanced user progress with navigation
CREATE TABLE IF NOT EXISTS user_journey_progress (
  user_id TEXT PRIMARY KEY,
  current_item_index INTEGER DEFAULT 0,
  completed_items TEXT DEFAULT '[]',
  passed_quizzes TEXT DEFAULT '[]',
  failed_quizzes TEXT DEFAULT '[]',
  total_score INTEGER DEFAULT 0,
  quiz_scores TEXT DEFAULT '{}',
  game_scores TEXT DEFAULT '{}',
  lesson_completion TEXT DEFAULT '{}',
  navigation_history TEXT DEFAULT '[]',
  last_accessed_item TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- User navigation sessions (for better UX)
CREATE TABLE IF NOT EXISTS user_navigation_sessions (
  session_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  current_item_index INTEGER NOT NULL,
  journey_items TEXT NOT NULL,
  session_data TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

-- Content access rules and locks
CREATE TABLE IF NOT EXISTS content_access_control (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  access_type TEXT NOT NULL,
  lock_condition TEXT,
  lock_data TEXT,
  locked_at TEXT,
  unlock_conditions TEXT,
  created_at TEXT NOT NULL
);

-- User card interactions tracking
CREATE TABLE IF NOT EXISTS user_card_interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    user_id TEXT,
    card_type TEXT NOT NULL, -- 'basic-english', 'gaming', 'motivational', etc.
    card_id TEXT NOT NULL,
    card_title TEXT,
    action TEXT NOT NULL, -- 'open', 'close', 'navigate-next', 'navigate-previous', 'view'
    timestamp TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Additional indexes for user content system
CREATE INDEX IF NOT EXISTS idx_user_content_user_id ON user_generated_content(user_id);
CREATE INDEX IF NOT EXISTS idx_user_content_item_id ON user_generated_content(item_id);
CREATE INDEX IF NOT EXISTS idx_user_content_type ON user_generated_content(content_type);
CREATE INDEX IF NOT EXISTS idx_user_journey_user_id ON user_journey_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_navigation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_access_control_user_item ON content_access_control(user_id, item_id);

-- Index for card interactions
CREATE INDEX IF NOT EXISTS idx_card_interactions_session ON user_card_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_card_interactions_user ON user_card_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_card_interactions_type ON user_card_interactions(card_type);

-- Mood translator AI time tracking
CREATE TABLE IF NOT EXISTS mood_translator_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    session_id TEXT NOT NULL,
    mood TEXT NOT NULL, -- 'happy', 'angry', 'sad', 'excited', 'motivated'
    time_spent INTEGER DEFAULT 0, -- in seconds
    message_count INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT 0, -- true when 20 minutes reached
    last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Mood translator conversation history
CREATE TABLE IF NOT EXISTS mood_translator_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    user_id TEXT,
    mood TEXT NOT NULL,
    message_type TEXT NOT NULL, -- 'user', 'ai', 'warning', 'completion'
    content TEXT NOT NULL,
    language TEXT DEFAULT 'en', -- 'en' or 'ar'
    emoji TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for mood translator tables
CREATE INDEX IF NOT EXISTS idx_mood_sessions_user ON mood_translator_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_sessions_mood ON mood_translator_sessions(mood);
CREATE INDEX IF NOT EXISTS idx_mood_messages_session ON mood_translator_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_mood_messages_mood ON mood_translator_messages(mood);

-- Voice translator AI progress tracking
CREATE TABLE IF NOT EXISTS voice_translator_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    session_id TEXT NOT NULL,
    completed_translations INTEGER DEFAULT 0,
    target_translations INTEGER DEFAULT 30,
    session_start DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_translation DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Voice translator translation history
CREATE TABLE IF NOT EXISTS voice_translator_translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    user_id TEXT,
    arabic_text TEXT NOT NULL,
    english_text TEXT NOT NULL,
    audio_url TEXT,
    processing_time INTEGER, -- milliseconds
    success BOOLEAN DEFAULT 1,
    error_message TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for voice translator tables
CREATE INDEX IF NOT EXISTS idx_voice_sessions_user ON voice_translator_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_session ON voice_translator_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_translations_session ON voice_translator_translations(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_translations_user ON voice_translator_translations(user_id);

-- User analytics tracking tables
CREATE TABLE IF NOT EXISTS user_page_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    user_id TEXT,
    page TEXT NOT NULL,
    timestamp TEXT,
    user_agent TEXT,
    url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS user_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    user_id TEXT,
    event_name TEXT NOT NULL,
    event_data TEXT, -- JSON string
    timestamp TEXT,
    user_agent TEXT,
    url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for analytics tables
CREATE INDEX IF NOT EXISTS idx_page_views_session ON user_page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_user ON user_page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_page ON user_page_views(page);
CREATE INDEX IF NOT EXISTS idx_events_session ON user_events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_user ON user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_name ON user_events(event_name);

-- Certificate management tables
CREATE TABLE IF NOT EXISTS user_certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    credential_id TEXT UNIQUE NOT NULL,
    user_name TEXT NOT NULL,
    course_name TEXT NOT NULL,
    completion_date TEXT NOT NULL,
    achievements TEXT, -- JSON string with user achievements
    is_generated BOOLEAN DEFAULT 0,
    is_saved BOOLEAN DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    generated_at TEXT,
    saved_at TEXT,
    last_downloaded TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User learning progress tracking
CREATE TABLE IF NOT EXISTS user_learning_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT UNIQUE NOT NULL,
    progress_data TEXT NOT NULL, -- JSON string with detailed progress
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for certificate and progress tables
CREATE INDEX IF NOT EXISTS idx_certificates_user ON user_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_credential ON user_certificates(credential_id);
CREATE INDEX IF NOT EXISTS idx_certificates_saved ON user_certificates(is_saved);
CREATE INDEX IF NOT EXISTS idx_progress_user ON user_learning_progress(user_id);
