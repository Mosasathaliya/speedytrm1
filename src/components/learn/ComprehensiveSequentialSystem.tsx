'use client';

import React, { useState, useEffect } from 'react';
import FloatingAITutor from './FloatingAITutor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Gamepad2, 
  Trophy, 
  Clock, 
  Target, 
  Star,
  Lock,
  CheckCircle,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { 
  LearningItem, 
  LearningProgress,
  VocabularyMatchingGame,
  GrammarAdventureGame,
  StoryBuilderGame,
  PronunciationGame
} from '@/types/comprehensive-learning';
import { COMPREHENSIVE_LEARNING_ITEMS, GAME_CONFIGURATIONS } from '@/lib/comprehensive-learning-data';
import { getCompleteJourneyWithQuizzes, getQuizConfig } from '@/lib/quiz-integration';
import AILessonCard from './AILessonCard';
import QuizComponent from './QuizComponent';
import { GAME_COMPONENTS } from './games';
import type { Quiz, AssessmentResult } from '@/types/assessment';

interface ComprehensiveSequentialSystemProps {
  userId: string;
  onProgressUpdate?: (progress: LearningProgress) => void;
}

interface GameData {
  vocabulary?: VocabularyMatchingGame;
  grammar?: GrammarAdventureGame;
  story?: StoryBuilderGame;
  pronunciation?: PronunciationGame;
}

