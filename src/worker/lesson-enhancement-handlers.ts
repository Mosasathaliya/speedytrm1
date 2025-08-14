// Additional handler methods for lesson enhancement system
// These methods should be added to the main worker index.ts

export const lessonEnhancementHandlers = {
  // Handle save lesson to RAG endpoint
  async handleSaveLessonToRAG(request: Request, env: any, corsHeaders: Record<string, string>): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const { lessonKey, lesson, topic, userLevel } = await request.json();

      if (!lessonKey || !lesson) {
        return new Response(JSON.stringify({ error: 'Lesson key and lesson content are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      await this.saveLessonToRAG(lessonKey, lesson, topic, userLevel, env);

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Lesson saved to RAG successfully',
        lessonKey: lessonKey
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Save lesson to RAG error:', error);
      return new Response(JSON.stringify({ error: 'Failed to save lesson to RAG' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },

  // Handle get cached lesson endpoint
  async handleGetCachedLesson(request: Request, env: any, corsHeaders: Record<string, string>): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const { topic, userLevel, lessonNumber } = await request.json();

      if (!topic) {
        return new Response(JSON.stringify({ error: 'Topic is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const lessonKey = this.generateLessonKey(topic, userLevel || 'beginner', lessonNumber);
      const cachedLesson = await this.getCachedLessonFromRAG(lessonKey, env);

      if (cachedLesson) {
        return new Response(JSON.stringify({
          found: true,
          lesson: cachedLesson,
          lessonKey: lessonKey
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({
          found: false,
          message: 'Lesson not found in cache'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      console.error('Get cached lesson error:', error);
      return new Response(JSON.stringify({ error: 'Failed to retrieve cached lesson' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },

  // Handle enhance lesson based on user interactions
  async handleEnhanceLesson(request: Request, env: any, corsHeaders: Record<string, string>): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const { 
        lessonKey, 
        userQuestion, 
        tutorResponse, 
        questionFrequency = 1,
        isCommonGap = false 
      } = await request.json();

      if (!lessonKey || !userQuestion) {
        return new Response(JSON.stringify({ error: 'Lesson key and user question are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const enhancement = await this.enhanceLessonBasedOnInteraction(
        lessonKey, 
        userQuestion, 
        tutorResponse, 
        questionFrequency,
        isCommonGap,
        env
      );

      return new Response(JSON.stringify(enhancement), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Enhance lesson error:', error);
      return new Response(JSON.stringify({ error: 'Failed to enhance lesson' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },

  // Enhance lesson based on user tutor interactions
  async enhanceLessonBasedOnInteraction(
    lessonKey: string,
    userQuestion: string,
    tutorResponse: string,
    questionFrequency: number,
    isCommonGap: boolean,
    env: any
  ): Promise<any> {
    try {
      // Get current lesson
      const cachedLesson = await this.getCachedLessonFromRAG(lessonKey, env);
      if (!cachedLesson) {
        return { error: 'Lesson not found for enhancement' };
      }

      // Track the question and interaction
      await this.trackUserInteraction(lessonKey, userQuestion, tutorResponse, questionFrequency, env);

      // Check if enhancement is needed based on criteria
      const shouldEnhance = await this.shouldEnhanceLesson(lessonKey, userQuestion, questionFrequency, isCommonGap, env);

      if (!shouldEnhance.enhance) {
        return {
          enhanced: false,
          reason: shouldEnhance.reason,
          questionTracked: true
        };
      }

      // Generate enhancement using AI
      const enhancementPrompt = `
        You are enhancing an existing English lesson based on user questions and interactions.
        
        Original Lesson Title: ${cachedLesson.title_english}
        Original Explanation: ${cachedLesson.explanation_english}
        
        User Question: "${userQuestion}"
        Question Frequency: ${questionFrequency} (how many users asked similar questions)
        Is Common Knowledge Gap: ${isCommonGap}
        
        Enhancement Instructions:
        1. Add content that addresses the user's question
        2. Improve the original explanation to prevent this confusion
        3. Add examples that clarify the concept the user was confused about
        4. Keep the original structure but enhance with new insights
        5. Respond in Arabic for explanations, English for examples
        
        Return enhanced lesson in the same JSON format as the original lesson but with improvements.
        Mark clearly what sections were enhanced.
      `;

      const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [{
          role: 'user',
          content: enhancementPrompt
        }],
        max_tokens: 2000
      });

      const enhancedLesson = JSON.parse(aiResponse.response);

      // Save enhanced lesson back to RAG
      await this.saveLessonToRAG(lessonKey, enhancedLesson, cachedLesson.title_english, 'enhanced', env);

      // Log the enhancement
      await this.logLessonEnhancement(lessonKey, userQuestion, 'ai_enhanced', env);

      return {
        enhanced: true,
        enhancedLesson: enhancedLesson,
        enhancementReason: shouldEnhance.reason,
        originalPreserved: true
      };

    } catch (error) {
      console.error('Lesson enhancement error:', error);
      return { error: 'Failed to enhance lesson', details: error.message };
    }
  },

  // Track user interactions for lesson improvement
  async trackUserInteraction(
    lessonKey: string, 
    userQuestion: string, 
    tutorResponse: string, 
    frequency: number, 
    env: any
  ): Promise<void> {
    try {
      await env.DB.prepare(`
        INSERT INTO user_interactions 
        (lesson_key, user_question, tutor_response, frequency, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).bind(
        lessonKey,
        userQuestion,
        tutorResponse,
        frequency,
        new Date().toISOString()
      ).run();
    } catch (error) {
      console.error('Error tracking user interaction:', error);
    }
  },

  // Determine if lesson should be enhanced
  async shouldEnhanceLesson(
    lessonKey: string, 
    userQuestion: string, 
    frequency: number, 
    isCommonGap: boolean, 
    env: any
  ): Promise<{enhance: boolean, reason: string}> {
    try {
      // Get interaction statistics
      const stats = await env.DB.prepare(`
        SELECT COUNT(*) as total_questions,
               COUNT(DISTINCT user_question) as unique_questions
        FROM user_interactions 
        WHERE lesson_key = ?
      `).bind(lessonKey).first();

      // Enhancement criteria
      if (isCommonGap) {
        return { enhance: true, reason: 'Common knowledge gap identified' };
      }

      if (frequency >= 3) {
        return { enhance: true, reason: 'Multiple users asked similar question' };
      }

      if (stats && stats.unique_questions >= 5) {
        return { enhance: true, reason: 'Many different questions indicate lesson gaps' };
      }

      if (stats && stats.total_questions >= 10) {
        return { enhance: true, reason: 'High question volume indicates need for clarity' };
      }

      return { enhance: false, reason: 'Enhancement criteria not met yet' };

    } catch (error) {
      console.error('Error checking enhancement criteria:', error);
      return { enhance: false, reason: 'Error evaluating enhancement need' };
    }
  },

  // Log lesson enhancement for tracking
  async logLessonEnhancement(lessonKey: string, trigger: string, method: string, env: any): Promise<void> {
    try {
      await env.DB.prepare(`
        INSERT INTO lesson_enhancements 
        (lesson_key, enhancement_trigger, enhancement_method, created_at)
        VALUES (?, ?, ?, ?)
      `).bind(
        lessonKey,
        trigger,
        method,
        new Date().toISOString()
      ).run();

      // Update lesson improvement score
      await env.DB.prepare(`
        UPDATE cached_lessons 
        SET improvement_score = improvement_score + 0.1 
        WHERE lesson_key = ?
      `).bind(lessonKey).run();

    } catch (error) {
      console.error('Error logging lesson enhancement:', error);
    }
  }
};
