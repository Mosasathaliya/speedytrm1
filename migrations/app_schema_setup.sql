-- App Schema Setup for token-forge-app-new
-- This migration adds missing tables without conflicting with existing ones

-- AI RAG System Tables
CREATE TABLE IF NOT EXISTS knowledge_base (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT NOT NULL, -- 'lesson', 'grammar', 'vocabulary', 'culture'
    difficulty_level TEXT DEFAULT 'beginner',
    tags TEXT, -- JSON array of tags
    embedding_vector TEXT, -- JSON array of embeddings
    vector_id TEXT UNIQUE, -- Vectorize index ID
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS ai_conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    conversation_id TEXT UNIQUE NOT NULL,
    title TEXT,
    context TEXT, -- JSON string with conversation context
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ai_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id TEXT NOT NULL,
    role TEXT NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    metadata TEXT, -- JSON string with additional data
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES ai_conversations(conversation_id) ON DELETE CASCADE
);

-- Enhanced User Progress Tracking
CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    lesson_type TEXT NOT NULL, -- 'grammar', 'vocabulary', 'listening', 'speaking', 'reading', 'writing'
    progress_percentage INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    score INTEGER,
    time_spent_seconds INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    last_accessed TEXT DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, lesson_id)
);

-- Enhanced Quiz and Assessment System
CREATE TABLE IF NOT EXISTS user_quiz_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    quiz_id TEXT NOT NULL,
    quiz_type TEXT NOT NULL, -- 'grammar', 'vocabulary', 'comprehension', 'pronunciation'
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    time_taken_seconds INTEGER,
    difficulty_level TEXT,
    feedback TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User Vocabulary Management
CREATE TABLE IF NOT EXISTS user_vocabulary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    word TEXT NOT NULL,
    translation TEXT,
    translation_ar TEXT,
    part_of_speech TEXT,
    difficulty_level TEXT DEFAULT 'beginner',
    mastery_level INTEGER DEFAULT 0, -- 0-100
    review_count INTEGER DEFAULT 0,
    next_review_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, word)
);

-- User Sessions and Analytics
CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    session_data TEXT, -- JSON string with session info
    ip_address TEXT,
    user_agent TEXT,
    started_at TEXT DEFAULT CURRENT_TIMESTAMP,
    ended_at TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User Achievements and Gamification
CREATE TABLE IF NOT EXISTS user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    achievement_type TEXT NOT NULL, -- 'lesson_completed', 'streak', 'perfect_score', etc.
    achievement_data TEXT, -- JSON string with achievement details
    earned_at TEXT DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Learning Paths and Course Structure
CREATE TABLE IF NOT EXISTS learning_paths (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    difficulty_level TEXT DEFAULT 'beginner',
    estimated_hours INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS learning_path_modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    lesson_type TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (path_id) REFERENCES learning_paths(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_learning_paths (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    path_id INTEGER NOT NULL,
    current_module_id INTEGER,
    progress_percentage INTEGER DEFAULT 0,
    started_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (path_id) REFERENCES learning_paths(id) ON DELETE CASCADE,
    FOREIGN KEY (current_module_id) REFERENCES learning_path_modules(id) ON DELETE SET NULL
);

-- AI Generated Content Tracking
CREATE TABLE IF NOT EXISTS ai_generated_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    content_type TEXT NOT NULL, -- 'lesson', 'quiz', 'story', 'explanation'
    prompt TEXT,
    generated_content TEXT NOT NULL,
    metadata TEXT, -- JSON string with generation details
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User Study Sessions
CREATE TABLE IF NOT EXISTS user_study_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    session_type TEXT NOT NULL, -- 'focused', 'review', 'practice', 'assessment'
    start_time TEXT NOT NULL,
    end_time TEXT,
    duration_minutes INTEGER,
    lessons_completed INTEGER DEFAULT 0,
    score_improvement INTEGER DEFAULT 0,
    notes TEXT,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_lesson ON user_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_type ON user_progress(lesson_type);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vocabulary_user ON user_vocabulary(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vocabulary_mastery ON user_vocabulary(mastery_level);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON user_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_user_learning_paths_user ON user_learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_paths_path ON user_learning_paths(path_id);
CREATE INDEX IF NOT EXISTS idx_ai_generated_content_type ON ai_generated_content(content_type);
CREATE INDEX IF NOT EXISTS idx_ai_generated_content_user ON ai_generated_content(user_id);
CREATE INDEX IF NOT EXISTS idx_user_study_sessions_user ON user_study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_study_sessions_type ON user_study_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_type ON knowledge_base(content_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_difficulty ON knowledge_base(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation ON ai_messages(conversation_id);