const ComprehensiveSequentialSystem: React.FC<ComprehensiveSequentialSystemProps> = ({
  userId,
  onProgressUpdate
}) => {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [learningItems, setLearningItems] = useState<LearningItem[]>(() => getCompleteJourneyWithQuizzes());
  const [currentGameData, setCurrentGameData] = useState<GameData>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showAITutor, setShowAITutor] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [learningProgress, setLearningProgress] = useState<LearningProgress>({
    userId,
    currentItem: 1,
    completedItems: [],
    totalScore: 0,
    streakDays: 0,
    achievements: [],
    lastActivity: new Date()
  });

  const currentItem = learningItems[currentItemIndex];
  const completedCount = learningProgress.completedItems.length;
  const totalItems = learningItems.length;
  const overallProgress = (completedCount / totalItems) * 100;

  useEffect(() => {
    // Initialize first item as unlocked
    if (learningItems.length > 0) {
      setLearningItems(prev => prev.map((item, index) => 
        index === 0 ? { ...item, unlocked: true } : item
      ));
    }
  }, []);

  const unlockNextItem = () => {
    if (currentItemIndex < learningItems.length - 1) {
      setLearningItems(prev => prev.map((item, index) => 
        index === currentItemIndex + 1 ? { ...item, unlocked: true } : item
      ));
    }
  };

  const markItemCompleted = (itemIndex: number, score: number) => {
    const itemNumber = itemIndex + 1;
    
    setLearningItems(prev => prev.map((item, index) => 
      index === itemIndex ? { ...item, completed: true, score } : item
    ));

    setLearningProgress(prev => ({
      ...prev,
      completedItems: [...prev.completedItems, itemNumber],
      totalScore: prev.totalScore + score,
      currentItem: Math.min(itemNumber + 1, totalItems),
      lastActivity: new Date()
    }));

    unlockNextItem();
    
    if (onProgressUpdate) {
      onProgressUpdate({
        ...learningProgress,
        completedItems: [...learningProgress.completedItems, itemNumber],
        totalScore: learningProgress.totalScore + score,
        currentItem: Math.min(itemNumber + 1, totalItems),
        lastActivity: new Date()
      });
    }

    // Check for achievements
    checkAchievements(itemNumber, score);
  };

  const checkAchievements = (itemNumber: number, score: number) => {
    const newAchievements: string[] = [];
    
    if (itemNumber === 1) newAchievements.push('First Steps');
    if (itemNumber === 10) newAchievements.push('Foundation Master');
    if (itemNumber === 25) newAchievements.push('Vocabulary Builder');
    if (itemNumber === 50) newAchievements.push('Grammar Guru');
    if (itemNumber === 75) newAchievements.push('Communication Expert');
    if (itemNumber === 91) newAchievements.push('English Master');
    if (score === 100) newAchievements.push('Perfect Score');
    
    if (newAchievements.length > 0) {
      setLearningProgress(prev => ({
        ...prev,
        achievements: [...prev.achievements, ...newAchievements]
      }));
    }
  };

  const generateLesson = async () => {
    if (currentItem.type !== 'lesson') return;

    setIsGenerating(true);
    try {
      // This would call the AI lesson generation endpoint
      // For now, we'll use the existing AILessonCard component
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating lesson:', error);
      setIsGenerating(false);
    }
  };

  const generateGame = async () => {
    if (currentItem.type !== 'game') return;

    setIsGenerating(true);
    try {
      const gameConfig = GAME_CONFIGURATIONS[currentItem.id];
      if (!gameConfig) return;

      // Generate game data based on type
      const response = await fetch('/api/ai/generate-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: gameConfig.gameType,
          difficulty: gameConfig.difficulty,
          topics: gameConfig.topics,
          title: currentItem.title
        })
      });

      if (response.ok) {
        const gameData = await response.json();
        setCurrentGameData({ [gameConfig.gameType]: gameData });
      }
    } catch (error) {
      console.error('Error generating game:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleItemCompletion = (score: number) => {
    markItemCompleted(currentItemIndex, score);
    
    if (currentItemIndex === learningItems.length - 1) {
      setShowCompletion(true);
    } else {
      // Auto-advance to next item
      setTimeout(() => {
        setCurrentItemIndex(currentItemIndex + 1);
        setCurrentGameData({});
      }, 1500);
    }
  };

  const goToNextItem = () => {
    if (currentItemIndex < learningItems.length - 1 && learningItems[currentItemIndex + 1].unlocked) {
      setCurrentItemIndex(currentItemIndex + 1);
      setCurrentGameData({});
    }
  };

  const goToPreviousItem = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1);
      setCurrentGameData({});
    }
  };

  const jumpToItem = (index: number) => {
    if (learningItems[index].unlocked) {
      setCurrentItemIndex(index);
      setCurrentGameData({});
    }
  };

  const resetProgress = () => {
    setCurrentItemIndex(0);
    setLearningItems(COMPREHENSIVE_LEARNING_ITEMS.map((item, index) => ({
      ...item,
      unlocked: index === 0,
      completed: false,
      score: undefined
    })));
    setLearningProgress({
      userId,
      currentItem: 1,
      completedItems: [],
      totalScore: 0,
      streakDays: 0,
      achievements: [],
      lastActivity: new Date()
    });
    setCurrentGameData({});
    setShowCompletion(false);
  };

  const renderCurrentItem = () => {
    if (!currentItem) return null;

    if (currentItem.type === 'lesson') {
      return (
        <AILessonCard
          topic={currentItem.title}
          userLevel="beginner"
          lessonNumber={currentItem.number}
          onLessonGenerated={(lesson) => {
            console.log('Lesson generated:', lesson);
          }}
          onComplete={handleItemCompletion}
        />
      );
    } else if (currentItem.type === 'quiz') {
      return (
        <Card className="text-center p-8">
          <CardContent>
            <div className="space-y-4">
              <Target className="h-16 w-16 mx-auto text-blue-500" />
              <h3 className="text-lg font-semibold">{currentItem.title}</h3>
              <p className="text-muted-foreground">{currentItem.description}</p>
              <p className="text-sm font-arabic text-muted-foreground" dir="rtl">
                {currentItem.descriptionAr}
              </p>
              <div className="flex justify-center gap-4 mt-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Questions</p>
                  <p className="text-lg font-bold">{currentItem.metadata?.total_questions || 20}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Pass Score</p>
                  <p className="text-lg font-bold">{currentItem.metadata?.passing_score || 12}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="text-lg font-bold">{currentItem.estimatedTime}min</p>
                </div>
              </div>
              <Button onClick={() => startQuiz(currentItem.id)} size="lg">
                Start {currentItem.id === 'final-exam' ? 'Final Exam' : 'Quiz'}
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    } else {
      // Render game component
      const gameConfig = GAME_CONFIGURATIONS[currentItem.id];
      if (!gameConfig) return <div>Game configuration not found</div>;

      const GameComponent = GAME_COMPONENTS[gameConfig.gameType];
      if (!GameComponent) return <div>Game component not found</div>;

      const gameData = currentGameData[gameConfig.gameType];
      if (!gameData) {
        return (
          <Card className="text-center p-8">
            <CardContent>
              <div className="space-y-4">
                <Gamepad2 className="h-16 w-16 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-semibold">{currentItem.title}</h3>
                <p className="text-muted-foreground">{currentItem.description}</p>
                <Button 
                  onClick={generateGame} 
                  disabled={isGenerating}
                  size="lg"
                >
                  {isGenerating ? 'Generating Game...' : 'Start Game'}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      }

      return (
        <GameComponent
          gameData={gameData}
          onComplete={handleItemCompletion}
        />
      );
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Progress Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                🎓 Learning Journey
                <Badge variant="secondary">
                  {completedCount}/{totalItems} Complete
                </Badge>
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Sequential 56 Lessons + 35 Interactive Games
              </p>
            </div>
            <div className="text-right space-y-1">
              <div className="text-2xl font-bold text-primary">
                {Math.round(overallProgress)}%
              </div>
              <div className="text-sm text-muted-foreground">
                Total Score: {learningProgress.totalScore}
              </div>
            </div>
          </div>
          <Progress value={overallProgress} className="h-4 mt-4" />
        </CardHeader>
      </Card>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Current Item
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Progress Map
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Achievements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {/* Current Item Display */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {currentItem.type === 'lesson' ? (
                    <BookOpen className="h-6 w-6 text-blue-500" />
                  ) : (
                    <Gamepad2 className="h-6 w-6 text-green-500" />
                  )}
                  <div>
                    <CardTitle className="text-xl">
                      {currentItem.number}. {currentItem.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground font-arabic" dir="rtl">
                      {currentItem.titleAr}
                    </p>
                  </div>
                  <Badge variant={currentItem.type === 'lesson' ? 'default' : 'secondary'}>
                    {currentItem.type === 'lesson' ? 'Lesson' : 'Game'}
                  </Badge>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {currentItem.estimatedTime}min
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={goToPreviousItem}
                    disabled={currentItemIndex === 0}
                    variant="outline"
                    size="sm"
                  >
                    ← Previous
                  </Button>
                  <Button
                    onClick={goToNextItem}
                    disabled={!learningItems[currentItemIndex + 1]?.unlocked}
                    variant="outline"
                    size="sm"
                  >
                    Next →
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Current Item Content */}
          {renderCurrentItem()}
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Progress Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {learningItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={cn(
                      "relative p-3 rounded-lg border-2 transition-all cursor-pointer group",
                      index === currentItemIndex ? "ring-2 ring-primary" : "",
                      item.completed 
                        ? "border-green-400 bg-green-50 dark:bg-green-950" 
                        : item.unlocked
                          ? "border-blue-400 bg-blue-50 dark:bg-blue-950 hover:scale-105"
                          : "border-muted bg-muted/30 cursor-not-allowed"
                    )}
                    onClick={() => item.unlocked && jumpToItem(index)}
                  >
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center">
                        {item.type === 'lesson' ? (
                          <BookOpen className={cn(
                            "h-5 w-5",
                            item.completed ? "text-green-600" : item.unlocked ? "text-blue-600" : "text-muted-foreground"
                          )} />
                        ) : (
                          <Gamepad2 className={cn(
                            "h-5 w-5",
                            item.completed ? "text-green-600" : item.unlocked ? "text-purple-600" : "text-muted-foreground"
                          )} />
                        )}
                        {!item.unlocked && (
                          <Lock className="h-3 w-3 absolute -top-1 -right-1 text-muted-foreground" />
                        )}
                      </div>
                      
                      <div className="text-xs font-medium truncate" title={item.title}>
                        {item.number}. {item.title.length > 20 ? item.title.substring(0, 20) + '...' : item.title}
                      </div>
                      
                      <div className="flex items-center justify-center">
                        {item.completed ? (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-xs font-medium">{item.score}%</span>
                          </div>
                        ) : item.unlocked ? (
                          <div className="h-4 w-4 border-2 border-current rounded-full" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      
                      <Badge 
                        variant={item.type === 'lesson' ? 'default' : 'secondary'} 
                        className="text-xs py-0 px-1"
                      >
                        {item.estimatedTime}m
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🏆 Achievements Unlocked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {learningProgress.achievements.map((achievement, index) => (
                  <Card key={index} className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
                    <div className="text-center space-y-2">
                      <Trophy className="h-8 w-8 text-yellow-600 mx-auto" />
                      <h4 className="font-semibold">{achievement}</h4>
                      <p className="text-xs text-muted-foreground">Achievement Unlocked!</p>
                    </div>
                  </Card>
                ))}
                
                {learningProgress.achievements.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Complete lessons and games to unlock achievements!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📊 Learning Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{completedCount}</div>
                  <div className="text-sm text-muted-foreground">Items Completed</div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{learningProgress.totalScore}</div>
                  <div className="text-sm text-muted-foreground">Total Score</div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{Math.round(overallProgress)}%</div>
                  <div className="text-sm text-muted-foreground">Progress</div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{learningProgress.achievements.length}</div>
                  <div className="text-sm text-muted-foreground">Achievements</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Completion Modal */}
      {showCompletion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-lg w-full mx-4">
            <CardContent className="p-8 text-center space-y-6">
              <div className="text-6xl animate-bounce">🎓</div>
              <h2 className="text-3xl font-bold text-primary">Congratulations!</h2>
              <p className="text-lg text-muted-foreground">
                You've completed the entire English learning journey!
              </p>
              <p className="text-muted-foreground font-arabic" dir="rtl">
                مبروك! أكملت رحلة تعلم الإنجليزية بأكملها!
              </p>
              
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">🏆 Final Results</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{completedCount}</div>
                    <div className="text-sm">Items Completed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{learningProgress.totalScore}</div>
                    <div className="text-sm">Total Score</div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button onClick={resetProgress} variant="outline" className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Start Over
                </Button>
                <Button className="flex-1">
                  Download Certificate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Floating AI Tutor */}
      {!showCompletion && (
        <FloatingAITutor
          lessonId={currentItem.id}
          lessonTitle={currentItem.title}
          lessonContent={`Lesson ${currentItem.number}: ${currentItem.title} - ${currentItem.description}`}
          isVisible={showAITutor}
          onClose={() => setShowAITutor(false)}
        />
      )}
    </div>
  );
};

export default ComprehensiveSequentialSystem;
