/**
 * Speed of Mastery RAG Worker
 * Handles lesson retrieval, AI interactions, and user progress tracking
 */

export interface Env {
  DB: D1Database;
  LESSON_BUCKET: R2Bucket;
  VECTORIZE_INDEX: VectorizeIndex;
  AI: any;
  ENVIRONMENT: string;
  RAG_SYSTEM_VERSION: string;
  MAX_CHUNK_SIZE: string;
  EMBEDDING_MODEL: string;
}

export interface LessonChunk {
  chunk_id: string;
  lesson_id: number;
  title: string;
  content: string;
  tags: string[];
  language: string;
  target_language: string;
  chunk_size: number;
  content_type: string;
}

export interface RAGResponse {
  query: string;
  results: LessonChunk[];
  total_results: number;
  search_time: number;
  suggestions: string[];
  related_topics: string[];
}

export interface UserProgress {
  user_id: string;
  lesson_id: number;
  completed: boolean;
  score: number;
  time_spent: number;
  completed_at: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // CORS headers
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      };

      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      // Route handling
      switch (path) {
        case '/api/health':
          return this.handleHealth(request, env, corsHeaders);

        case '/api/lessons/search':
          return this.handleLessonSearch(request, env, corsHeaders);

        case '/api/lessons/recommendations':
          return this.handleRecommendations(request, env, corsHeaders);

        case '/api/lessons/help':
          return this.handleLessonHelp(request, env, corsHeaders);

        case '/api/practice/conversation':
          return this.handleConversationPractice(request, env, corsHeaders);

        case '/api/grammar/explanation':
          return this.handleGrammarExplanation(request, env, corsHeaders);

        case '/api/vocabulary/exercises':
          return this.handleVocabularyExercises(request, env, corsHeaders);

        case '/api/pronunciation/help':
          return this.handlePronunciationHelp(request, env, corsHeaders);

        case '/api/analytics/track-card-interaction':
          return this.handleCardInteractionTracking(request, env, corsHeaders);

        case '/api/analytics/track-page-view':
          return this.handlePageViewTracking(request, env, corsHeaders);

        case '/api/analytics/track-event':
          return this.handleEventTracking(request, env, corsHeaders);

        case '/api/cloudflare/tts':
          return this.handleCloudflareTextToSpeech(request, env, corsHeaders);

        case '/api/cloudflare/stt':
          return this.handleCloudflareSpeechToText(request, env, corsHeaders);

        case '/api/cloudflare/stt-arabic':
          return this.handleCloudflareArabicSTT(request, env, corsHeaders);

        case '/api/cloudflare/translate':
          return this.handleCloudflareTranslate(request, env, corsHeaders);

        case '/api/certificate/generate':
          return this.handleCertificateGeneration(request, env, corsHeaders);

        case '/api/certificate/save':
          return this.handleCertificateSave(request, env, corsHeaders);

        case '/api/certificate/download':
          return this.handleCertificateDownload(request, env, corsHeaders);

        case '/api/user/progress':
          return this.handleUserProgress(request, env, corsHeaders);

        // External auth removed; use internal login/register only

        // New internal authentication endpoints (no external DB)
        case '/api/auth/login':
          return this.handleInternalLogin(request, env, corsHeaders);

        case '/api/auth/register':
          return this.handleInternalRegister(request, env, corsHeaders);

        case '/api/progress/update':
          return this.handleProgressUpdate(request, env, corsHeaders);

        case '/api/progress/stats':
          return this.handleProgressStats(request, env, corsHeaders);

        case '/api/upload/lessons':
          return this.handleLessonUpload(request, env, corsHeaders);

        case '/api/ai/generate-lesson':
          return this.handleAILessonGeneration(request, env, corsHeaders);

        case '/api/ai/translate-word':
          return this.handleWordTranslation(request, env, corsHeaders);

        case '/api/ai/pronounce-word':
          return this.handleWordPronunciation(request, env, corsHeaders);

        case '/api/ai/generate-game':
          return this.handleGameGeneration(request, env, corsHeaders);

        case '/api/ai/generate-vocabulary-game':
          return this.handleVocabularyGameGeneration(request, env, corsHeaders);

        case '/api/ai/generate-grammar-game':
          return this.handleGrammarGameGeneration(request, env, corsHeaders);

        case '/api/ai/generate-story-game':
          return this.handleStoryGameGeneration(request, env, corsHeaders);

        case '/api/ai/generate-pronunciation-game':
          return this.handlePronunciationGameGeneration(request, env, corsHeaders);

        case '/api/ai/tutor-chat':
          return this.handleTutorChat(request, env, corsHeaders);

        case '/api/ai/save-lesson-to-rag':
          return this.handleSaveLessonToRAG(request, env, corsHeaders);

        case '/api/ai/enhance-lesson':
          return this.handleEnhanceLesson(request, env, corsHeaders);

        case '/api/ai/get-cached-lesson':
          return this.handleGetCachedLesson(request, env, corsHeaders);

        case '/api/assessment/generate-quiz':
          return this.handleGenerateQuiz(request, env, corsHeaders);

        case '/api/assessment/submit-quiz':
          return this.handleSubmitQuiz(request, env, corsHeaders);

        case '/api/ai/analyze-pronunciation':
          return this.handleAnalyzePronunciation(request, env, corsHeaders);

        case '/api/user-content/generate':
          return this.handleGenerateUserContent(request, env, corsHeaders);

        case '/api/user-content/get':
          return this.handleGetUserContent(request, env, corsHeaders);

        case '/api/user-journey/navigate':
          return this.handleUserNavigation(request, env, corsHeaders);

        case '/api/user-journey/progress':
          return this.handleUpdateUserProgress(request, env, corsHeaders);

        case '/':
        case '/app':
        case '/frontend':
          return this.handleFrontendApp(request, env, corsHeaders);

        default:
          return new Response(JSON.stringify({ 
            error: 'Not Found',
            message: 'Endpoint not found',
            available_endpoints: [
              '/api/health',
              '/api/lessons/search',
              '/api/lessons/recommendations',
              '/api/lessons/help',
              '/api/practice/conversation',
              '/api/grammar/explanation',
              '/api/vocabulary/exercises',
              '/api/pronunciation/help',
              '/api/progress/update',
              '/api/progress/stats',
              '/api/upload/lessons',
              '/api/ai/generate-lesson',
              '/api/ai/translate-word',
              '/api/ai/pronounce-word',
              '/api/ai/generate-game',
              '/api/ai/generate-vocabulary-game',
              '/api/ai/generate-grammar-game',
              '/api/ai/generate-story-game',
              '/api/ai/generate-pronunciation-game',
              '/api/ai/tutor-chat',
              '/api/ai/save-lesson-to-rag',
              '/api/ai/enhance-lesson',
              '/api/ai/get-cached-lesson',
              '/api/assessment/generate-quiz',
              '/api/assessment/submit-quiz',
              '/api/ai/analyze-pronunciation',
              '/api/user-content/generate',
              '/api/user-content/get',
              '/api/user-journey/navigate',
              '/api/user-journey/progress',
              // external verify removed
              '/api/auth/login',
              '/api/auth/register',
              '/api/user/progress',
              '/api/cloudflare/tts',
              '/api/cloudflare/stt',
              '/api/cloudflare/arabic-stt',
              '/api/cloudflare/translate',
              '/api/analytics/card-interaction',
              '/api/analytics/page-view',
              '/api/analytics/event',
              '/api/certificates/generate',
              '/api/certificates/save',
              '/api/certificates/download',
              '/api/ai/personal-assistant',
              '/api/ai/mood-translator',
              '/api/ai/voice-translator'
            ]
          }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
      }
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },

  // ===== Security helpers (password hashing) =====
  async generateSalt(length = 16): Promise<string> {
    const saltBytes = new Uint8Array(length);
    crypto.getRandomValues(saltBytes);
    return btoa(String.fromCharCode(...saltBytes));
  },

  async derivePasswordHash(password: string, saltB64: string, iterations = 100000): Promise<string> {
    const enc = new TextEncoder();
    const saltBytes = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        hash: 'SHA-256',
        salt: saltBytes,
        iterations
      },
      keyMaterial,
      256
    );
    const hashArray = Array.from(new Uint8Array(derivedBits));
    const hashB64 = btoa(String.fromCharCode(...hashArray));
    return `${saltB64}:${hashB64}`;
  },

  async verifyPassword(inputPassword: string, stored: string): Promise<boolean> {
    if (!stored || typeof stored !== 'string') return false;
    // Legacy plain-text support
    if (!stored.includes(':')) {
      return inputPassword === stored;
    }
    const [saltB64, storedHashB64] = stored.split(':');
    const computed = await this.derivePasswordHash(inputPassword, saltB64);
    const compHash = computed.split(':')[1];
    // Constant-time compare
    if (compHash.length !== storedHashB64.length) return false;
    let diff = 0;
    for (let i = 0; i < compHash.length; i++) diff |= compHash.charCodeAt(i) ^ storedHashB64.charCodeAt(i);
    return diff === 0;
  },

  // Health check endpoint
  async handleHealth(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    const health = {
      status: 'healthy',
      service: 'Speed of Mastery RAG Worker',
      version: env.RAG_SYSTEM_VERSION,
      environment: env.ENVIRONMENT,
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        storage: 'connected',
        vectorize: 'connected',
        ai: 'connected'
      }
    };

    return new Response(JSON.stringify(health), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  },

  // Handle frontend app serving: redirect to Cloudflare Pages (no login)
  async handleFrontendApp(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    const pagesUrl = 'https://speed-of-mastery-app.pages.dev/';
    return new Response(null, { status: 302, headers: { ...corsHeaders, Location: pagesUrl } });
  },

  /**
   * Internal Login (no external DB)
   */
  async handleInternalLogin(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    try {
      const { idNumber, id_number, password } = await request.json();
      const actualIdNumber = idNumber || id_number;

      if (!actualIdNumber || !password) {
        return new Response(JSON.stringify({ success: false, message: 'ID number and password are required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Fetch user by id_number only, then verify password (supports hashed and legacy plain)
      const user: any = await env.DB.prepare(
        `SELECT id, full_name, id_number, phone_number, password FROM users WHERE id_number = ? LIMIT 1`
      ).bind(actualIdNumber).first();

      if (!user || !(await this.verifyPassword(password, user.password))) {
        return new Response(JSON.stringify({ success: false, message: 'Invalid ID or password' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Update last_login
      try {
        await env.DB.prepare(`UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`).bind(user.id).run();
      } catch {}

      return new Response(JSON.stringify({
        success: true,
        user: {
          id: user.id,
          fullName: user.full_name,
          idNumber: user.id_number,
          phoneNumber: user.phone_number
        }
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, message: 'Login failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  },

  /**
   * Internal Registration (no external DB)
   */
  async handleInternalRegister(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    try {
      const { fullName, full_name, idNumber, id_number, password, phoneNumber, phone_number } = await request.json();
      const actualFullName = fullName || full_name;
      const actualIdNumber = idNumber || id_number;
      const actualPhone = phoneNumber || phone_number || null;

      if (!actualFullName || !actualIdNumber || !password) {
        return new Response(JSON.stringify({ success: false, message: 'Full name, ID number and password are required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Check if user exists
      const existing = await env.DB.prepare(`SELECT id FROM users WHERE id_number = ? LIMIT 1`).bind(actualIdNumber).first();
      if (existing) {
        return new Response(JSON.stringify({ success: false, message: 'User already exists' }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const newId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const salt = await this.generateSalt();
      const saltedHash = await this.derivePasswordHash(password, salt);
      await env.DB.prepare(
        `INSERT INTO users (id, full_name, id_number, password, phone_number, term_enrolled, created_at) VALUES (?, ?, ?, ?, ?, 'Term 1', CURRENT_TIMESTAMP)`
      ).bind(newId, actualFullName, actualIdNumber, saltedHash, actualPhone).run();

      // Initialize journey progress minimal
      try {
        await env.DB.prepare(
          `INSERT OR IGNORE INTO user_journey_progress (user_id, current_item_index, completed_items, passed_quizzes, failed_quizzes, total_score, quiz_scores, game_scores, lesson_completion, navigation_history, created_at, updated_at) VALUES (?, 0, '[]', '[]', '[]', 0, '{}', '{}', '{}', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
        ).bind(newId).run();
      } catch {}

      return new Response(JSON.stringify({
        success: true,
        user: {
          id: newId,
          fullName: actualFullName,
          idNumber: actualIdNumber,
          phoneNumber: actualPhone
        },
        message: 'Registration successful'
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, message: 'Registration failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  },

  // Lesson search using vector similarity
  async handleLessonSearch(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const { query, language = 'ar', limit = 10 } = await request.json();
      
      if (!query) {
        return new Response(JSON.stringify({ error: 'Query is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Generate embedding for the query
      const embedding = await this.generateEmbedding(query, env);
      
      // Search vector database (support different SDK signatures) with full guard
      const vectorizeAny: any = env.VECTORIZE_INDEX as any;
      let results: any = { matches: [] };
      try {
        if (vectorizeAny?.query && typeof vectorizeAny.query === 'function') {
          try {
            results = await vectorizeAny.query(embedding, {
              topK: limit,
              returnMetadata: true,
              returnVectors: false
            });
          } catch {
            // Some SDKs expect an object input
            results = await vectorizeAny.query({
              vector: embedding,
              topK: limit,
              returnMetadata: true,
              returnVectors: false
            });
          }
        } else if (vectorizeAny?.search && typeof vectorizeAny.search === 'function') {
          results = await vectorizeAny.search({
            vector: embedding,
            topK: limit,
            returnMetadata: true,
            returnVectors: false
          });
        }
      } catch {
        results = { matches: [] };
      }

      // Process results
      const safeResults = results && Array.isArray(results.matches) ? results : { matches: [] };
      const lessonChunks = await this.processSearchResults(safeResults, env);
      // If vector index is empty or unavailable, return graceful fallback
      if (!lessonChunks.length) {
        return new Response(JSON.stringify({
          query,
          results: [],
          total_results: 0,
          search_time: Date.now(),
          suggestions: [
            'Learn about alphabet',
            'Learn about numbers',
            'Learn about colors'
          ],
          related_topics: []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      const response: RAGResponse = {
        query,
        results: lessonChunks,
        total_results: lessonChunks.length,
        search_time: Date.now(),
        suggestions: this.generateSuggestions(query, lessonChunks),
        related_topics: this.extractRelatedTopics(lessonChunks)
      };

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Search error:', error);
      return new Response(JSON.stringify({ error: 'Search failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },

  // Get learning recommendations based on user level and progress
  async handleRecommendations(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const { user_level, completed_lessons, interests } = await request.json();
      
      // Get user progress from database
      const userProgress = await this.getUserProgress(env.DB, completed_lessons);
      
      // Generate recommendations based on progress and interests
      const recommendations = await this.generateRecommendations(
        user_level, 
        userProgress, 
        interests, 
        env
      );

      return new Response(JSON.stringify({ recommendations }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Recommendations error:', error);
      return new Response(JSON.stringify({ error: 'Failed to get recommendations' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },

  // Get contextual help for a specific lesson
  async handleLessonHelp(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const { lesson_id, user_question, context } = await request.json();
      
      // Get lesson content
      const lessonContent = await this.getLessonContent(lesson_id, env);
      
      // Generate contextual help using AI
      const helpResponse = await this.generateContextualHelp(
        user_question, 
        context, 
        lessonContent, 
        env
      );

      return new Response(JSON.stringify({ help: helpResponse }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Help error:', error);
      return new Response(JSON.stringify({ error: 'Failed to get help' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },

  // Practice conversation with AI
  async handleConversationPractice(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const { topic, user_level, language = 'ar' } = await request.json();
      
      // Generate conversation practice using AI
      const conversation = await this.generateConversationPractice(
        topic, 
        user_level, 
        language, 
        env
      );

      return new Response(JSON.stringify(conversation), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Conversation error:', error);
      return new Response(JSON.stringify({ error: 'Failed to generate conversation' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },

  // Grammar explanation with examples
  async handleGrammarExplanation(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const { grammar_topic, examples, user_level } = await request.json();
      
      // Generate grammar explanation using AI
      const explanation = await this.generateGrammarExplanation(
        grammar_topic, 
        examples, 
        user_level, 
        env
      );

      return new Response(JSON.stringify(explanation), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Grammar error:', error);
      return new Response(JSON.stringify({ error: 'Failed to generate grammar explanation' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },

  // Vocabulary exercises
  async handleVocabularyExercises(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const { topic, difficulty, exercise_type } = await request.json();
      
      // Generate vocabulary exercises using AI
      const exercises = await this.generateVocabularyExercises(
        topic, 
        difficulty, 
        exercise_type, 
        env
      );

      return new Response(JSON.stringify(exercises), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Vocabulary error:', error);
      return new Response(JSON.stringify({ error: 'Failed to generate exercises' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },

  // Pronunciation help
  async handlePronunciationHelp(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const { word, phonetic, audio_url } = await request.json();
      
      // Generate pronunciation help using AI
      const pronunciationHelp = await this.generatePronunciationHelp(
        word, 
        phonetic, 
        audio_url, 
        env
      );

      return new Response(JSON.stringify(pronunciationHelp), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Pronunciation error:', error);
      return new Response(JSON.stringify({ error: 'Failed to generate pronunciation help' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },

  // Update user progress
  async handleProgressUpdate(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const { user_id, lesson_id, completed, score, time_spent } = await request.json();

      if (!user_id || typeof lesson_id === 'undefined') {
        return new Response(JSON.stringify({ error: 'user_id and lesson_id are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Ensure users and progress tables exist and user is present to satisfy FK
      await this.ensureUsersTable(env.DB);
      await this.ensureUserExists(env.DB, user_id);
      
      // Update progress in database
      await this.updateUserProgress(env.DB, {
        user_id,
        lesson_id,
        completed,
        score,
        time_spent,
        completed_at: new Date().toISOString()
      });

      return new Response(JSON.stringify({ success: true, message: 'Progress updated' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Progress update error:', error);
      return new Response(JSON.stringify({ error: 'Failed to update progress', detail: (error instanceof Error ? error.message : String(error)) }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },

  // Get user progress statistics
  async handleProgressStats(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    if (request.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const { searchParams } = new URL(request.url);
      const user_id = searchParams.get('user_id');
      
      if (!user_id) {
        return new Response(JSON.stringify({ error: 'User ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get progress statistics from database
      const stats = await this.getUserProgressStats(env.DB, user_id);

      return new Response(JSON.stringify(stats), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Stats error:', error);
      return new Response(JSON.stringify({ error: 'Failed to get progress stats' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },

  // Upload lessons to RAG system
  async handleLessonUpload(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const { lessons } = await request.json();
      
      if (!lessons || !Array.isArray(lessons)) {
        return new Response(JSON.stringify({ error: 'Lessons array is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Upload lessons to RAG system
      const uploadResults = await this.uploadLessonsToRAG(lessons, env);

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Lessons uploaded successfully',
        results: uploadResults
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Upload error:', error);
      return new Response(JSON.stringify({ error: 'Failed to upload lessons' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },

  // Helper methods
  async generateEmbedding(text: string, env: Env): Promise<number[]> {
    // Use Cloudflare AI for embedding generation with robust fallback
    const buildDeterministicEmbedding = (seedText: string, dimension: number): number[] => {
      const result: number[] = new Array(dimension);
      let seed = Array.from(seedText).reduce((acc, ch) => acc + ch.charCodeAt(0), 0) || 1;
      for (let i = 0; i < dimension; i++) {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        result[i] = ((seed / 4294967296) - 0.5) * 2;
      }
      return result;
    };

    try {
      const aiResponse: any = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
        text: [text]
      });

      const embedding =
        aiResponse?.data?.[0]?.embedding ??
        aiResponse?.data?.[0] ??
        aiResponse?.embedding ??
        aiResponse?.[0]?.embedding;

      if (Array.isArray(embedding)) {
        return embedding as number[];
      }

      // Fallback to deterministic 768-dimension embedding if AI response shape is unexpected
      return buildDeterministicEmbedding(text, 768);
    } catch {
      // Fallback to deterministic 768-dimension embedding if AI call fails
      return buildDeterministicEmbedding(text, 768);
    }
  },

  async processSearchResults(results: any, env: Env): Promise<LessonChunk[]> {
    // Process vector search results and convert to lesson chunks
    const chunks: LessonChunk[] = [];
    
    for (const result of results.matches) {
      if (result.metadata) {
        chunks.push({
          chunk_id: result.metadata.chunk_id || result.id,
          lesson_id: result.metadata.lesson_id || 0,
          title: result.metadata.title || 'Unknown',
          content: result.metadata.content || '',
          tags: result.metadata.tags || [],
          language: result.metadata.language || 'en',
          target_language: result.metadata.target_language || 'ar',
          chunk_size: result.metadata.chunk_size || 0,
          content_type: result.metadata.content_type || 'lesson'
        });
      }
    }
    
    return chunks;
  },

  generateSuggestions(query: string, results: LessonChunk[]): string[] {
    // Generate search suggestions based on results
    const suggestions: string[] = [];
    const tags = new Set<string>();
    
    results.forEach(chunk => {
      chunk.tags.forEach(tag => tags.add(tag));
    });
    
    // Convert tags to suggestions
    Array.from(tags).slice(0, 5).forEach(tag => {
      suggestions.push(`Learn about ${tag}`);
    });
    
    return suggestions;
  },

  extractRelatedTopics(results: LessonChunk[]): string[] {
    // Extract related topics from search results
    const topics = new Set<string>();
    
    results.forEach(chunk => {
      if (chunk.content_type) {
        topics.add(chunk.content_type);
      }
    });
    
    return Array.from(topics);
  },

  async getUserProgress(db: D1Database, completedLessons: number[]): Promise<UserProgress[]> {
    // Get user progress from database
    const stmt = db.prepare(`
      SELECT * FROM user_progress 
      WHERE lesson_id IN (${completedLessons.map(() => '?').join(',')})
    `);
    
    const result = await stmt.bind(...completedLessons).all();
    return result.results as UserProgress[];
  },

  async generateRecommendations(
    userLevel: string, 
    userProgress: UserProgress[], 
    interests: string[], 
    env: Env
  ): Promise<any[]> {
    // Generate personalized learning recommendations
    const recommendations = [];
    
    // Analyze user progress and interests
    const completedLessons = userProgress.map(p => p.lesson_id);
    const userStrengths = this.analyzeUserStrengths(userProgress);
    
    // Generate recommendations using AI
    const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [{
        role: 'user',
        content: `Generate 5 learning recommendations for a ${userLevel} English learner with interests in ${interests.join(', ')}. Focus on areas they haven't covered yet.`
      }]
    });
    
    return recommendations;
  },

  async getLessonContent(lessonId: number, env: Env): Promise<any> {
    // Get lesson content from storage
    const lessonKey = `lesson_${lessonId}.json`;
    const lessonObject = await env.LESSON_BUCKET.get(lessonKey);
    
    if (!lessonObject) {
      throw new Error(`Lesson ${lessonId} not found`);
    }
    
    return await lessonObject.json();
  },

  async generateContextualHelp(
    question: string, 
    context: string, 
    lessonContent: any, 
    env: Env
  ): Promise<string> {
    // Generate contextual help using AI
    const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [{
        role: 'user',
        content: `Context: ${context}\nLesson: ${JSON.stringify(lessonContent)}\nQuestion: ${question}\n\nProvide helpful explanation in Arabic with English examples.`
      }]
    });
    
    return aiResponse.response;
  },

  async generateConversationPractice(
    topic: string, 
    userLevel: string, 
    language: string, 
    env: Env
  ): Promise<any> {
    // Generate conversation practice using AI
    const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [{
        role: 'user',
        content: `Generate a conversation practice for ${topic} at ${userLevel} level. Include the conversation in ${language === 'ar' ? 'Arabic with English translations' : 'English with Arabic translations'}, corrections, and suggestions for improvement.`
      }]
    });
    
    return {
      conversation: aiResponse.response,
      corrections: [],
      suggestions: [],
      next_topics: []
    };
  },

  async generateGrammarExplanation(
    grammarTopic: string, 
    examples: string[], 
    userLevel: string, 
    env: Env
  ): Promise<any> {
    // Generate grammar explanation using AI
    const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [{
        role: 'user',
        content: `Explain ${grammarTopic} for ${userLevel} English learners. Include examples: ${examples.join(', ')}. Provide explanation in Arabic with English examples, practice exercises, and common mistakes.`
      }]
    });
    
    return {
      explanation: aiResponse.response,
      examples: examples,
      practice_exercises: [],
      common_mistakes: []
    };
  },

  async generateVocabularyExercises(
    topic: string, 
    difficulty: string, 
    exerciseType: string, 
    env: Env
  ): Promise<any> {
    // Generate vocabulary exercises using AI
    const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [{
        role: 'user',
        content: `Generate ${exerciseType} vocabulary exercises for ${topic} at ${difficulty} level. Include questions, options, correct answers, and explanations in Arabic with English examples.`
      }]
    });
    
    return {
      exercises: [],
      topic_vocabulary: [],
      difficulty_level: difficulty
    };
  },

  async generatePronunciationHelp(
    word: string, 
    phonetic: string, 
    audioUrl: string, 
    env: Env
  ): Promise<any> {
    // Generate pronunciation help using AI
    const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [{
        role: 'user',
        content: `Provide pronunciation help for the word "${word}" with phonetic spelling "${phonetic}". Include pronunciation tips, similar words, practice sentences, and guidance in Arabic with English examples.`
      }]
    });
    
    return {
      pronunciation: word,
      phonetic_spelling: phonetic,
      similar_words: [],
      practice_sentences: [],
      tips: []
    };
  },

  async updateUserProgress(db: D1Database, progress: UserProgress): Promise<void> {
    // Ensure table exists then update user progress in database
    await this.ensureUserProgressTable(db);
    // Manual upsert to avoid ON CONFLICT compatibility issues
    const updateStmt = db.prepare(`
      UPDATE user_progress
      SET completed = ?,
          score = ?,
          time_spent = ?,
          completed_at = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND lesson_id = ?
    `);

    const updateResult: any = await updateStmt
      .bind(
        progress.completed ? 1 : 0,
        Number(progress.score ?? 0),
        Number(progress.time_spent ?? 0),
        String(progress.completed_at),
        String(progress.user_id),
        Number(progress.lesson_id)
      )
      .run();

    const changes = (updateResult && updateResult.meta && typeof updateResult.meta.changes === 'number')
      ? updateResult.meta.changes
      : 0;

    if (changes === 0) {
      const insertStmt = db.prepare(`
        INSERT INTO user_progress (
          user_id, lesson_id, completed, score, time_spent, completed_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);

      await insertStmt
        .bind(
          String(progress.user_id),
          Number(progress.lesson_id),
          progress.completed ? 1 : 0,
          Number(progress.score ?? 0),
          Number(progress.time_spent ?? 0),
          String(progress.completed_at)
        )
        .run();
    }
  },

  async getUserProgressStats(db: D1Database, userId: string): Promise<any> {
    // Ensure table exists then get comprehensive progress statistics
    await this.ensureUserProgressTable(db);
    const stmt = db.prepare(`
      SELECT 
        COUNT(*) as total_lessons,
        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_lessons,
        AVG(score) as average_score,
        SUM(time_spent) as total_time
      FROM user_progress 
      WHERE user_id = ?
    `);
    
    const result = await stmt.bind(userId).first();
    
    return {
      user_id: userId,
      total_lessons: result?.total_lessons || 0,
      completed_lessons: result?.completed_lessons || 0,
      completion_rate: result?.total_lessons ? (result.completed_lessons / result.total_lessons * 100).toFixed(2) : 0,
      average_score: result?.average_score || 0,
      total_time: result?.total_time || 0
    };
  },

  async ensureUserProgressTable(db: D1Database): Promise<void> {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        lesson_id INTEGER NOT NULL,
        completed INTEGER DEFAULT 0,
        score INTEGER DEFAULT 0,
        time_spent INTEGER DEFAULT 0,
        attempts INTEGER DEFAULT 1,
        completed_at TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, lesson_id)
      )
    `).run();
  },

  async ensureUsersTable(db: D1Database): Promise<void> {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        full_name TEXT,
        email TEXT,
        phone TEXT,
        id_number TEXT,
        password TEXT,
        phone_number TEXT,
        term_enrolled TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1,
        subscription_status TEXT DEFAULT 'free',
        subscription_expires DATETIME,
        term1_paid BOOLEAN DEFAULT 0,
        term1_payment_date DATETIME,
        last_login DATETIME
      )
    `).run();
  },

  async ensureUserExists(db: D1Database, userId: string): Promise<void> {
    await this.ensureUsersTable(db);
    const existing = await db.prepare('SELECT id FROM users WHERE id = ?').bind(userId).first();
    if (!existing) {
      await db.prepare('INSERT INTO users (id, full_name) VALUES (?, ?)').bind(userId, 'Guest User').run();
    }
  },

  async uploadLessonsToRAG(lessons: any[], env: Env): Promise<any[]> {
    // Upload lessons to RAG system
    const results = [];
    
    for (const lesson of lessons) {
      try {
        // Generate embedding for lesson content
        const embedding = await this.generateEmbedding(lesson.content, env);
        
        // Store in vector database (support different SDK signatures)
        const vector = {
          id: lesson.chunk_id,
          values: embedding,
          vector: embedding,
          metadata: {
            lesson_id: lesson.lesson_id,
            title: lesson.title,
            content: lesson.content,
            tags: lesson.tags,
            language: lesson.language,
            target_language: lesson.target_language,
            chunk_size: lesson.chunk_size,
            content_type: lesson.content_type
          }
        } as any;

        const index: any = env.VECTORIZE_INDEX as any;
        if (index?.upsert && typeof index.upsert === 'function') {
          try {
            await index.upsert([vector]);
          } catch {
            await index.upsert({ vectors: [vector] });
          }
        } else if (index?.insert && typeof index.insert === 'function') {
          try {
            await index.insert([vector]);
          } catch {
            await index.insert({ vectors: [vector] });
          }
        } else {
          throw new Error('Vectorize binding does not support upsert/insert');
        }
        
        // Best-effort store lesson content in R2 (do not fail upload on R2 errors)
        try {
          await env.LESSON_BUCKET.put(
            `lesson_${lesson.lesson_id}.json`,
            JSON.stringify(lesson)
          );
        } catch (r2Err) {
          // Log-only; continue
          console.warn('R2 put failed for lesson', lesson.lesson_id);
        }
        
        results.push({
          chunk_id: lesson.chunk_id,
          status: 'success',
          message: 'Uploaded successfully'
        });
      } catch (error) {
        results.push({
          chunk_id: lesson.chunk_id,
          status: 'error',
          message: error instanceof Error ? error.message : 'Upload failed'
        });
      }
    }
    
    return results;
  },

  // AI-powered lesson generation with comprehensive Arabic explanations
  async handleAILessonGeneration(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const { 
        lesson_id, 
        topic, 
        user_level = 'beginner', 
        lesson_number, 
        enhanced_prompt, 
        context 
      } = await request.json();
      
      if (!lesson_id && !topic) {
        return new Response(JSON.stringify({ error: 'Lesson ID or topic is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Create lesson key for caching
      const lessonKey = this.generateLessonKey(topic || lesson_id, user_level, lesson_number);
      
      // First, check if lesson already exists in RAG cache
      const cachedLesson = await this.getCachedLessonFromRAG(lessonKey, env);
      if (cachedLesson) {
        console.log(`Using cached lesson for: ${lessonKey}`);
        return new Response(JSON.stringify({
          ...cachedLesson,
          cached: true,
          message: 'Lesson retrieved from cache'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get lesson content from RAG if lesson_id provided
      let lessonContent = null;
      if (lesson_id) {
        try {
          lessonContent = await this.getLessonContent(lesson_id, env);
        } catch (error) {
          console.warn(`Lesson ${lesson_id} not found, generating from topic`);
        }
      }

      // Generate comprehensive lesson with AI
      console.log(`Generating new lesson for: ${lessonKey}`);
      const generatedLesson = await this.generateComprehensiveLesson(
        topic || lessonContent?.title || 'English Lesson',
        lessonContent,
        user_level,
        env,
        lesson_number,
        enhanced_prompt,
        context
      );

      // Save the generated lesson to RAG for future use
      await this.saveLessonToRAG(lessonKey, generatedLesson, topic || lessonContent?.title || 'English Lesson', user_level, env);

      return new Response(JSON.stringify({
        ...generatedLesson,
        cached: false,
        message: 'New lesson generated and saved'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('AI lesson generation error:', error);
      return new Response(JSON.stringify({ error: 'Failed to generate lesson' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },

  // Word translation endpoint
  async handleWordTranslation(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const { word, context = '' } = await request.json();
      
      if (!word) {
        return new Response(JSON.stringify({ error: 'Word is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const translation = await this.translateWordToArabic(word, context, env);

      return new Response(JSON.stringify(translation), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Word translation error:', error);
      return new Response(JSON.stringify({ error: 'Failed to translate word' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },

  // Word pronunciation endpoint
  async handleWordPronunciation(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const { word } = await request.json();
      
      if (!word) {
        return new Response(JSON.stringify({ error: 'Word is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Generate audio pronunciation using Cloudflare AI
      const audioResponse = await env.AI.run('@cf/microsoft/speecht5-tts', {
        text: word,
        speaker: 'male' // or 'female'
      });

      // Return audio data as base64
      const audioBuffer = await audioResponse.arrayBuffer();
      const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

      return new Response(JSON.stringify({
        word,
        audio_base64: audioBase64,
        audio_type: 'audio/wav'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Word pronunciation error:', error);
      return new Response(JSON.stringify({ error: 'Failed to generate pronunciation' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },

  // Generate comprehensive lesson with 20 English examples
  async generateComprehensiveLesson(
    topic: string,
    existingContent: any,
    userLevel: string,
    env: Env,
    lessonNumber?: number,
    enhancedPrompt?: string,
    context?: string
  ): Promise<any> {
    // Create detailed prompt for AI lesson generation
    const basePrompt = enhancedPrompt || `
    Create a comprehensive English lesson for Arabic speakers on the topic: "${topic}"
    
    Requirements:
    1. Provide a detailed explanation in Arabic about the topic
    2. Include 20 practical English examples with increasing difficulty
    3. Each example should demonstrate the concept clearly
    4. Include grammar rules and usage patterns
    5. Add pronunciation tips in Arabic
    6. Include common mistakes to avoid
    7. Provide practice exercises
    
    Level: ${userLevel}
    `;

    const sequentialContext = lessonNumber ? `
    
    SEQUENTIAL LEARNING CONTEXT:
    - This is Lesson ${lessonNumber} in a progressive learning sequence
    - ${lessonNumber === 1 ? 'This is the foundation lesson - start with absolute basics' : `Build upon knowledge from previous ${lessonNumber - 1} lessons`}
    - Context: ${context || 'Sequential progression'}
    - Ensure logical progression from previous lessons
    - Reference concepts that would have been learned in earlier lessons
    ` : '';

    const prompt = basePrompt + sequentialContext + `
    
    Format the response as JSON with this structure:
    {
      "title_arabic": "عنوان الدرس بالعربية",
      "title_english": "Lesson Title in English",
      "explanation_arabic": "شرح مفصل بالعربية مع الربط بالدروس السابقة",
      "explanation_english": "Detailed explanation in English with connection to previous lessons",
      "grammar_rules": ["قاعدة 1 بالعربية", "قاعدة 2 بالعربية"],
      "examples": [
        {
          "english": "Example sentence",
          "arabic_translation": "الترجمة العربية",
          "difficulty": "beginner|intermediate|advanced",
          "explanation": "شرح السبب والاستخدام بالعربية"
        }
      ],
      "pronunciation_tips": ["نصيحة نطق 1", "نصيحة نطق 2"],
      "common_mistakes": ["خطأ شائع 1 يجب تجنبه", "خطأ شائع 2"],
      "practice_exercises": [
        {
          "question": "سؤال تطبيقي بالعربية",
          "answer": "الإجابة الصحيحة",
          "explanation": "شرح لماذا هذه الإجابة صحيحة"
        }
      ]
    }
    
    Make sure to provide exactly 20 diverse examples that cover different aspects of the topic.
    All Arabic text should be comprehensive and educational.
    `;

    try {
      const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [{
          role: 'user',
          content: prompt
        }],
        max_tokens: 4000
      });

      let lessonData;
      try {
        lessonData = JSON.parse(aiResponse.response);
      } catch (parseError) {
        // If JSON parsing fails, create a structured response
        lessonData = this.createFallbackLesson(topic, aiResponse.response);
      }

      // Ensure we have 20 examples
      if (lessonData.examples.length < 20) {
        const additionalExamples = await this.generateAdditionalExamples(
          topic,
          20 - lessonData.examples.length,
          userLevel,
          env
        );
        lessonData.examples = [...lessonData.examples, ...additionalExamples];
      }

      return {
        success: true,
        lesson: lessonData,
        generated_at: new Date().toISOString(),
        topic,
        level: userLevel
      };
    } catch (error) {
      console.error('AI lesson generation failed:', error);
      return this.createFallbackLesson(topic, null);
    }
  },

  // Generate additional examples if needed
  async generateAdditionalExamples(
    topic: string,
    count: number,
    userLevel: string,
    env: Env
  ): Promise<any[]> {
    const prompt = `
    Generate ${count} additional English examples for the topic "${topic}" at ${userLevel} level.
    
    Format as JSON array:
    [
      {
        "english": "Example sentence",
        "arabic_translation": "الترجمة العربية",
        "difficulty": "${userLevel}",
        "explanation": "شرح السبب والاستخدام"
      }
    ]
    `;

    try {
      const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [{
          role: 'user',
          content: prompt
        }],
        max_tokens: 2000
      });

      return JSON.parse(aiResponse.response);
    } catch (error) {
      console.error('Failed to generate additional examples:', error);
      return this.createFallbackExamples(topic, count);
    }
  },

  // Translate word to Arabic with context
  async translateWordToArabic(word: string, context: string, env: Env): Promise<any> {
    const prompt = `
    You are an expert Arabic-English translator. Translate the English word "${word}" to Arabic.
    Context: ${context}
    
    IMPORTANT: All explanations, meanings, and descriptions must be in Arabic ONLY.
    
    Provide a comprehensive translation with:
    1. Primary Arabic translation
    2. Detailed Arabic meaning/definition
    3. Alternative Arabic meanings if applicable
    4. Part of speech in Arabic
    5. Pronunciation guide in Arabic letters
    6. Full definition in Arabic
    7. Example usage in English and Arabic
    
    Format as JSON (ALL fields except "word" and "example_english" must be in Arabic):
    {
      "word": "${word}",
      "arabic_translation": "الترجمة الرئيسية",
      "arabic_meaning": "معنى مفصل للكلمة باللغة العربية",
      "alternative_meanings_arabic": ["معنى1", "معنى2", "معنى3"],
      "part_of_speech_arabic": "اسم/فعل/صفة/ظرف/حرف/etc",
      "pronunciation_guide_arabic": "دليل النطق باللغة العربية",
      "definition_arabic": "تعريف شامل ومفصل للكلمة باللغة العربية",
      "example_english": "Example sentence with ${word}",
      "example_arabic": "مثال مترجم باللغة العربية"
    }
    
    Make sure to provide rich, detailed Arabic explanations for Arabic speakers learning English.
    `;

    try {
      const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [{
          role: 'user',
          content: prompt
        }],
        max_tokens: 1500
      });

      return JSON.parse(aiResponse.response);
    } catch (error) {
      console.error('Translation failed:', error);
      return this.createFallbackTranslation(word);
    }
  },

  // Create fallback lesson if AI generation fails
  createFallbackLesson(topic: string, aiResponse: string | null): any {
    return {
      success: false,
      lesson: {
        title_arabic: `درس: ${topic}`,
        title_english: `Lesson: ${topic}`,
        explanation_arabic: `شرح مبسط لموضوع ${topic}. يرجى المحاولة مرة أخرى لشرح أكثر تفصيلاً.`,
        explanation_english: `Basic explanation of ${topic}. Please try again for more detailed explanation.`,
        grammar_rules: [`Basic rules for ${topic}`],
        examples: this.createFallbackExamples(topic, 20),
        pronunciation_tips: [`Practice ${topic} pronunciation`],
        common_mistakes: [`Common mistakes in ${topic}`],
        practice_exercises: [{
          question: `Practice question about ${topic}`,
          answer: "Practice answer",
          explanation: "Practice explanation"
        }]
      },
      generated_at: new Date().toISOString(),
      topic,
      fallback: true,
      ai_response: aiResponse
    };
  },

  // Create fallback examples
  createFallbackExamples(topic: string, count: number): any[] {
    const examples = [];
    for (let i = 1; i <= count; i++) {
      examples.push({
        english: `Example ${i} for ${topic}`,
        arabic_translation: `مثال ${i} لموضوع ${topic}`,
        difficulty: 'beginner',
        explanation: `شرح المثال ${i}`
      });
    }
    return examples;
  },

  // Create fallback translation
  createFallbackTranslation(word: string): any {
    return {
      word,
      arabic_translation: `ترجمة ${word}`,
      arabic_meaning: `معنى الكلمة ${word} باللغة العربية`,
      alternative_meanings_arabic: ["معنى بديل", "معنى آخر"],
      part_of_speech_arabic: "غير محدد",
      pronunciation_guide_arabic: `دليل نطق ${word} بالأحرف العربية`,
      definition_arabic: `تعريف شامل للكلمة ${word} باللغة العربية مع شرح مفصل لاستخداماتها المختلفة`,
      example_english: `This is an example sentence with ${word}`,
      example_arabic: `هذه جملة مثال تحتوي على كلمة ${word}`
    };
  },

  analyzeUserStrengths(userProgress: UserProgress[]): string[] {
    // Analyze user strengths based on progress
    const strengths: string[] = [];
    
    // Calculate average scores by category
    const scoresByCategory = new Map<string, number[]>();
    
    userProgress.forEach(progress => {
      // This would need to be enhanced with actual lesson categories
      const category = 'general';
      if (!scoresByCategory.has(category)) {
        scoresByCategory.set(category, []);
      }
      scoresByCategory.get(category)!.push(progress.score);
    });
    
    // Identify strengths (categories with high scores)
    scoresByCategory.forEach((scores, category) => {
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avgScore >= 80) {
        strengths.push(category);
      }
    });
    
    return strengths;
  },

  // Game Generation Methods
  async handleGameGeneration(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    try {
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { gameType, difficulty, topics, title } = await request.json();

      // Route to specific game generator
      switch (gameType) {
        case 'vocabulary-matching':
          return this.generateVocabularyMatchingGame(topics, difficulty, title, env, corsHeaders);
        case 'grammar-adventure':
          return this.generateGrammarAdventureGame(topics, difficulty, title, env, corsHeaders);
        case 'story-builder':
          return this.generateStoryBuilderGame(topics, difficulty, title, env, corsHeaders);
        case 'pronunciation-practice':
          return this.generatePronunciationGame(topics, difficulty, title, env, corsHeaders);
        default:
          return new Response(JSON.stringify({ error: 'Unsupported game type' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
      }
    } catch (error) {
      console.error('Error generating game:', error);
      return new Response(JSON.stringify({ 
        error: 'Game generation failed', 
        message: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },

  async generateVocabularyMatchingGame(topics: string[], difficulty: string, title: string, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    try {
      const prompt = `Create a vocabulary matching game with 8 word pairs for the topic "${topics.join(', ')}" at ${difficulty} level.
      Return JSON: { theme: "Game theme", themeAr: "Arabic theme", pairs: [{ english: "word", arabic: "ترجمة", emoji: "📚" }] }`;

      const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [{ role: 'user', content: prompt }]
      });

      let gameData;
      try {
        gameData = JSON.parse(response.response);
      } catch {
        gameData = {
          theme: `${title} Vocabulary`,
          themeAr: `مفردات ${title}`,
          pairs: [
            { english: "book", arabic: "كتاب", emoji: "📚" },
            { english: "pen", arabic: "قلم", emoji: "✏️" },
            { english: "table", arabic: "طاولة", emoji: "🪑" },
            { english: "water", arabic: "ماء", emoji: "💧" },
            { english: "food", arabic: "طعام", emoji: "🍽️" },
            { english: "house", arabic: "بيت", emoji: "🏠" },
            { english: "car", arabic: "سيارة", emoji: "🚗" },
            { english: "phone", arabic: "هاتف", emoji: "📱" }
          ]
        };
      }

      return new Response(JSON.stringify(gameData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error generating vocabulary game:', error);
      return new Response(JSON.stringify({ error: 'Vocabulary game generation failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },

  async generateGrammarAdventureGame(topics: string[], difficulty: string, title: string, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    try {
      const prompt = `Create a grammar adventure game for "${topics.join(', ')}" at ${difficulty} level.
      Return JSON with story, question, 3 options (one correct), and explanations in English and Arabic.`;

      const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [{ role: 'user', content: prompt }]
      });

      let gameData;
      try {
        gameData = JSON.parse(response.response);
        gameData.imageUrl = ''; // Placeholder for now
      } catch {
        gameData = {
          story: "You enter a magical forest where grammar rules come alive. A wise owl tests your knowledge.",
          storyAr: "تدخل غابة سحرية حيث تتجسد قواعد النحو. تختبر بومة حكيمة معرفتك.",
          imageUrl: "",
          question: "Which sentence is correct?",
          questionAr: "أي جملة صحيحة؟",
          options: [
            { text: "I am going every day.", textAr: "أذهب كل يوم.", isCorrect: false },
            { text: "I go every day.", textAr: "أذهب كل يوم.", isCorrect: true },
            { text: "I went every day.", textAr: "ذهبت كل يوم.", isCorrect: false }
          ],
          explanation: "Present simple is used for habits.",
          explanationAr: "المضارع البسيط يُستخدم للعادات."
        };
      }

      return new Response(JSON.stringify(gameData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error generating grammar game:', error);
      return new Response(JSON.stringify({ error: 'Grammar game generation failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },

  async generateStoryBuilderGame(topics: string[], difficulty: string, title: string, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    try {
      const prompt = `Create a story builder game for "${topics.join(', ')}" at ${difficulty} level.
      Return JSON with theme, scene description, vocabulary list, and 2 choices for story progression.`;

      const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [{ role: 'user', content: prompt }]
      });

      let gameData;
      try {
        gameData = JSON.parse(response.response);
        gameData.imageUrl = ''; // Placeholder
      } catch {
        gameData = {
          theme: "Library Adventure",
          sceneDescription: "You enter an ancient library filled with mysterious books.",
          sceneDescriptionAr: "تدخل مكتبة قديمة مليئة بالكتب الغامضة.",
          imageUrl: "",
          vocabulary: [
            { word: "ancient", definition: "very old", definitionAr: "قديم جداً" },
            { word: "mysterious", definition: "strange and unknown", definitionAr: "غامض" }
          ],
          choices: [
            { text: "Explore the library", textAr: "استكشف المكتبة", consequence: "You find a hidden room." },
            { text: "Ask for help", textAr: "اطلب المساعدة", consequence: "The librarian guides you." }
          ]
        };
      }

      return new Response(JSON.stringify(gameData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error generating story game:', error);
      return new Response(JSON.stringify({ error: 'Story game generation failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },

  async generatePronunciationGame(topics: string[], difficulty: string, title: string, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    try {
      const gameData = {
        words: [
          { text: "think", phonetic: "/θɪŋk/", audioUrl: "", difficulty: 7 },
          { text: "three", phonetic: "/θriː/", audioUrl: "", difficulty: 8 },
          { text: "vacation", phonetic: "/veɪˈkeɪʃən/", audioUrl: "", difficulty: 5 },
          { text: "computer", phonetic: "/kəmˈpjuːtər/", audioUrl: "", difficulty: 4 },
          { text: "beautiful", phonetic: "/ˈbjuːtɪfʊl/", audioUrl: "", difficulty: 6 }
        ],
        targetAccuracy: difficulty === 'easy' ? 70 : difficulty === 'medium' ? 80 : 85
      };

      return new Response(JSON.stringify(gameData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error generating pronunciation game:', error);
      return new Response(JSON.stringify({ error: 'Pronunciation game generation failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },

  // Individual game generation handlers
  async handleVocabularyGameGeneration(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    const { topics, difficulty, title } = await request.json();
    return this.generateVocabularyMatchingGame(topics, difficulty, title, env, corsHeaders);
  },

  async handleGrammarGameGeneration(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    const { topics, difficulty, title } = await request.json();
    return this.generateGrammarAdventureGame(topics, difficulty, title, env, corsHeaders);
  },

  async handleStoryGameGeneration(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    const { topics, difficulty, title } = await request.json();
    return this.generateStoryBuilderGame(topics, difficulty, title, env, corsHeaders);
  },

  async handlePronunciationGameGeneration(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    const { topics, difficulty, title } = await request.json();
    return this.generatePronunciationGame(topics, difficulty, title, env, corsHeaders);
  },

  // AI Tutor Chat Handler
  async handleTutorChat(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const { 
        lessonId, 
        lessonTitle, 
        lessonContent, 
        userMessage, 
        tutorMode = 'explanation',
        questionCount = 0,
        messageHistory = [],
        userErrors = []
      } = await request.json();

      if (!userMessage || !lessonId) {
        return new Response(JSON.stringify({ error: 'User message and lesson ID are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const tutorResponse = await this.generateTutorResponse(
        lessonId, 
        lessonTitle, 
        lessonContent, 
        userMessage, 
        tutorMode,
        questionCount,
        messageHistory,
        userErrors,
        env
      );

      // Track user interaction for lesson enhancement
      if (tutorResponse && !tutorResponse.error) {
        const lessonKey = this.generateLessonKey(lessonTitle || lessonId, 'general', undefined);
        await this.trackUserInteractionForEnhancement(
          lessonKey,
          userMessage,
          tutorResponse.response,
          env
        );
      }

      return new Response(JSON.stringify(tutorResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Tutor chat error:', error);
      return new Response(JSON.stringify({ error: 'Failed to generate tutor response' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },

  // Generate AI Tutor Response
  async generateTutorResponse(
    lessonId: string, 
    lessonTitle: string, 
    lessonContent: string, 
    userMessage: string, 
    tutorMode: string,
    questionCount: number,
    messageHistory: any[],
    userErrors: string[],
    env: Env
  ): Promise<any> {
    const contextMessages = messageHistory.slice(-6).map(msg => `${msg.type}: ${msg.content}`).join('\n');
    
    let systemPrompt = '';
    let responseInstructions = '';
    
    // Determine tutor behavior based on mode and context
    if (tutorMode === 'explanation') {
      systemPrompt = `أنت مدرس خبير في اللغة الإنجليزية. تتحدث مع طالب عربي يتعلم اللغة الإنجليزية.
      
الدرس الحالي: ${lessonTitle}
محتوى الدرس: ${lessonContent}

قواعد المحادثة:
1. تحدث باللغة العربية فقط في إجاباتك
2. اشرح المفاهيم الإنجليزية بأسلوب واضح ومبسط
3. استخدم أمثلة إنجليزية مع شرح عربي لكل مثال
4. كن صبوراً ومشجعاً
5. إذا انتهيت من الشرح، ابدأ بطرح أسئلة لاختبار فهم الطالب
6. استخدم أسلوب المحادثة الودود والمشجع

المحادثة السابقة:
${contextMessages}`;

      responseInstructions = `
إذا كان سؤال الطالب واضحاً، اشرح له المفهوم بالتفصيل باللغة العربية مع أمثلة إنجليزية.
إذا انتهيت من الشرح، اطرح سؤالاً لاختبار فهمه.

أعد الإجابة في تنسيق JSON:
{
  "response": "إجابتك باللغة العربية مع الأمثلة الإنجليزية",
  "isQuestion": false/true,
  "newMode": "explanation/questioning",
  "lessonContext": "السياق من الدرس",
  "englishExamples": ["مثال1", "مثال2"]
}`;
    
    } else if (tutorMode === 'questioning') {
      systemPrompt = `أنت مدرس خبير يطرح أسئلة على الطالب لاختبار فهمه للدرس.

الدرس الحالي: ${lessonTitle}
محتوى الدرس: ${lessonContent}
عدد الأسئلة المطروحة: ${questionCount}

قواعد الأسئلة:
1. اطرح أسئلة متدرجة في الصعوبة
2. ابدأ بأسئلة بسيطة ثم انتقل للأصعب
3. اطرح سؤالاً واحداً في كل مرة
4. تحدث باللغة العربية فقط
5. إذا أجاب الطالب خطأ، انتقل لوضع التصحيح
6. إذا أجاب صحيحاً، امدحه واطرح السؤال التالي

المحادثة السابقة:
${contextMessages}`;

      responseInstructions = `
اطرح سؤالاً مناسباً لمستوى الطالب عن الدرس.

أعد الإجابة في تنسيق JSON:
{
  "response": "سؤالك باللغة العربية",
  "isQuestion": true,
  "newMode": "questioning",
  "questionLevel": "easy/medium/hard",
  "expectedAnswer": "الإجابة المتوقعة"
}`;

    } else if (tutorMode === 'correction') {
      systemPrompt = `أنت مدرس خبير يصحح أخطاء الطالب بأسلوب مشجع.

الدرس الحالي: ${lessonTitle}
محتوى الدرس: ${lessonContent}
أخطاء الطالب السابقة: ${userErrors.join(', ')}

قواعد التصحيح:
1. صحح الخطأ بلطف وتشجيع
2. اشرح السبب وراء الإجابة الصحيحة باللغة العربية
3. أعط أمثلة إنجليزية مع شرح عربي
4. اشرح لماذا الطريقة الصحيحة أفضل
5. شجع الطالب وذكره أن الأخطاء جزء من التعلم
6. بعد التصحيح، اطرح سؤالاً آخر للتأكد من الفهم

المحادثة السابقة:
${contextMessages}`;

      responseInstructions = `
صحح خطأ الطالب واشرح الإجابة الصحيحة بالتفصيل.

أعد الإجابة في تنسيق JSON:
{
  "response": "تصحيحك مع الشرح باللغة العربية",
  "isCorrection": true,
  "correctAnswer": "الإجابة الصحيحة",
  "explanation": "شرح مفصل بالعربية",
  "englishExamples": ["أمثلة إنجليزية"],
  "newMode": "questioning",
  "userError": "خطأ الطالب"
}`;
    }

    const fullPrompt = `${systemPrompt}

رسالة الطالب الحالية: "${userMessage}"

${responseInstructions}

تذكر: كن مدرساً صبوراً ومشجعاً. هدفك مساعدة الطالب على فهم اللغة الإنجليزية من خلال شرح المفاهيم باللغة العربية مع أمثلة إنجليزية واضحة.`;

    try {
      const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [{
          role: 'user',
          content: fullPrompt
        }],
        max_tokens: 2000
      });

      const responseData = JSON.parse(aiResponse.response);
      return responseData;
    } catch (error) {
      console.error('AI tutor response error:', error);
      return {
        response: 'عذراً، حدث خطأ تقني. دعني أساعدك بطريقة أخرى. ما هو سؤالك عن الدرس؟',
        isQuestion: false,
        newMode: tutorMode,
        error: true
      };
    }
  },

  // Generate unique lesson key for caching
  generateLessonKey(topic: string, userLevel: string, lessonNumber: number | undefined): string {
    const cleanTopic = topic.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const key = `lesson_${cleanTopic}_${userLevel}_${lessonNumber || 'general'}`;
    return key;
  },

  // Save lesson to RAG cache
  async saveLessonToRAG(lessonKey: string, lesson: any, topic: string, userLevel: string, env: Env): Promise<void> {
    try {
      // Create lesson metadata for RAG
      const lessonData = {
        lesson_key: lessonKey,
        topic: topic,
        user_level: userLevel,
        lesson_content: lesson,
        created_at: new Date().toISOString(),
        usage_count: 0,
        enhancement_log: [],
        common_questions: [],
        improvement_score: 1.0
      };

      // Save to D1 database
      await env.DB.prepare(`
        INSERT OR REPLACE INTO cached_lessons 
        (lesson_key, topic, user_level, lesson_content, created_at, usage_count, enhancement_log, improvement_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        lessonKey,
        topic,
        userLevel,
        JSON.stringify(lesson),
        lessonData.created_at,
        0,
        JSON.stringify([]),
        1.0
      ).run();

      console.log(`Lesson saved to RAG: ${lessonKey}`);
    } catch (error) {
      console.error('Error saving lesson to RAG:', error);
      // Don't throw error - lesson generation should still succeed
    }
  },

  // Get cached lesson from RAG
  async getCachedLessonFromRAG(lessonKey: string, env: Env): Promise<any | null> {
    try {
      // First try direct lookup by key
      const result = await env.DB.prepare(`
        SELECT lesson_content, usage_count 
        FROM cached_lessons 
        WHERE lesson_key = ?
      `).bind(lessonKey).first();

      if (result) {
        // Update usage count
        await env.DB.prepare(`
          UPDATE cached_lessons 
          SET usage_count = usage_count + 1 
          WHERE lesson_key = ?
        `).bind(lessonKey).run();

        console.log(`Retrieved cached lesson: ${lessonKey} (used ${result.usage_count + 1} times)`);
        return JSON.parse(result.lesson_content);
      }

      return null;
    } catch (error) {
      console.error('Error retrieving cached lesson:', error);
      return null;
    }
  },

  // Track user interaction for lesson enhancement (simplified version)
  async trackUserInteractionForEnhancement(
    lessonKey: string, 
    userQuestion: string, 
    tutorResponse: string, 
    env: Env
  ): Promise<void> {
    try {
      // Create tables if they don't exist
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS user_interactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          lesson_key TEXT NOT NULL,
          user_question TEXT NOT NULL,
          tutor_response TEXT,
          frequency INTEGER DEFAULT 1,
          created_at TEXT NOT NULL
        )
      `).run();

      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS lesson_enhancements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          lesson_key TEXT NOT NULL,
          enhancement_trigger TEXT NOT NULL,
          enhancement_method TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `).run();

      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS cached_lessons (
          lesson_key TEXT PRIMARY KEY,
          topic TEXT NOT NULL,
          user_level TEXT NOT NULL,
          lesson_content TEXT NOT NULL,
          created_at TEXT NOT NULL,
          usage_count INTEGER DEFAULT 0,
          enhancement_log TEXT DEFAULT '[]',
          improvement_score REAL DEFAULT 1.0
        )
      `).run();

      // Track the interaction
      await env.DB.prepare(`
        INSERT INTO user_interactions 
        (lesson_key, user_question, tutor_response, frequency, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).bind(
        lessonKey,
        userQuestion,
        tutorResponse,
        1,
        new Date().toISOString()
      ).run();

      // Check if similar questions exist (simple similarity check)
      const similarQuestions = await env.DB.prepare(`
        SELECT COUNT(*) as count 
        FROM user_interactions 
        WHERE lesson_key = ? AND user_question LIKE ?
      `).bind(lessonKey, `%${userQuestion.substring(0, 20)}%`).first();

      // If multiple similar questions, trigger enhancement consideration
      if (similarQuestions && similarQuestions.count >= 3) {
        console.log(`Multiple similar questions detected for lesson ${lessonKey}. Consider enhancement.`);
        await this.considerLessonEnhancement(lessonKey, userQuestion, similarQuestions.count, env);
      }

    } catch (error) {
      console.error('Error tracking user interaction:', error);
      // Don't throw error - tutor chat should continue working
    }
  },

  // Consider lesson enhancement based on user patterns
  async considerLessonEnhancement(lessonKey: string, userQuestion: string, frequency: number, env: Env): Promise<void> {
    try {
      // Log enhancement consideration
      await env.DB.prepare(`
        INSERT INTO lesson_enhancements 
        (lesson_key, enhancement_trigger, enhancement_method, created_at)
        VALUES (?, ?, ?, ?)
      `).bind(
        lessonKey,
        `Frequent question: ${userQuestion}`,
        'auto_detection',
        new Date().toISOString()
      ).run();

      console.log(`Lesson enhancement logged for ${lessonKey}: ${frequency} similar questions about "${userQuestion}"`);
    } catch (error) {
      console.error('Error considering lesson enhancement:', error);
    }
  },

  // Generate quiz based on user's learning data
  async handleGenerateQuiz(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const { 
        quiz_id,
        quiz_type = 'regular',
        covers_items = [],
        focus_areas = [],
        user_id,
        user_learning_data = {}
      } = await request.json();

      if (!quiz_id) {
        return new Response(JSON.stringify({ error: 'Quiz ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Check if quiz already exists for this user
      const existingQuiz = await this.getCachedQuiz(quiz_id, user_id, env);
      if (existingQuiz) {
        return new Response(JSON.stringify({
          quiz: existingQuiz,
          cached: true,
          message: 'Quiz retrieved from cache'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Generate new quiz
      const quiz = await this.generateQuizContent(
        quiz_id,
        quiz_type,
        covers_items,
        focus_areas,
        user_learning_data,
        env
      );

      // Cache the quiz
      await this.cacheQuiz(quiz_id, user_id, quiz, env);

      return new Response(JSON.stringify({
        quiz: quiz,
        cached: false,
        message: 'New quiz generated'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Quiz generation error:', error);
      return new Response(JSON.stringify({ error: 'Failed to generate quiz' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },

  // Generate quiz content using AI
  async generateQuizContent(
    quiz_id: string,
    quiz_type: string,
    covers_items: number[],
    focus_areas: string[],
    user_learning_data: any,
    env: Env
  ): Promise<any> {
    const isFinalExam = quiz_type === 'final';
    const questionCount = isFinalExam ? 60 : 20;
    const passingScore = isFinalExam ? 40 : 12;

    const prompt = `
    Generate a comprehensive English language ${isFinalExam ? 'final exam' : 'quiz'} for Arabic speakers.

    Quiz Details:
    - Total Questions: ${questionCount}
    - Question Types: ${isFinalExam ? 'MCQ (30), Fill-in-blanks (20), Pronunciation (10)' : 'MCQ (15), Fill-in-blanks (3), Pronunciation (2)'}
    - Focus Areas: ${focus_areas.join(', ')}
    - Covers Learning Items: ${covers_items.join(', ')}
    - Difficulty: ${isFinalExam ? 'Comprehensive (all levels)' : 'Progressive (beginner to intermediate)'}

    Requirements:
    1. Questions in English with Arabic translations
    2. Grammar-focused content (tenses, articles, prepositions, etc.)
    3. Use vocabulary from previous lessons
    4. MCQ with 4 options each
    5. Fill-in-blanks testing grammar rules
    6. Pronunciation testing common English words
    7. Each question needs explanation in both languages

    Return JSON format:
    {
      "id": "${quiz_id}",
      "title": "Quiz title",
      "description_english": "Description",
      "description_arabic": "الوصف بالعربية",
      "total_questions": ${questionCount},
      "passing_score": ${passingScore},
      "max_score": ${questionCount},
      "questions": [
        {
          "id": "q1",
          "type": "mcq|fill-blank|pronunciation",
          "question_english": "Question in English",
          "question_arabic": "السؤال بالعربية",
          "options": ["A", "B", "C", "D"], // for MCQ only
          "correct_answer": "correct answer",
          "explanation_english": "Why this is correct",
          "explanation_arabic": "لماذا هذا صحيح",
          "difficulty": "easy|medium|hard",
          "grammar_focus": "grammar topic",
          "lesson_reference": [1, 2, 3]
        }
      ]
    }

    Make sure questions test practical English usage that Arabic speakers commonly struggle with.
    `;

    try {
      const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [{
          role: 'user',
          content: prompt
        }],
        max_tokens: 4000
      });

      const quizData = JSON.parse(aiResponse.response);
      return quizData;
    } catch (error) {
      console.error('AI quiz generation error:', error);
      return this.createFallbackQuiz(quiz_id, quiz_type, questionCount, passingScore);
    }
  },

  // Create fallback quiz if AI generation fails
  createFallbackQuiz(quiz_id: string, quiz_type: string, questionCount: number, passingScore: number): any {
    const isFinalExam = quiz_type === 'final';
    
    return {
      id: quiz_id,
      title: isFinalExam ? 'Final Comprehensive Exam' : 'Progress Quiz',
      description_english: isFinalExam ? 'Final exam covering all course materials' : 'Assessment quiz for recent lessons',
      description_arabic: isFinalExam ? 'امتحان نهائي شامل يغطي جميع مواد الدورة' : 'اختبار تقييم للدروس الحديثة',
      total_questions: questionCount,
      passing_score: passingScore,
      max_score: questionCount,
      questions: this.generateFallbackQuestions(questionCount, isFinalExam)
    };
  },

  // Generate fallback questions
  generateFallbackQuestions(count: number, isFinalExam: boolean): any[] {
    const questions = [];
    
    for (let i = 1; i <= count; i++) {
      if (i <= Math.floor(count * 0.7)) {
        // MCQ questions (70%)
        questions.push({
          id: `q${i}`,
          type: 'mcq',
          question_english: `Choose the correct answer for question ${i}:`,
          question_arabic: `اختر الإجابة الصحيحة للسؤال ${i}:`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correct_answer: 'Option A',
          explanation_english: 'This is the correct grammatical form.',
          explanation_arabic: 'هذا هو الشكل النحوي الصحيح.',
          difficulty: 'medium',
          grammar_focus: 'general_grammar',
          lesson_reference: [i]
        });
      } else if (i <= Math.floor(count * 0.9)) {
        // Fill-in-blank questions (20%)
        questions.push({
          id: `q${i}`,
          type: 'fill-blank',
          question_english: `Fill in the blank for question ${i}:`,
          question_arabic: `املأ الفراغ للسؤال ${i}:`,
          sentence_with_blank: `I _____ to school yesterday.`,
          correct_answer: 'went',
          explanation_english: 'Past tense form is required.',
          explanation_arabic: 'يتطلب صيغة الماضي.',
          difficulty: 'medium',
          grammar_focus: 'past_tense',
          lesson_reference: [i]
        });
      } else {
        // Pronunciation questions (10%)
        questions.push({
          id: `q${i}`,
          type: 'pronunciation',
          question_english: `Pronounce this word correctly:`,
          question_arabic: `انطق هذه الكلمة بشكل صحيح:`,
          target_word: 'English',
          phonetic_spelling: '/ˈɪŋɡlɪʃ/',
          correct_answer: 'english',
          explanation_english: 'Focus on the vowel sounds.',
          explanation_arabic: 'ركز على أصوات الحروف المتحركة.',
          difficulty: 'medium',
          grammar_focus: 'pronunciation',
          lesson_reference: [i],
          minimum_accuracy: 70
        });
      }
    }
    
    return questions;
  },

  /**
   * Handle card interaction tracking
   */
  async handleCardInteractionTracking(request: Request, env: Env, corsHeaders: any): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const interactionData = await request.json();
      
      // Validate required fields
      const { cardType, cardId, cardTitle, action, timestamp, sessionId } = interactionData;
      
      if (!cardType || !cardId || !action) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: cardType, cardId, action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Store interaction in database
      const query = `
        INSERT OR REPLACE INTO user_card_interactions (
          session_id, user_id, card_type, card_id, card_title, action, 
          timestamp, user_agent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `;

      await env.DB.prepare(query)
        .bind(
          sessionId || null,
          interactionData.userId || null,
          cardType,
          cardId,
          cardTitle || '',
          action,
          timestamp || new Date().toISOString(),
          interactionData.userAgent || null
        )
        .run();

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Interaction tracked successfully',
          tracked: {
            cardType,
            cardId,
            action,
            timestamp: timestamp || new Date().toISOString()
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Error tracking card interaction:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to track interaction' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  },

  /**
   * Handle page view tracking
   */
  async handlePageViewTracking(request: Request, env: Env, corsHeaders: any): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const trackingData = await request.json();
      
      const { sessionId, userId, page, timestamp, userAgent, url } = trackingData;
      
      if (!page) {
        return new Response(
          JSON.stringify({ error: 'Page is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Store page view in database
      const query = `
        INSERT OR REPLACE INTO user_page_views (
          session_id, user_id, page, timestamp, user_agent, url, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `;

      await env.DB.prepare(query)
        .bind(
          sessionId || null,
          userId || null,
          page,
          timestamp || new Date().toISOString(),
          userAgent || null,
          url || null
        )
        .run();

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Page view tracked successfully',
          tracked: { page, timestamp: timestamp || new Date().toISOString() }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Error tracking page view:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to track page view' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  },

  /**
   * Handle event tracking
   */
  async handleEventTracking(request: Request, env: Env, corsHeaders: any): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const trackingData = await request.json();
      
      const { sessionId, userId, eventName, eventData, timestamp, userAgent, url } = trackingData;
      
      if (!eventName) {
        return new Response(
          JSON.stringify({ error: 'Event name is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Store event in database
      const query = `
        INSERT OR REPLACE INTO user_events (
          session_id, user_id, event_name, event_data, timestamp, user_agent, url, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `;

      await env.DB.prepare(query)
        .bind(
          sessionId || null,
          userId || null,
          eventName,
          JSON.stringify(eventData || {}),
          timestamp || new Date().toISOString(),
          userAgent || null,
          url || null
        )
        .run();

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Event tracked successfully',
          tracked: { eventName, timestamp: timestamp || new Date().toISOString() }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Error tracking event:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to track event' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  },

  /**
   * Handle Cloudflare Text-to-Speech
   */
  async handleCloudflareTextToSpeech(request: Request, env: Env, corsHeaders: any): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const { text, voice, mood } = await request.json();
      
      if (!text) {
        return new Response(
          JSON.stringify({ error: 'Text is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Use Cloudflare AI for Text-to-Speech
      const inputs = {
        text: text,
        voice: voice || "en-US-Standard-A"
      };

      // Adjust voice parameters based on mood
      let adjustedInputs = { ...inputs };
      if (mood) {
        switch (mood) {
          case 'happy':
          case 'excited':
            adjustedInputs.voice = "en-US-Standard-D"; // More energetic voice
            break;
          case 'sad':
            adjustedInputs.voice = "en-US-Standard-B"; // Calmer voice
            break;
          case 'angry':
            adjustedInputs.voice = "en-US-Standard-C"; // Firmer voice
            break;
          default:
            adjustedInputs.voice = "en-US-Standard-A";
        }
      }

      try {
        // Try Cloudflare AI TTS first
        const response = await env.AI.run('@cf/microsoft/speecht5-tts', adjustedInputs);
        
        if (response) {
          return new Response(response, {
            headers: {
              ...corsHeaders,
              'Content-Type': 'audio/wav',
              'Cache-Control': 'public, max-age=3600'
            }
          });
        } else {
          throw new Error('No audio generated');
        }
      } catch (aiError) {
        console.error('Cloudflare AI TTS error:', aiError);
        
        // Return a fallback response indicating browser TTS should be used
        return new Response(
          JSON.stringify({ 
            fallback: true, 
            message: 'Use browser TTS',
            text: text,
            mood: mood 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

    } catch (error) {
      console.error('Error in TTS handler:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to generate speech' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  },

  /**
   * Handle Cloudflare Speech-to-Text
   */
  async handleCloudflareSpeechToText(request: Request, env: Env, corsHeaders: any): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const formData = await request.formData();
      const audioFile = formData.get('audio') as File;
      
      if (!audioFile) {
        return new Response(
          JSON.stringify({ error: 'Audio file is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Convert audio file to array buffer
      const audioBuffer = await audioFile.arrayBuffer();
      const audioArray = new Uint8Array(audioBuffer);

      try {
        // Use Cloudflare AI for Speech-to-Text
        const response = await env.AI.run('@cf/microsoft/whisper', {
          audio: audioArray
        });

        if (response && response.text) {
          return new Response(
            JSON.stringify({ 
              transcript: response.text,
              confidence: response.confidence || 0.9
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          throw new Error('No transcript generated');
        }
      } catch (aiError) {
        console.error('Cloudflare AI STT error:', aiError);
        
        return new Response(
          JSON.stringify({ 
            fallback: true, 
            message: 'Use browser STT',
            error: 'Cloudflare STT unavailable'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

    } catch (error) {
      console.error('Error in STT handler:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to transcribe speech' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  },

  /**
   * Handle Cloudflare Arabic Speech-to-Text
   */
  async handleCloudflareArabicSTT(request: Request, env: Env, corsHeaders: any): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const formData = await request.formData();
      const audioFile = formData.get('audio') as File;
      const language = formData.get('language') || 'ar';
      
      if (!audioFile) {
        return new Response(
          JSON.stringify({ error: 'Audio file is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Convert audio file to array buffer
      const audioBuffer = await audioFile.arrayBuffer();
      const audioArray = new Uint8Array(audioBuffer);

      try {
        // Use Cloudflare AI for Arabic Speech-to-Text
        const response = await env.AI.run('@cf/microsoft/whisper', {
          audio: audioArray,
          language: 'ar' // Specify Arabic language
        });

        if (response && response.text) {
          return new Response(
            JSON.stringify({ 
              transcript: response.text,
              language: 'ar',
              confidence: response.confidence || 0.9
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          throw new Error('No Arabic transcript generated');
        }
      } catch (aiError) {
        console.error('Cloudflare AI Arabic STT error:', aiError);
        
        return new Response(
          JSON.stringify({ 
            fallback: true, 
            message: 'Use browser STT',
            error: 'Cloudflare Arabic STT unavailable'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

    } catch (error) {
      console.error('Error in Arabic STT handler:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to transcribe Arabic speech' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  },

  /**
   * Handle Cloudflare Translation (Arabic to English)
   */
  async handleCloudflareTranslate(request: Request, env: Env, corsHeaders: any): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const { text, sourceLanguage, targetLanguage } = await request.json();
      
      if (!text) {
        return new Response(
          JSON.stringify({ error: 'Text is required for translation' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        // Use Cloudflare AI for translation
        const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          messages: [{
            role: 'system',
            content: `You are a professional Arabic to English translator. Translate the given Arabic text to natural, fluent English. Only respond with the translation, no explanations or additional text.`
          }, {
            role: 'user',
            content: `Translate this Arabic text to English: "${text}"`
          }]
        });

        if (response && response.response) {
          // Extract just the translation from the response
          let translatedText = response.response.trim();
          
          // Clean up the response to get just the translation
          translatedText = translatedText
            .replace(/^Translation:?\s*/i, '')
            .replace(/^English:?\s*/i, '')
            .replace(/^The translation is:?\s*/i, '')
            .replace(/["""]/g, '"')
            .trim();

          return new Response(
            JSON.stringify({ 
              translatedText,
              sourceLanguage: sourceLanguage || 'ar',
              targetLanguage: targetLanguage || 'en',
              originalText: text
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          throw new Error('No translation generated');
        }
      } catch (aiError) {
        console.error('Cloudflare AI Translation error:', aiError);
        
        // Fallback simple translation for common phrases
        const fallbackTranslations = {
          'مرحبا': 'Hello',
          'شكرا': 'Thank you',
          'كيف حالك': 'How are you',
          'أهلا وسهلا': 'Welcome',
          'مع السلامة': 'Goodbye',
          'صباح الخير': 'Good morning',
          'مساء الخير': 'Good evening',
          'أحبك': 'I love you',
          'نعم': 'Yes',
          'لا': 'No'
        };

        const fallbackTranslation = fallbackTranslations[text.trim()] || `Translation of: ${text}`;

        return new Response(
          JSON.stringify({ 
            translatedText: fallbackTranslation,
            sourceLanguage: sourceLanguage || 'ar',
            targetLanguage: targetLanguage || 'en',
            originalText: text,
            fallback: true
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

    } catch (error) {
      console.error('Error in translation handler:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to translate text' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  },

  /**
   * Handle certificate generation
   */
  async handleCertificateGeneration(request: Request, env: Env, corsHeaders: any): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const { userId, userName, userProgress } = await request.json();
      
      if (!userId || !userName) {
        return new Response(
          JSON.stringify({ error: 'User ID and name are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate user eligibility
      const eligibilityCheck = await this.checkCertificateEligibility(userId, userProgress, env);
      
      if (!eligibilityCheck.eligible) {
        return new Response(
          JSON.stringify({ 
            error: 'User not eligible for certificate', 
            requirements: eligibilityCheck.requirements 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if certificate already saved
      const existingCert = await env.DB.prepare(
        'SELECT * FROM user_certificates WHERE user_id = ? AND is_saved = 1'
      ).bind(userId).first();

      if (existingCert) {
        return new Response(
          JSON.stringify({ error: 'Certificate already saved and cannot be regenerated' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate certificate data
      const credentialId = `SOM-${userId.slice(-6)}-${Date.now().toString().slice(-6)}`;
      const certificateData = {
        userId: userId,
        userName: userName,
        credentialId: credentialId,
        completionDate: new Date().toLocaleDateString('ar-SA'),
        courseName: 'إتقان اللغة الإنجليزية للمبتدئين',
        achievements: {
          lessons: userProgress?.lessons?.completed || 0,
          quizzes: userProgress?.quizzes?.passed || 0,
          finalExamScore: userProgress?.finalExam?.score || 0,
          averageScore: userProgress?.quizzes?.averageScore || 0
        },
        generatedAt: new Date().toISOString()
      };

      // Store certificate generation record
      await env.DB.prepare(`
        INSERT OR REPLACE INTO user_certificates (
          user_id, credential_id, user_name, course_name, completion_date,
          achievements, is_generated, is_saved, generated_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 1, 0, ?, datetime('now'))
      `).bind(
        userId,
        credentialId,
        userName,
        certificateData.courseName,
        certificateData.completionDate,
        JSON.stringify(certificateData.achievements),
        certificateData.generatedAt
      ).run();

      return new Response(
        JSON.stringify({ 
          success: true, 
          certificateData,
          message: 'Certificate generated successfully'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Error generating certificate:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to generate certificate' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  },

  /**
   * Handle certificate save
   */
  async handleCertificateSave(request: Request, env: Env, corsHeaders: any): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const { userId, credentialId } = await request.json();
      
      if (!userId || !credentialId) {
        return new Response(
          JSON.stringify({ error: 'User ID and credential ID are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if certificate exists and is generated
      const certificate = await env.DB.prepare(
        'SELECT * FROM user_certificates WHERE user_id = ? AND credential_id = ? AND is_generated = 1'
      ).bind(userId, credentialId).first();

      if (!certificate) {
        return new Response(
          JSON.stringify({ error: 'Certificate not found or not generated' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (certificate.is_saved) {
        return new Response(
          JSON.stringify({ error: 'Certificate already saved' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Mark certificate as saved
      await env.DB.prepare(
        'UPDATE user_certificates SET is_saved = 1, saved_at = datetime("now") WHERE user_id = ? AND credential_id = ?'
      ).bind(userId, credentialId).run();

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Certificate saved successfully'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Error saving certificate:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save certificate' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  },

  /**
   * Handle certificate download
   */
  async handleCertificateDownload(request: Request, env: Env, corsHeaders: any): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const { userId, credentialId } = await request.json();
      
      if (!userId || !credentialId) {
        return new Response(
          JSON.stringify({ error: 'User ID and credential ID are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if certificate exists and is saved
      const certificate = await env.DB.prepare(
        'SELECT * FROM user_certificates WHERE user_id = ? AND credential_id = ? AND is_saved = 1'
      ).bind(userId, credentialId).first();

      if (!certificate) {
        return new Response(
          JSON.stringify({ error: 'Certificate not found or not saved' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Increment download count
      await env.DB.prepare(
        'UPDATE user_certificates SET download_count = download_count + 1, last_downloaded = datetime("now") WHERE user_id = ? AND credential_id = ?'
      ).bind(userId, credentialId).run();

      return new Response(
        JSON.stringify({ 
          success: true, 
          downloadCount: (certificate.download_count || 0) + 1,
          message: 'Certificate download tracked'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Error tracking certificate download:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to track download' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  },

  /**
   * Handle user progress tracking
   */
  async handleUserProgress(request: Request, env: Env, corsHeaders: any): Promise<Response> {
    if (request.method === 'GET') {
      // Get user progress
      const url = new URL(request.url);
      const userId = url.searchParams.get('userId');
      
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'User ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        const progress = await env.DB.prepare(
          'SELECT * FROM user_learning_progress WHERE user_id = ?'
        ).bind(userId).first();

        return new Response(
          JSON.stringify({ progress }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Error fetching user progress:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch progress' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (request.method === 'POST') {
      // Update user progress
      try {
        const { userId, progressData } = await request.json();
        
        if (!userId || !progressData) {
          return new Response(
            JSON.stringify({ error: 'User ID and progress data are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        await env.DB.prepare(`
          INSERT OR REPLACE INTO user_learning_progress (
            user_id, progress_data, updated_at, created_at
          ) VALUES (?, ?, datetime('now'), datetime('now'))
        `).bind(
          userId,
          JSON.stringify(progressData)
        ).run();

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Progress updated successfully'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (error) {
        console.error('Error updating user progress:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to update progress' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }
  },

  /**
   * Check certificate eligibility
   */
  async checkCertificateEligibility(userId: string, userProgress: any, env: Env): Promise<{ eligible: boolean; requirements: any }> {
    try {
      const requirements = {
        allLessonsCompleted: false,
        allQuizzesPassed: false,
        finalExamPassed: false,
        minimumScoreAchieved: false
      };

      if (userProgress) {
        requirements.allLessonsCompleted = userProgress.lessons?.completed >= 56;
        requirements.allQuizzesPassed = userProgress.quizzes?.passed >= 8;
        requirements.finalExamPassed = userProgress.finalExam?.passed || false;
        requirements.minimumScoreAchieved = (userProgress.quizzes?.averageScore || 0) >= 70;
      }

      const eligible = Object.values(requirements).every(req => req === true);

      return { eligible, requirements };
    } catch (error) {
      console.error('Error checking certificate eligibility:', error);
      return { eligible: false, requirements: {} };
    }
  },

  // External auth/migration removed
};
