/**
 * User Content Handlers for Speed of Mastery
 * Handles personalized content generation for each user
 */

export interface UserContentItem {
  id: string;
  type: 'lesson' | 'game' | 'story' | 'quiz' | 'exam';
  title: string;
  content: any;
  order: number;
  dependencies: string[];
  user_id: string;
  generated_at: string;
  accessed_at?: string;
  completed_at?: string;
  is_locked: boolean;
}

export interface UserLearningContext {
  user_id: string;
  completed_items: string[];
  weak_areas: string[];
  strong_areas: string[];
  learning_style: 'interactive' | 'narrative' | 'structured';
  total_score: number;
  quiz_attempts: number;
  ai_interactions: number;
}

/**
 * Generate personalized content for a user
 */
export async function generateUserContent(
  itemId: string,
  type: string,
  userId: string,
  context: UserLearningContext,
  env: any
): Promise<UserContentItem> {
  
  switch (type) {
    case 'lesson':
      return generatePersonalizedLesson(itemId, userId, context, env);
    case 'game':
      return generatePersonalizedGame(itemId, userId, context, env);
    case 'story':
      return generatePersonalizedStory(itemId, userId, context, env);
    case 'quiz':
      return generatePersonalizedQuiz(itemId, userId, context, env);
    default:
      throw new Error(`Unsupported content type: ${type}`);
  }
}

/**
 * Generate a personalized lesson
 */
async function generatePersonalizedLesson(
  itemId: string,
  userId: string,
  context: UserLearningContext,
  env: any
): Promise<UserContentItem> {
  
  // Create basic lesson structure
  const lesson: UserContentItem = {
    id: itemId,
    type: 'lesson',
    title: `Lesson ${itemId.split('-')[1] || '1'}`,
    content: {
      title_ar: `الدرس ${itemId.split('-')[1] || '1'}`,
      title_en: `Lesson ${itemId.split('-')[1] || '1'}`,
      description_ar: 'درس مخصص لتعلم اللغة الإنجليزية',
      description_en: 'Personalized English learning lesson',
      examples: [],
      exercises: [],
      vocabulary: []
    },
    order: parseInt(itemId.split('-')[1] || '1'),
    dependencies: [],
    user_id: userId,
    generated_at: new Date().toISOString(),
    is_locked: false
  };

  return lesson;
}

/**
 * Generate a personalized game
 */
async function generatePersonalizedGame(
  itemId: string,
  userId: string,
  context: UserLearningContext,
  env: any
): Promise<UserContentItem> {
  
  const game: UserContentItem = {
    id: itemId,
    type: 'game',
    title: `Game ${itemId.split('-')[1] || '1'}`,
    content: {
      game_type: 'vocabulary_match',
      title_ar: `لعبة ${itemId.split('-')[1] || '1'}`,
      title_en: `Game ${itemId.split('-')[1] || '1'}`,
      instructions_ar: 'اختر الترجمة الصحيحة لكل كلمة',
      instructions_en: 'Choose the correct translation for each word',
      questions: [],
      scoring: { correct: 10, incorrect: -2 }
    },
    order: parseInt(itemId.split('-')[1] || '1'),
    dependencies: [],
    user_id: userId,
    generated_at: new Date().toISOString(),
    is_locked: false
  };

  return game;
}

/**
 * Generate a personalized story
 */
async function generatePersonalizedStory(
  itemId: string,
  userId: string,
  context: UserLearningContext,
  env: any
): Promise<UserContentItem> {
  
  const story: UserContentItem = {
    id: itemId,
    type: 'story',
    title: `Story ${itemId.split('-')[1] || '1'}`,
    content: {
      title_ar: `قصة ${itemId.split('-')[1] || '1'}`,
      title_en: `Story ${itemId.split('-')[1] || '1'}`,
      content: 'A personalized English story for learning',
      vocabulary: [],
      questions: []
    },
    order: parseInt(itemId.split('-')[1] || '1'),
    dependencies: [],
    user_id: userId,
    generated_at: new Date().toISOString(),
    is_locked: false
  };

  return story;
}

/**
 * Generate a personalized quiz
 */
async function generatePersonalizedQuiz(
  itemId: string,
  userId: string,
  context: UserLearningContext,
  env: any
): Promise<UserContentItem> {
  
  const quiz: UserContentItem = {
    id: itemId,
    type: 'quiz',
    title: `Quiz ${itemId.split('-')[1] || '1'}`,
    content: {
      title_ar: `اختبار ${itemId.split('-')[1] || '1'}`,
      title_en: `Quiz ${itemId.split('-')[1] || '1'}`,
      questions: [],
      passing_score: 70,
      time_limit: 1800 // 30 minutes
    },
    order: parseInt(itemId.split('-')[1] || '1'),
    dependencies: [],
    user_id: userId,
    generated_at: new Date().toISOString(),
    is_locked: false
  };

  return quiz;
}

/**
 * Get user learning context from database
 */
export async function getUserLearningContext(userId: string, env: any): Promise<UserLearningContext> {
  try {
    const progressData = await env.DB.prepare(
      'SELECT progress_data FROM user_learning_progress WHERE user_id = ?'
    ).bind(userId).first();

    if (progressData) {
      const progress = JSON.parse(progressData.progress_data);
      return {
        user_id: userId,
        completed_items: progress.lessons?.list || [],
        weak_areas: progress.weakAreas || [],
        strong_areas: progress.strongAreas || [],
        learning_style: progress.learningStyle || 'structured',
        total_score: progress.quizzes?.averageScore || 0,
        quiz_attempts: progress.quizzes?.completed || 0,
        ai_interactions: progress.aiInteractions?.personalAI?.sessions || 0
      };
    }

    return {
      user_id: userId,
      completed_items: [],
      weak_areas: [],
      strong_areas: [],
      learning_style: 'structured',
      total_score: 0,
      quiz_attempts: 0,
      ai_interactions: 0
    };
  } catch (error) {
    console.error('Error getting user learning context:', error);
    return {
      user_id: userId,
      completed_items: [],
      weak_areas: [],
      strong_areas: [],
      learning_style: 'structured',
      total_score: 0,
      quiz_attempts: 0,
      ai_interactions: 0
    };
  }
}

/**
 * Cache generated content to database
 */
export async function cacheUserContent(
  content: UserContentItem,
  env: any
): Promise<void> {
  try {
    await env.DB.prepare(`
      INSERT OR REPLACE INTO user_generated_content 
      (item_id, user_id, content_type, content_data, generated_at, is_locked)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      content.id,
      content.user_id,
      content.type,
      JSON.stringify(content),
      content.generated_at,
      content.is_locked ? 1 : 0
    ).run();
  } catch (error) {
    console.error('Error caching user content:', error);
  }
}

/**
 * Get cached content for user
 */
export async function getCachedUserContent(
  itemId: string,
  userId: string,
  env: any
): Promise<UserContentItem | null> {
  try {
    const result = await env.DB.prepare(
      'SELECT content_data FROM user_generated_content WHERE item_id = ? AND user_id = ?'
    ).bind(itemId, userId).first();

    if (result) {
      return JSON.parse(result.content_data);
    }
    return null;
  } catch (error) {
    console.error('Error getting cached user content:', error);
    return null;
  }
}
