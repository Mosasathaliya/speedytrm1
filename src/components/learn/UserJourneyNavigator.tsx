'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  Lock, 
  CheckCircle, 
  Play,
  Trophy,
  BookOpen,
  Gamepad2,
  Target,
  Star,
  RotateCcw,
  Home
} from 'lucide-react';
import type { 
  NavigableItem, 
  UserProgress,
  NavigationState,
  UserGeneratedContent 
} from '@/types/user-content';
import AILessonCard from './AILessonCard';
import QuizComponent from './QuizComponent';
import { GAME_COMPONENTS } from './games';
import type { AssessmentResult, Quiz } from '@/types/assessment';

interface UserJourneyNavigatorProps {
  userId: string;
  onProgressUpdate?: (progress: UserProgress) => void;
}

const UserJourneyNavigator: React.FC<UserJourneyNavigatorProps> = ({
  userId,
  onProgressUpdate
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [journeyItems, setJourneyItems] = useState<NavigableItem[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [navigationState, setNavigationState] = useState<NavigationState | null>(null);
  const [currentContent, setCurrentContent] = useState<UserGeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentItem = journeyItems[currentIndex];

  // Initialize user journey
  useEffect(() => {
    initializeUserJourney();
  }, [userId]);

  // Load current item content when index changes
  useEffect(() => {
    if (currentItem && !isLoading) {
      loadCurrentItemContent();
    }
  }, [currentIndex, currentItem]);

  const initializeUserJourney = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get user's journey state
      const response = await fetch('/api/user-journey/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          action: 'get_journey'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to load user journey');
      }

      const data = await response.json();
      
      if (data.success) {
        setUserProgress(data.progress);
        setCurrentIndex(data.progress.current_item_index);
        // Generate journey items (100 items total)
        setJourneyItems(generateJourneyItems(data.progress));
        setNavigationState(data.navigation_state);
      } else {
        throw new Error(data.message || 'Failed to initialize journey');
      }
    } catch (error) {
      console.error('Error initializing user journey:', error);
      setError(error instanceof Error ? error.message : 'Failed to load journey');
    } finally {
      setIsLoading(false);
    }
  };

  const generateJourneyItems = (progress: UserProgress): NavigableItem[] => {
    const items: NavigableItem[] = [];
    
    // Generate 100 items (91 learning + 8 quizzes + 1 final exam)
    for (let i = 0; i < 100; i++) {
      const itemId = `item-${i + 1}`;
      let type: 'lesson' | 'game' | 'quiz' = 'lesson';
      let title = `Lesson ${i + 1}`;
      let titleAr = `الدرس ${i + 1}`;
      
      // Determine item type based on position
      if ([11, 23, 34, 45, 56, 67, 78, 89].includes(i + 1)) {
        type = 'quiz';
        const quizNum = [11, 23, 34, 45, 56, 67, 78, 89].indexOf(i + 1) + 1;
        title = `Progress Quiz ${quizNum}`;
        titleAr = `اختبار التقدم ${quizNum}`;
      } else if (i === 99) { // Final exam
        type = 'quiz';
        title = 'Final Comprehensive Exam';
        titleAr = 'الامتحان النهائي الشامل';
      } else if (i % 3 === 2) { // Every 3rd item is a game
        type = 'game';
        const gameNum = Math.floor(i / 3) + 1;
        title = `Interactive Game ${gameNum}`;
        titleAr = `لعبة تفاعلية ${gameNum}`;
      }

      const isCompleted = progress.completed_items?.includes(itemId) || false;
      const isLocked = type === 'quiz' && progress.passed_quizzes?.includes(itemId) || false;
      const isAccessible = i <= (progress.current_item_index + 1); // Can access current + 1 ahead

      items.push({
        id: itemId,
        type,
        index: i,
        title,
        title_ar: titleAr,
        description: `${type} content for item ${i + 1}`,
        description_ar: `محتوى ${type === 'lesson' ? 'الدرس' : type === 'game' ? 'اللعبة' : 'الاختبار'} للعنصر ${i + 1}`,
        is_generated: true,
        is_accessible: isAccessible,
        is_completed: isCompleted,
        is_locked: isLocked,
        lock_reason: isLocked ? 'Quiz already passed' : undefined,
        prerequisites: i > 0 ? [`item-${i}`] : [],
        navigation: {
          canGoNext: i < 99,
          canGoPrevious: i > 0,
          nextItemId: i < 99 ? `item-${i + 2}` : undefined,
          previousItemId: i > 0 ? `item-${i}` : undefined
        }
      });
    }

    return items;
  };

  const loadCurrentItemContent = async () => {
    if (!currentItem || currentItem.is_locked) {
      setCurrentContent(null);
      return;
    }

    try {
      setIsLoading(true);

      // Check if user already has generated content for this item
      const getResponse = await fetch(`/api/user-content/get?user_id=${userId}&item_id=${currentItem.id}`);
      
      if (getResponse.ok) {
        const getData = await getResponse.json();
        if (getData.success && getData.content) {
          setCurrentContent(getData.content);
          return;
        }
      }

      // Generate new content for this item
      const generateResponse = await fetch('/api/user-content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          item_id: currentItem.id,
          content_type: currentItem.type,
          item_metadata: {
            title: currentItem.title,
            index: currentItem.index,
            type: currentItem.type
          }
        })
      });

      if (!generateResponse.ok) {
        throw new Error('Failed to generate content');
      }

      const generateData = await generateResponse.json();
      
      if (generateData.success) {
        setCurrentContent(generateData.content);
      } else {
        throw new Error(generateData.message || 'Content generation failed');
      }
    } catch (error) {
      console.error('Error loading item content:', error);
      setError(error instanceof Error ? error.message : 'Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  const navigate = async (direction: 'next' | 'previous') => {
    if (!navigationState || isNavigating) return;

    if (direction === 'next' && !navigationState.canGoNext) return;
    if (direction === 'previous' && !navigationState.canGoPrevious) return;

    try {
      setIsNavigating(true);
      setError(null);

      const response = await fetch('/api/user-journey/navigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          direction,
          current_index: currentIndex
        })
      });

      if (!response.ok) {
        throw new Error('Navigation failed');
      }

      const data = await response.json();
      
      if (data.success) {
        setCurrentIndex(data.new_index);
        setNavigationState(data.navigation_state);
        
        // Update user progress if provided
        if (data.progress_updated && onProgressUpdate) {
          // Re-fetch progress
          const progressResponse = await fetch('/api/user-journey/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: userId,
              action: 'get_progress'
            })
          });
          
          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            if (progressData.success) {
              setUserProgress(progressData.progress);
              onProgressUpdate(progressData.progress);
            }
          }
        }
      } else {
        if (data.blocked) {
          setError(data.message);
        } else {
          throw new Error(data.message || 'Navigation failed');
        }
      }
    } catch (error) {
      console.error('Navigation error:', error);
      setError(error instanceof Error ? error.message : 'Navigation failed');
    } finally {
      setIsNavigating(false);
    }
  };

  const handleItemComplete = async (completionData?: any) => {
    if (!currentItem || !userProgress) return;

    try {
      const response = await fetch('/api/user-journey/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          item_id: currentItem.id,
          action: 'complete',
          data: completionData || { score: 100, completed_at: new Date().toISOString() }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update local state
          const updatedItems = journeyItems.map(item => 
            item.id === currentItem.id 
              ? { ...item, is_completed: true }
              : item
          );
          setJourneyItems(updatedItems);

          // Auto-navigate to next item if available
          if (navigationState?.canGoNext) {
            setTimeout(() => navigate('next'), 1000);
          }
        }
      }
    } catch (error) {
      console.error('Error marking item complete:', error);
    }
  };

  const handleQuizComplete = async (result: AssessmentResult) => {
    if (!currentItem) return;

    try {
      const action = result.result === 'failed' ? 'fail_quiz' : 'pass_quiz';
      
      const response = await fetch('/api/user-journey/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          item_id: currentItem.id,
          action,
          data: { 
            score: result.score, 
            result: result.result,
            completed_at: new Date().toISOString()
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // If quiz passed, lock it and update items
          if (result.result !== 'failed') {
            const updatedItems = journeyItems.map(item => 
              item.id === currentItem.id 
                ? { ...item, is_completed: true, is_locked: true, lock_reason: 'Quiz passed' }
                : item
            );
            setJourneyItems(updatedItems);
          }
        }
      }

      setShowQuiz(false);
      setCurrentQuiz(null);
    } catch (error) {
      console.error('Error handling quiz completion:', error);
    }
  };

  const startQuiz = async () => {
    if (!currentItem || !currentContent) return;

    try {
      // Generate quiz content
      const response = await fetch('/api/assessment/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz_id: currentItem.id,
          quiz_type: currentItem.id === 'item-100' ? 'final' : 'regular',
          user_id: userId,
          user_learning_data: userProgress
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCurrentQuiz(data.quiz);
          setShowQuiz(true);
        }
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
    }
  };

  const renderCurrentItem = () => {
    if (isLoading) {
      return (
        <Card className="text-center p-8">
          <CardContent>
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading content...</p>
          </CardContent>
        </Card>
      );
    }

    if (!currentItem) {
      return (
        <Card className="text-center p-8">
          <CardContent>
            <p>No item found</p>
          </CardContent>
        </Card>
      );
    }

    if (currentItem.is_locked) {
      return (
        <Card className="text-center p-8 border-orange-200 bg-orange-50">
          <CardContent>
            <Lock className="h-16 w-16 mx-auto mb-4 text-orange-500" />
            <h3 className="text-xl font-semibold mb-2">{currentItem.title}</h3>
            <p className="text-muted-foreground mb-2">{currentItem.lock_reason}</p>
            <p className="text-sm font-arabic text-muted-foreground" dir="rtl">
              هذا الاختبار مكتمل ومغلق
            </p>
            <Badge variant="secondary" className="mt-4">
              <CheckCircle className="h-4 w-4 mr-1" />
              Completed & Locked
            </Badge>
          </CardContent>
        </Card>
      );
    }

    if (!currentItem.is_accessible) {
      return (
        <Card className="text-center p-8 border-gray-200 bg-gray-50">
          <CardContent>
            <Lock className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">{currentItem.title}</h3>
            <p className="text-muted-foreground">Complete previous items to unlock</p>
            <p className="text-sm font-arabic text-muted-foreground" dir="rtl">
              أكمل العناصر السابقة لإلغاء القفل
            </p>
          </CardContent>
        </Card>
      );
    }

    if (currentItem.type === 'quiz') {
      if (showQuiz && currentQuiz) {
        return (
          <QuizComponent
            quiz={currentQuiz}
            userId={userId}
            onQuizComplete={handleQuizComplete}
            onExit={() => setShowQuiz(false)}
          />
        );
      }

      return (
        <Card className="text-center p-8">
          <CardContent>
            <Target className="h-16 w-16 mx-auto mb-4 text-blue-500" />
            <h3 className="text-xl font-semibold mb-2">{currentItem.title}</h3>
            <p className="text-muted-foreground mb-2">{currentItem.description}</p>
            <p className="text-sm font-arabic text-muted-foreground mb-4" dir="rtl">
              {currentItem.description_ar}
            </p>
            
            {currentItem.is_completed ? (
              <Badge variant="secondary" className="mb-4">
                <CheckCircle className="h-4 w-4 mr-1" />
                Completed
              </Badge>
            ) : (
              <Button onClick={startQuiz} size="lg">
                <Play className="mr-2 h-5 w-5" />
                Start {currentItem.id === 'item-100' ? 'Final Exam' : 'Quiz'}
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }

    if (currentItem.type === 'lesson') {
      return (
        <AILessonCard
          topic={currentItem.title}
          userLevel="beginner"
          lessonNumber={currentItem.index + 1}
          lessonId={currentItem.id}
          onLessonGenerated={(lesson) => {
            console.log('Lesson generated:', lesson);
          }}
          onComplete={handleItemComplete}
        />
      );
    }

    if (currentItem.type === 'game' && currentContent) {
      // Determine game type and render appropriate component
      const gameType = currentContent.content_data.gameType || 'vocabulary';
      const GameComponent = GAME_COMPONENTS[gameType];
      
      if (GameComponent) {
        return (
          <GameComponent
            gameData={currentContent.content_data}
            onComplete={handleItemComplete}
          />
        );
      }
    }

    return (
      <Card className="text-center p-8">
        <CardContent>
          <Gamepad2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
          <h3 className="text-xl font-semibold mb-2">{currentItem.title}</h3>
          <p className="text-muted-foreground">Game content loading...</p>
        </CardContent>
      </Card>
    );
  };

  if (error) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center p-8">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="h-16 w-16 mx-auto mb-2" />
            <h3 className="text-xl font-semibold">Error</h3>
            <p>{error}</p>
          </div>
          <Button onClick={initializeUserJourney}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                Learning Journey
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Item {currentIndex + 1} of 100 • {userProgress?.completed_items?.length || 0} completed
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{userProgress?.total_score || 0}</p>
              <p className="text-sm text-muted-foreground">Total Score</p>
            </div>
          </div>
          <Progress 
            value={((userProgress?.completed_items?.length || 0) / 100) * 100} 
            className="w-full h-2"
          />
        </CardHeader>
      </Card>

      {/* Navigation Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('previous')}
              disabled={!navigationState?.canGoPrevious || isNavigating}
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              Previous
            </Button>

            <div className="text-center">
              <Badge variant="outline" className="text-lg px-4 py-2">
                {currentItem?.type === 'lesson' && <BookOpen className="mr-2 h-4 w-4" />}
                {currentItem?.type === 'game' && <Gamepad2 className="mr-2 h-4 w-4" />}
                {currentItem?.type === 'quiz' && <Target className="mr-2 h-4 w-4" />}
                {currentItem?.title}
              </Badge>
              {currentItem?.is_completed && (
                <div className="mt-2">
                  <Badge variant="secondary">
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Completed
                  </Badge>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('next')}
              disabled={!navigationState?.canGoNext || isNavigating}
            >
              Next
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Item Content */}
      {renderCurrentItem()}

      {/* Mini Progress Map */}
      <Card>
        <CardHeader>
          <CardTitle>Journey Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-2">
            {journeyItems.slice(Math.max(0, currentIndex - 5), currentIndex + 15).map((item, index) => {
              const actualIndex = Math.max(0, currentIndex - 5) + index;
              const isCurrent = actualIndex === currentIndex;
              
              return (
                <div
                  key={item.id}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                    ${isCurrent ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' : ''}
                    ${item.is_completed ? 'bg-green-500 text-white' : ''}
                    ${item.is_locked ? 'bg-orange-400 text-white' : ''}
                    ${!item.is_accessible ? 'bg-gray-300 text-gray-600' : ''}
                    ${!isCurrent && !item.is_completed && !item.is_locked && item.is_accessible ? 'bg-gray-100 text-gray-700' : ''}
                  `}
                  title={item.title}
                >
                  {item.type === 'quiz' ? (
                    item.is_locked ? <Lock className="h-3 w-3" /> : <Target className="h-3 w-3" />
                  ) : item.is_completed ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    actualIndex + 1
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserJourneyNavigator;
