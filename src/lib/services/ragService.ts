/**
 * RAG Service for Speed of Mastery English Learning App
 * Provides intelligent lesson retrieval and AI-powered learning assistance
 */

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
  relevantChunks: LessonChunk[];
  suggestedLessons: number[];
  confidence: number;
  response: string;
}

export interface LearningRecommendation {
  lesson_id: number;
  title: string;
  reason: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_time: string;
}

export class RAGService {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Search for relevant lesson content based on user query
   */
  async searchLessons(query: string, language: 'ar' | 'en' = 'ar'): Promise<RAGResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          query,
          language,
          max_results: 5
        })
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('RAG search failed:', error);
      return this.getFallbackResponse(query);
    }
  }

  /**
   * Get personalized learning recommendations
   */
  async getLearningRecommendations(
    userLevel: 'beginner' | 'intermediate' | 'advanced',
    completedLessons: number[],
    interests: string[]
  ): Promise<LearningRecommendation[]> {
    try {
      const response = await fetch(`${this.baseUrl}/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          user_level: userLevel,
          completed_lessons: completedLessons,
          interests,
          max_recommendations: 10
        })
      });

      if (!response.ok) {
        throw new Error(`Recommendations failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      return this.getFallbackRecommendations(userLevel);
    }
  }

  /**
   * Get contextual help for specific lesson
   */
  async getLessonHelp(
    lessonId: number,
    userQuestion: string,
    context: string
  ): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/lesson-help`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          lesson_id: lessonId,
          question: userQuestion,
          context,
          language: 'ar'
        })
      });

      if (!response.ok) {
        throw new Error(`Lesson help failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.help_text;
    } catch (error) {
      console.error('Failed to get lesson help:', error);
      return 'عذراً، لا يمكنني تقديم المساعدة في الوقت الحالي. يرجى المحاولة مرة أخرى لاحقاً.';
    }
  }

  /**
   * Practice conversation with AI tutor
   */
  async practiceConversation(
    topic: string,
    userLevel: 'beginner' | 'intermediate' | 'advanced',
    language: 'ar' | 'en' = 'ar'
  ): Promise<{
    conversation: string;
    corrections: string[];
    suggestions: string[];
    next_topics: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          topic,
          user_level: userLevel,
          language,
          max_turns: 10
        })
      });

      if (!response.ok) {
        throw new Error(`Conversation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to start conversation:', error);
      return {
        conversation: 'عذراً، لا يمكنني بدء المحادثة في الوقت الحالي.',
        corrections: [],
        suggestions: [],
        next_topics: []
      };
    }
  }

  /**
   * Get grammar explanations in Arabic
   */
  async getGrammarExplanation(
    grammarTopic: string,
    examples: string[],
    userLevel: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<{
    explanation: string;
    examples: string[];
    practice_exercises: string[];
    common_mistakes: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/grammar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          topic: grammarTopic,
          examples,
          user_level: userLevel,
          language: 'ar'
        })
      });

      if (!response.ok) {
        throw new Error(`Grammar explanation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get grammar explanation:', error);
      return {
        explanation: 'عذراً، لا يمكنني تقديم شرح القواعد في الوقت الحالي.',
        examples: [],
        practice_exercises: [],
        common_mistakes: []
      };
    }
  }

  /**
   * Get vocabulary practice exercises
   */
  async getVocabularyExercises(
    topic: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    exerciseType: 'matching' | 'fill-blank' | 'translation' | 'sentence-building'
  ): Promise<{
    exercises: Array<{
      id: string;
      type: string;
      question: string;
      options?: string[];
      correct_answer: string;
      explanation: string;
    }>;
    topic_vocabulary: string[];
    difficulty_level: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/vocabulary-exercises`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          topic,
          difficulty,
          exercise_type: exerciseType,
          max_exercises: 10
        })
      });

      if (!response.ok) {
        throw new Error(`Vocabulary exercises failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get vocabulary exercises:', error);
      return {
        exercises: [],
        topic_vocabulary: [],
        difficulty_level: difficulty
      };
    }
  }

  /**
   * Get pronunciation guidance
   */
  async getPronunciationHelp(
    word: string,
    phonetic: string,
    audioUrl?: string
  ): Promise<{
    pronunciation: string;
    phonetic_spelling: string;
    similar_words: string[];
    practice_sentences: string[];
    tips: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/pronunciation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          word,
          phonetic,
          audio_url: audioUrl
        })
      });

      if (!response.ok) {
        throw new Error(`Pronunciation help failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get pronunciation help:', error);
      return {
        pronunciation: word,
        phonetic_spelling: phonetic,
        similar_words: [],
        practice_sentences: [],
        tips: []
      };
    }
  }

  /**
   * Fallback response when RAG system is unavailable
   */
  private getFallbackResponse(query: string): RAGResponse {
    return {
      query,
      relevantChunks: [],
      suggestedLessons: [1, 2, 3], // Basic lessons
      confidence: 0.5,
      response: 'عذراً، النظام غير متاح حالياً. يرجى المحاولة مرة أخرى لاحقاً.'
    };
  }

  /**
   * Fallback recommendations when RAG system is unavailable
   */
  private getFallbackRecommendations(userLevel: 'beginner' | 'intermediate' | 'advanced'): LearningRecommendation[] {
    const beginnerLessons = [
      { lesson_id: 1, title: 'مقدمة في اللغة الإنجليزية', reason: 'أساسيات مهمة للمبتدئين', difficulty: 'beginner' as const, estimated_time: '10 دقائق' },
      { lesson_id: 2, title: 'الأبجدية الإنجليزية', reason: 'تعلم الحروف والنطق', difficulty: 'beginner' as const, estimated_time: '30 دقيقة' },
      { lesson_id: 5, title: 'الأرقام والألوان', reason: 'مفردات أساسية للتواصل', difficulty: 'beginner' as const, estimated_time: '20 دقيقة' }
    ];

    const intermediateLessons = [
      { lesson_id: 21, title: 'الضمائر', reason: 'قواعد مهمة للجمل', difficulty: 'intermediate' as const, estimated_time: '50 دقيقة' },
      { lesson_id: 22, title: 'زمن المضارع البسيط', reason: 'أساسيات الأزمنة', difficulty: 'intermediate' as const, estimated_time: '40 دقيقة' },
      { lesson_id: 25, title: 'حروف الجر المكانية', reason: 'تحسين دقة التعبير', difficulty: 'intermediate' as const, estimated_time: '20 دقيقة' }
    ];

    const advancedLessons = [
      { lesson_id: 47, title: 'الأفعال المساعدة', reason: 'قواعد متقدمة', difficulty: 'advanced' as const, estimated_time: '20 دقيقة' },
      { lesson_id: 49, title: 'تكوين الكلمات: البادئات', reason: 'توسيع المفردات', difficulty: 'advanced' as const, estimated_time: '20 دقيقة' },
      { lesson_id: 53, title: 'الماضي المستمر', reason: 'أزمنة متقدمة', difficulty: 'advanced' as const, estimated_time: '20 دقيقة' }
    ];

    switch (userLevel) {
      case 'beginner':
        return beginnerLessons;
      case 'intermediate':
        return intermediateLessons;
      case 'advanced':
        return advancedLessons;
      default:
        return beginnerLessons;
    }
  }

  /**
   * Check RAG system health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('RAG system health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const ragService = new RAGService(
  process.env.RAG_API_URL || 'http://localhost:8000',
  process.env.RAG_API_KEY || 'demo-key'
);
