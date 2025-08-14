// Additional quiz handler methods for the worker
// These should be added to the main worker index.ts

export const quizHandlerMethods = `
  // Cache quiz for user (regenerate on exit without completion)
  async cacheQuiz(quiz_id: string, user_id: string, quiz: any, env: Env): Promise<void> {
    try {
      await env.DB.prepare(\`
        CREATE TABLE IF NOT EXISTS quiz_cache (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          quiz_id TEXT NOT NULL,
          quiz_data TEXT NOT NULL,
          created_at TEXT NOT NULL,
          expires_at TEXT NOT NULL
        )
      \`).run();

      const cacheKey = \`\${quiz_id}_\${user_id}\`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

      await env.DB.prepare(\`
        INSERT OR REPLACE INTO quiz_cache 
        (id, user_id, quiz_id, quiz_data, created_at, expires_at)
        VALUES (?, ?, ?, ?, ?, ?)
      \`).bind(
        cacheKey,
        user_id,
        quiz_id,
        JSON.stringify(quiz),
        new Date().toISOString(),
        expiresAt
      ).run();

      console.log(\`Quiz cached: \${cacheKey}\`);
    } catch (error) {
      console.error('Error caching quiz:', error);
    }
  },

  // Get cached quiz
  async getCachedQuiz(quiz_id: string, user_id: string, env: Env): Promise<any | null> {
    try {
      const cacheKey = \`\${quiz_id}_\${user_id}\`;
      
      const result = await env.DB.prepare(\`
        SELECT quiz_data, expires_at 
        FROM quiz_cache 
        WHERE id = ? AND expires_at > datetime('now')
      \`).bind(cacheKey).first();

      if (result) {
        console.log(\`Retrieved cached quiz: \${cacheKey}\`);
        return JSON.parse(result.quiz_data);
      }

      return null;
    } catch (error) {
      console.error('Error retrieving cached quiz:', error);
      return null;
    }
  },

  // Handle quiz submission
  async handleSubmitQuiz(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const quizAttempt = await request.json();

      // Validate required fields
      if (!quizAttempt.quiz_id || !quizAttempt.user_id) {
        return new Response(JSON.stringify({ error: 'Quiz ID and User ID are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Save quiz attempt to database
      const savedAttempt = await this.saveQuizAttempt(quizAttempt, env);

      // Clear quiz cache (force regeneration on next attempt if failed)
      if (quizAttempt.result === 'failed') {
        await this.clearQuizCache(quizAttempt.quiz_id, quizAttempt.user_id, env);
      }

      return new Response(JSON.stringify({
        success: true,
        attempt_id: savedAttempt.id,
        result: quizAttempt.result,
        score: quizAttempt.score,
        message: 'Quiz submitted successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Quiz submission error:', error);
      return new Response(JSON.stringify({ error: 'Failed to submit quiz' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },

  // Save quiz attempt to database
  async saveQuizAttempt(attempt: any, env: Env): Promise<any> {
    try {
      // Create quiz_attempts table if not exists
      await env.DB.prepare(\`
        CREATE TABLE IF NOT EXISTS quiz_attempts (
          id TEXT PRIMARY KEY,
          quiz_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          attempt_number INTEGER NOT NULL,
          started_at TEXT NOT NULL,
          completed_at TEXT,
          is_completed BOOLEAN NOT NULL,
          score INTEGER NOT NULL,
          total_possible INTEGER NOT NULL,
          passing_score INTEGER NOT NULL,
          result TEXT NOT NULL,
          answers TEXT NOT NULL,
          time_taken INTEGER
        )
      \`).run();

      // Get next attempt number for this user/quiz
      const attemptCount = await env.DB.prepare(\`
        SELECT COUNT(*) as count 
        FROM quiz_attempts 
        WHERE quiz_id = ? AND user_id = ?
      \`).bind(attempt.quiz_id, attempt.user_id).first();

      const attemptNumber = (attemptCount?.count || 0) + 1;
      const attemptId = \`\${attempt.quiz_id}_\${attempt.user_id}_\${attemptNumber}\`;

      await env.DB.prepare(\`
        INSERT INTO quiz_attempts 
        (id, quiz_id, user_id, attempt_number, started_at, completed_at, is_completed, 
         score, total_possible, passing_score, result, answers, time_taken)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      \`).bind(
        attemptId,
        attempt.quiz_id,
        attempt.user_id,
        attemptNumber,
        attempt.started_at,
        attempt.completed_at,
        attempt.is_completed,
        attempt.score,
        attempt.total_possible,
        attempt.passing_score,
        attempt.result,
        JSON.stringify(attempt.answers),
        attempt.time_taken
      ).run();

      return { ...attempt, id: attemptId, attempt_number: attemptNumber };
    } catch (error) {
      console.error('Error saving quiz attempt:', error);
      throw error;
    }
  },

  // Clear quiz cache (when user exits without completing)
  async clearQuizCache(quiz_id: string, user_id: string, env: Env): Promise<void> {
    try {
      const cacheKey = \`\${quiz_id}_\${user_id}\`;
      
      await env.DB.prepare(\`
        DELETE FROM quiz_cache WHERE id = ?
      \`).bind(cacheKey).run();

      console.log(\`Quiz cache cleared: \${cacheKey}\`);
    } catch (error) {
      console.error('Error clearing quiz cache:', error);
    }
  },

  // Handle pronunciation analysis
  async handleAnalyzePronunciation(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const { target_word, user_pronunciation, user_id } = await request.json();

      if (!target_word || !user_pronunciation) {
        return new Response(JSON.stringify({ error: 'Target word and user pronunciation are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const analysis = await this.analyzePronunciation(target_word, user_pronunciation, env);

      return new Response(JSON.stringify(analysis), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Pronunciation analysis error:', error);
      return new Response(JSON.stringify({ error: 'Failed to analyze pronunciation' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },

  // Analyze pronunciation accuracy
  async analyzePronunciation(target_word: string, user_pronunciation: string, env: Env): Promise<any> {
    try {
      // Use AI to analyze pronunciation
      const prompt = \`
      Analyze the pronunciation accuracy of an English word by an Arabic speaker.

      Target Word: "\${target_word}"
      User Pronunciation (transcribed): "\${user_pronunciation}"

      Calculate pronunciation accuracy as a percentage (0-100).
      Consider:
      1. Phonetic similarity
      2. Common Arabic speaker pronunciation challenges
      3. Syllable stress
      4. Vowel sounds
      5. Consonant clarity

      Return JSON:
      {
        "accuracy": 85.5,
        "feedback": "Good pronunciation with minor vowel issues",
        "feedback_arabic": "نطق جيد مع مشاكل بسيطة في الحروف المتحركة",
        "suggestions": ["Focus on the 'th' sound", "Practice vowel length"],
        "suggestions_arabic": ["ركز على صوت 'th'", "تدرب على طول الحروف المتحركة"]
      }
      \`;

      const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [{
          role: 'user',
          content: prompt
        }],
        max_tokens: 800
      });

      const analysis = JSON.parse(aiResponse.response);
      return analysis;
    } catch (error) {
      console.error('AI pronunciation analysis error:', error);
      
      // Fallback: simple similarity calculation
      const similarity = this.calculateSimpleSimilarity(target_word, user_pronunciation);
      return {
        accuracy: similarity,
        feedback: similarity >= 70 ? 'Good pronunciation' : 'Needs improvement',
        feedback_arabic: similarity >= 70 ? 'نطق جيد' : 'يحتاج تحسين',
        suggestions: ['Practice more', 'Listen to native speakers'],
        suggestions_arabic: ['تدرب أكثر', 'استمع للمتحدثين الأصليين']
      };
    }
  },

  // Simple similarity calculation fallback
  calculateSimpleSimilarity(target: string, spoken: string): number {
    const targetClean = target.toLowerCase().replace(/[^a-z]/g, '');
    const spokenClean = spoken.toLowerCase().replace(/[^a-z]/g, '');
    
    let matches = 0;
    const maxLength = Math.max(targetClean.length, spokenClean.length);
    
    for (let i = 0; i < Math.min(targetClean.length, spokenClean.length); i++) {
      if (targetClean[i] === spokenClean[i]) {
        matches++;
      }
    }
    
    return Math.min((matches / maxLength) * 100, 100);
  }
`;
