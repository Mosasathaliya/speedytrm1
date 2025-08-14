CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    quiz_type TEXT NOT NULL,
    question_index INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_taken_seconds INTEGER,
    timestamp INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS pronunciation_assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    lesson_id TEXT,
    target_phrase TEXT NOT NULL,
    transcription TEXT NOT NULL,
    score INTEGER NOT NULL,
    timestamp INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS story_interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    story_part INTEGER NOT NULL,
    user_choice TEXT,
    vocabulary_learned TEXT, -- Stored as JSON string
    grammar_concepts_encountered TEXT, -- Stored as JSON string
    timestamp INTEGER NOT NULL
);

CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts (user_id);
CREATE INDEX idx_pron_assess_user_id ON pronunciation_assessments (user_id);
CREATE INDEX idx_story_inter_user_id ON story_interactions (user_id);
