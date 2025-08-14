-- Complete Backend Schema for Studio App
-- This migration creates all necessary tables for the complete backend system

-- Enhanced users table with all necessary fields
ALTER TABLE users ADD COLUMN email TEXT;
ALTER TABLE users ADD COLUMN phone TEXT;
ALTER TABLE users ADD COLUMN country TEXT;
ALTER TABLE users ADD COLUMN city TEXT;
ALTER TABLE users ADD COLUMN timezone TEXT;
ALTER TABLE users ADD COLUMN language_preference TEXT DEFAULT 'en';
ALTER TABLE users ADD COLUMN date_of_birth TEXT;
ALTER TABLE users ADD COLUMN gender TEXT;
ALTER TABLE users ADD COLUMN education_level TEXT;
ALTER TABLE users ADD COLUMN occupation TEXT;
ALTER TABLE users ADD COLUMN company TEXT;
ALTER TABLE users ADD COLUMN profile_picture_url TEXT;
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN term1_payment_date TEXT;
ALTER TABLE users ADD COLUMN term1_payment_amount DECIMAL(10,2);
ALTER TABLE users ADD COLUMN term1_payment_method TEXT;
ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN subscription_expires_at TEXT;
ALTER TABLE users ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN last_login_at TEXT;
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN preferences TEXT; -- JSON string
ALTER TABLE users ADD COLUMN metadata TEXT; -- JSON string

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
    completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Enhanced Vocabulary System
CREATE TABLE IF NOT EXISTS user_vocabulary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    word TEXT NOT NULL,
    translation TEXT NOT NULL,
    difficulty_level TEXT DEFAULT 'beginner',
    mastery_level INTEGER DEFAULT 0, -- 0-5 scale
    review_count INTEGER DEFAULT 0,
    last_reviewed TEXT,
    next_review TEXT,
    context_sentences TEXT, -- JSON array
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, word)
);

-- Enhanced Session Management
CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    device_info TEXT, -- JSON string
    ip_address TEXT,
    user_agent TEXT,
    login_at TEXT DEFAULT CURRENT_TIMESTAMP,
    last_activity TEXT DEFAULT CURRENT_TIMESTAMP,
    expires_at TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Enhanced Achievement System
CREATE TABLE IF NOT EXISTS user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    achievement_type TEXT NOT NULL, -- 'lesson_completed', 'streak', 'score_milestone', 'vocabulary_mastery'
    achievement_name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    points INTEGER DEFAULT 0,
    earned_at TEXT DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT, -- JSON string
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Enhanced Payment System
CREATE TABLE IF NOT EXISTS user_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    payment_type TEXT NOT NULL, -- 'term1', 'subscription', 'premium', 'course'
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_method TEXT,
    transaction_id TEXT UNIQUE,
    status TEXT NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
    payment_date TEXT DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT, -- JSON string
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Enhanced Support System
CREATE TABLE IF NOT EXISTS user_support_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    ticket_number TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    assigned_to TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    resolved_at TEXT,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Enhanced Notification System
CREATE TABLE IF NOT EXISTS user_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL, -- 'system', 'achievement', 'reminder', 'payment', 'lesson'
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    read_at TEXT,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Enhanced Password Reset System
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Learning Path and Course Structure
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
    is_required BOOLEAN DEFAULT TRUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    
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
    FOREIGN KEY (current_module_id) REFERENCES learning_path_modules(id),
    UNIQUE(user_id, path_id)
);

-- AI-Generated Content Storage
CREATE TABLE IF NOT EXISTS ai_generated_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_type TEXT NOT NULL, -- 'story', 'quiz', 'exercise', 'explanation'
    user_id TEXT,
    prompt TEXT NOT NULL,
    generated_content TEXT NOT NULL,
    metadata TEXT, -- JSON string with content structure
    model_used TEXT,
    tokens_used INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- User Study Sessions
CREATE TABLE IF NOT EXISTS user_study_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    session_type TEXT NOT NULL, -- 'lesson', 'practice', 'review', 'quiz'
    start_time TEXT DEFAULT CURRENT_TIMESTAMP,
    end_time TEXT,
    duration_seconds INTEGER,
    activities_completed INTEGER DEFAULT 0,
    session_data TEXT, -- JSON string with session details
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create comprehensive indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_lesson ON user_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_type ON user_progress(lesson_type);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_payments_user ON user_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_payments_status ON user_payments(status);
CREATE INDEX IF NOT EXISTS idx_user_payments_transaction ON user_payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_type ON knowledge_base(content_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_difficulty ON knowledge_base(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation ON ai_messages(conversation_id);
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

-- Insert default learning paths
INSERT OR IGNORE INTO learning_paths (id, title, description, difficulty_level, estimated_hours) VALUES
(1, 'Complete Beginner', 'Start from scratch with basic Arabic to English learning', 'beginner', 40),
(2, 'Intermediate Learner', 'Build on basics with more complex grammar and vocabulary', 'intermediate', 60),
(3, 'Advanced Speaker', 'Master advanced concepts and achieve fluency', 'advanced', 80);

-- Insert default admin user (password: admin123)
INSERT OR IGNORE INTO users (id, password, full_name, email, term1_paid, is_active, email_verified) 
VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'admin@example.com', TRUE, TRUE, TRUE);
