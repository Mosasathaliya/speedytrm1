'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Circle,
  BookOpen,
  Brain,
  Trophy,
  Clock,
  Volume2,
  Loader2,
  Maximize2,
  Languages,
  GraduationCap,
  Star
} from 'lucide-react';

// Types for lesson progression
interface SequentialLesson {
  lesson_number: number;
  title_arabic: string;
  title_english: string;
  explanation_arabic: string;
  explanation_english: string;
  grammar_rules: string[];
  examples: Array<{
    english: string;
    arabic_translation: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    explanation: string;
  }>;
  pronunciation_tips: string[];
  common_mistakes: string[];
  practice_exercises: Array<{
    question: string;
    answer: string;
    explanation: string;
  }>;
  completion_criteria: {
    min_time_spent: number; // in seconds
    required_examples_viewed: number;
    quiz_passing_score: number;
  };
}

interface UserProgress {
  current_lesson: number;
  completed_lessons: number[];
  total_time_spent: number;
  last_activity: string;
  lesson_scores: Record<number, number>;
}

interface WordTranslation {
  word: string;
  arabic_translation: string;
  alternative_meanings: string[];
  part_of_speech: string;
  pronunciation_arabic: string;
  example_english: string;
  example_arabic: string;
}

interface SequentialLessonSystemProps {
  userId: string;
  initialLessonNumber?: number;
  onProgressUpdate?: (progress: UserProgress) => void;
}

const SequentialLessonSystem: React.FC<SequentialLessonSystemProps> = ({
  userId,
  initialLessonNumber = 1,
  onProgressUpdate
}) => {
  // State management
  const [currentLesson, setCurrentLesson] = useState<SequentialLesson | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    current_lesson: initialLessonNumber,
    completed_lessons: [],
    total_time_spent: 0,
    last_activity: new Date().toISOString(),
    lesson_scores: {}
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentTab, setCurrentTab] = useState('explanation');
  const [currentExample, setCurrentExample] = useState(0);
  const [lessonStartTime, setLessonStartTime] = useState<number>(Date.now());
  const [timeSpent, setTimeSpent] = useState(0);
  const [examplesViewed, setExamplesViewed] = useState<Set<number>>(new Set());
  const [quizScore, setQuizScore] = useState(0);
  const [isLessonComplete, setIsLessonComplete] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordTranslation, setWordTranslation] = useState<WordTranslation | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Use Worker URL for RAG-backed endpoints
  const ragApiUrl = process.env.NEXT_PUBLIC_WORKER_URL || 'https://speed-of-mastery-rag.speedofmastry.workers.dev';

  // Lesson topics for each chapter (based on your 56 lessons)
  const lessonTopics = [
    { title: 'Introduction to English Language', arabic: 'مقدمة في اللغة الإنجليزية' },
    { title: 'English Alphabet', arabic: 'الأبجدية الإنجليزية' },
    { title: 'English Numbers', arabic: 'الأرقام الإنجليزية' },
    { title: 'Basic Colors', arabic: 'الألوان الأساسية' },
    { title: 'Greetings and Basic Words', arabic: 'التحيات والكلمات الأساسية' },
    { title: 'Personal Pronouns', arabic: 'الضمائر الشخصية' },
    { title: 'Present Simple Tense', arabic: 'المضارع البسيط' },
    { title: 'Articles (a, an, the)', arabic: 'أدوات التعريف والتنكير' },
    { title: 'Common Adjectives', arabic: 'الصفات الشائعة' },
    { title: 'Family Members', arabic: 'أفراد العائلة' },
    { title: 'Body Parts', arabic: 'أجزاء الجسم' },
    { title: 'Days and Months', arabic: 'الأيام والشهور' },
    { title: 'Time Expressions', arabic: 'تعبيرات الوقت' },
    { title: 'Weather and Seasons', arabic: 'الطقس والفصول' },
    { title: 'Food and Drinks', arabic: 'الطعام والشراب' },
    { title: 'Shopping Vocabulary', arabic: 'مفردات التسوق' },
    { title: 'Transportation', arabic: 'وسائل النقل' },
    { title: 'Places and Directions', arabic: 'الأماكن والاتجاهات' },
    { title: 'Past Simple Tense', arabic: 'الماضي البسيط' },
    { title: 'Future Tense', arabic: 'زمن المستقبل' },
    // ... continue for all 56 lessons
  ];

  // Timer for tracking lesson time
  useEffect(() => {
    timerRef.current = setInterval(() => {
      const currentTime = Date.now();
      const spent = Math.floor((currentTime - lessonStartTime) / 1000);
      setTimeSpent(spent);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [lessonStartTime]);

  // Check lesson completion criteria
  useEffect(() => {
    if (currentLesson) {
      const meetsCriteria = 
        timeSpent >= currentLesson.completion_criteria.min_time_spent &&
        examplesViewed.size >= currentLesson.completion_criteria.required_examples_viewed &&
        quizScore >= currentLesson.completion_criteria.quiz_passing_score;
      
      setIsLessonComplete(meetsCriteria);
    }
  }, [timeSpent, examplesViewed, quizScore, currentLesson]);

  // Generate lesson using AI with RAG integration
  const generateLesson = async (lessonNumber: number) => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Get lesson topic
      const topic = lessonTopics[lessonNumber - 1] || { 
        title: `English Lesson ${lessonNumber}`, 
        arabic: `الدرس ${lessonNumber} في اللغة الإنجليزية` 
      };

      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 15;
        });
      }, 800);

      // Enhanced prompt for sequential learning
      const enhancedPrompt = `
      Generate lesson ${lessonNumber} for Arabic speakers learning English.
      Topic: ${topic.title} (${topic.arabic})
      
      This is lesson ${lessonNumber} in a sequential learning path. 
      ${lessonNumber > 1 ? `Previous lessons covered basic concepts. Build upon previous knowledge.` : 'This is the first lesson - start with fundamentals.'}
      
      Requirements:
      1. Comprehensive Arabic explanation for the topic
      2. Exactly 20 practical English examples with progressive difficulty
      3. Build knowledge sequentially from previous lessons
      4. Include grammar rules in Arabic
      5. Pronunciation tips in Arabic
      6. Common mistakes Arab speakers make
      7. Practice exercises to test understanding
      
      Focus on practical usage and real-world application.
      Make explanations clear and detailed in Arabic.
      `;

      const response = await fetch(`${ragApiUrl}/api/ai/generate-lesson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.title,
          user_level: 'beginner',
          lesson_number: lessonNumber,
          enhanced_prompt: enhancedPrompt,
          context: lessonNumber > 1 ? `Sequential lesson ${lessonNumber} building on previous knowledge` : 'Introduction lesson'
        }),
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (!response.ok) {
        throw new Error('Failed to generate lesson');
      }

      const data = await response.json();
      
      if (data.success && data.lesson) {
        // Enhance lesson data with completion criteria
        const enhancedLesson: SequentialLesson = {
          lesson_number: lessonNumber,
          ...data.lesson,
          completion_criteria: {
            min_time_spent: 300, // 5 minutes minimum
            required_examples_viewed: 15, // Must view at least 15 out of 20 examples
            quiz_passing_score: 70 // 70% on practice exercises
          }
        };

        setCurrentLesson(enhancedLesson);
        setLessonStartTime(Date.now());
        setTimeSpent(0);
        setExamplesViewed(new Set());
        setQuizScore(0);
        setIsLessonComplete(false);
        setCurrentExample(0);
        setCurrentTab('explanation');
      } else {
        throw new Error('Invalid lesson data received');
      }
    } catch (error) {
      console.error('Error generating lesson:', error);
      // Create fallback lesson
      const fallbackLesson: SequentialLesson = {
        lesson_number: lessonNumber,
        title_arabic: `الدرس ${lessonNumber}: ${lessonTopics[lessonNumber - 1]?.arabic || 'درس إنجليزي'}`,
        title_english: `Lesson ${lessonNumber}: ${lessonTopics[lessonNumber - 1]?.title || 'English Lesson'}`,
        explanation_arabic: `شرح تفصيلي للدرس ${lessonNumber}. هذا الدرس يعتمد على ما تعلمته في الدروس السابقة ويضيف معلومات جديدة ومهمة.`,
        explanation_english: `Detailed explanation for lesson ${lessonNumber}. This lesson builds on previous knowledge and introduces new important concepts.`,
        grammar_rules: [`Grammar rules for lesson ${lessonNumber} will be provided`],
        examples: Array.from({ length: 20 }, (_, i) => ({
          english: `Example ${i + 1} for lesson ${lessonNumber}: This demonstrates the concept clearly.`,
          arabic_translation: `مثال ${i + 1} للدرس ${lessonNumber}: هذا يوضح المفهوم بوضوح.`,
          difficulty: (i < 7 ? 'beginner' : i < 14 ? 'intermediate' : 'advanced') as 'beginner' | 'intermediate' | 'advanced',
          explanation: `شرح المثال ${i + 1}`
        })),
        pronunciation_tips: [`Pronunciation tips for lesson ${lessonNumber}`],
        common_mistakes: [`Common mistakes in lesson ${lessonNumber}`],
        practice_exercises: [{
          question: `Practice question for lesson ${lessonNumber}`,
          answer: 'Answer will be provided',
          explanation: 'Explanation included'
        }],
        completion_criteria: {
          min_time_spent: 300,
          required_examples_viewed: 15,
          quiz_passing_score: 70
        }
      };
      setCurrentLesson(fallbackLesson);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 1000);
    }
  };

  // Handle next lesson
  const handleNextLesson = async () => {
    if (!isLessonComplete) {
      alert('يجب إكمال الدرس الحالي قبل الانتقال للدرس التالي\nPlease complete the current lesson before moving to the next one');
      return;
    }

    const nextLessonNumber = userProgress.current_lesson + 1;
    
    // Update progress
    const newProgress: UserProgress = {
      ...userProgress,
      current_lesson: nextLessonNumber,
      completed_lessons: [...userProgress.completed_lessons, userProgress.current_lesson],
      total_time_spent: userProgress.total_time_spent + timeSpent,
      last_activity: new Date().toISOString(),
      lesson_scores: {
        ...userProgress.lesson_scores,
        [userProgress.current_lesson]: quizScore
      }
    };

    setUserProgress(newProgress);
    onProgressUpdate?.(newProgress);

    // Generate next lesson
    await generateLesson(nextLessonNumber);
  };

  // Handle previous lesson
  const handlePreviousLesson = async () => {
    if (userProgress.current_lesson <= 1) return;
    
    const prevLessonNumber = userProgress.current_lesson - 1;
    setUserProgress(prev => ({ ...prev, current_lesson: prevLessonNumber }));
    await generateLesson(prevLessonNumber);
  };

  // Handle word click for translation
  const handleWordClick = async (word: string, context: string) => {
    setSelectedWord(word);
    
    try {
      const response = await fetch(`${ragApiUrl}/api/ai/translate-word`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word: word.replace(/[^\w]/g, ''),
          context,
        }),
      });

      if (response.ok) {
        const translation = await response.json();
        setWordTranslation(translation);
      }
    } catch (error) {
      console.error('Error translating word:', error);
      setWordTranslation({
        word,
        arabic_translation: `ترجمة ${word}`,
        alternative_meanings: [],
        part_of_speech: 'غير محدد',
        pronunciation_arabic: `نطق ${word}`,
        example_english: `Example with ${word}`,
        example_arabic: `مثال مع ${word}`
      });
    }
  };

  // Handle word pronunciation
  const handleWordPronunciation = async (word: string) => {
    setPlayingAudio(word);
    
    try {
      const response = await fetch(`${ragApiUrl}/api/ai/pronounce-word`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word }),
      });

      if (response.ok) {
        const audioData = await response.json();
        
        if (audioRef.current && audioData.audio_base64) {
          audioRef.current.src = `data:${audioData.audio_type};base64,${audioData.audio_base64}`;
          await audioRef.current.play();
        }
      }
    } catch (error) {
      console.error('Error playing pronunciation:', error);
    } finally {
      setPlayingAudio(null);
    }
  };

  // Render interactive text with clickable words
  const renderInteractiveText = (text: string, context: string = '') => {
    const words = text.split(/(\s+|[.,!?;:])/);
    
    return words.map((word, index) => {
      const cleanWord = word.trim();
      if (!cleanWord || /^[.,!?;:\s]+$/.test(cleanWord)) {
        return <span key={index}>{word}</span>;
      }

      return (
        <span
          key={index}
          className="interactive-word"
          onClick={() => handleWordClick(cleanWord, context)}
        >
          {word}
        </span>
      );
    });
  };

  // Track example viewing
  const handleExampleView = (exampleIndex: number) => {
    setExamplesViewed(prev => new Set([...prev, exampleIndex]));
    setCurrentExample(exampleIndex);
  };

  // Initialize first lesson
  useEffect(() => {
    generateLesson(userProgress.current_lesson);
  }, []);

  // Word translation popup
  const WordTranslationPopup = () => {
    if (!selectedWord || !wordTranslation) return null;

    return (
      <Dialog open={!!selectedWord} onOpenChange={() => setSelectedWord(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              {wordTranslation.word}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground">Arabic Translation</h4>
              <p className="text-lg font-arabic">{wordTranslation.arabic_translation}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground">Pronunciation</h4>
              <div className="flex items-center gap-2">
                <span className="font-arabic">{wordTranslation.pronunciation_arabic}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleWordPronunciation(wordTranslation.word)}
                  disabled={playingAudio === wordTranslation.word}
                >
                  {playingAudio === wordTranslation.word ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                  Speak
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Progress indicators
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentLesson) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p>Generating your first lesson...</p>
          {generationProgress > 0 && (
            <Progress value={generationProgress} className="w-64 mx-auto" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="font-semibold">Lesson {currentLesson.lesson_number}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{formatTime(timeSpent)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{examplesViewed.size}/20 examples</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isLessonComplete && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Complete
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullScreen(true)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Progress bars */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Time Progress</span>
              <span>{Math.min(100, Math.floor((timeSpent / currentLesson.completion_criteria.min_time_spent) * 100))}%</span>
            </div>
            <Progress value={Math.min(100, (timeSpent / currentLesson.completion_criteria.min_time_spent) * 100)} />
            
            <div className="flex justify-between text-sm">
              <span>Examples Viewed</span>
              <span>{Math.floor((examplesViewed.size / currentLesson.completion_criteria.required_examples_viewed) * 100)}%</span>
            </div>
            <Progress value={(examplesViewed.size / currentLesson.completion_criteria.required_examples_viewed) * 100} />
          </div>
        </CardContent>
      </Card>

      {/* Main Lesson Card */}
      <Card>
        <CardHeader>
          <CardTitle className="space-y-2">
            <h2 className="text-xl font-arabic">{currentLesson.title_arabic}</h2>
            <p className="text-lg text-muted-foreground">{currentLesson.title_english}</p>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="font-arabic leading-relaxed line-clamp-4">
              {currentLesson.explanation_arabic}
            </p>
          </div>
          
          {/* Quick Examples Preview */}
          <div className="space-y-2">
            <h3 className="font-semibold">Examples Preview</h3>
            <div className="grid gap-2">
              {currentLesson.examples.slice(0, 3).map((example, index) => (
                <div key={index} className="p-3 bg-muted/30 rounded">
                  <p className="text-sm mb-1">
                    {renderInteractiveText(example.english, `Example ${index + 1}`)}
                  </p>
                  <p className="text-xs font-arabic text-muted-foreground">
                    {example.arabic_translation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePreviousLesson}
          disabled={userProgress.current_lesson <= 1 || isGenerating}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous Lesson
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Lesson {userProgress.current_lesson} of 56
          </p>
          <div className="flex items-center gap-1 mt-1">
            {Array.from({ length: Math.min(5, 56) }).map((_, i) => {
              const lessonNum = userProgress.current_lesson - 2 + i;
              if (lessonNum < 1 || lessonNum > 56) return null;
              
              return (
                <div
                  key={lessonNum}
                  className={`w-2 h-2 rounded-full ${
                    userProgress.completed_lessons.includes(lessonNum)
                      ? 'bg-green-500'
                      : lessonNum === userProgress.current_lesson
                      ? 'bg-blue-500'
                      : 'bg-gray-300'
                  }`}
                />
              );
            })}
          </div>
        </div>

        <Button
          onClick={handleNextLesson}
          disabled={!isLessonComplete || isGenerating}
          className="bg-primary"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              Next Lesson
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Full Screen Modal */}
      <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
        <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-arabic">{currentLesson.title_arabic}</h2>
                  <p className="text-lg text-muted-foreground">{currentLesson.title_english}</p>
                </div>
                <Badge variant="secondary">Lesson {currentLesson.lesson_number}</Badge>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="explanation">Explanation</TabsTrigger>
                <TabsTrigger value="examples">Examples ({examplesViewed.size}/20)</TabsTrigger>
                <TabsTrigger value="grammar">Grammar</TabsTrigger>
                <TabsTrigger value="practice">Practice</TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-hidden mt-4">
                <TabsContent value="explanation" className="h-full">
                  <ScrollArea className="h-full">
                    <div className="space-y-6 p-4">
                      <div className="bg-muted/50 p-6 rounded-lg">
                        <p className="font-arabic text-lg leading-relaxed">
                          {currentLesson.explanation_arabic}
                        </p>
                      </div>
                      <Separator />
                      <div className="bg-muted/50 p-6 rounded-lg">
                        <p className="leading-relaxed">
                          {currentLesson.explanation_english}
                        </p>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="examples" className="h-full">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-4">
                      {currentLesson.examples.map((example, index) => (
                        <Card 
                          key={index}
                          className={`cursor-pointer transition-all ${
                            examplesViewed.has(index) ? 'ring-2 ring-green-500' : 'hover:shadow-md'
                          }`}
                          onClick={() => handleExampleView(index)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={
                                example.difficulty === 'beginner' ? 'default' :
                                example.difficulty === 'intermediate' ? 'secondary' : 'destructive'
                              }>
                                {example.difficulty}
                              </Badge>
                              <span className="text-sm text-muted-foreground">Example {index + 1}</span>
                              {examplesViewed.has(index) && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            
                            <div className="space-y-3">
                              <p className="text-lg leading-relaxed">
                                {renderInteractiveText(example.english, `Example ${index + 1}`)}
                              </p>
                              <p className="font-arabic text-muted-foreground">
                                {example.arabic_translation}
                              </p>
                              <p className="font-arabic text-sm bg-blue-50 p-2 rounded">
                                {example.explanation}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="grammar" className="h-full">
                  <ScrollArea className="h-full">
                    <div className="space-y-4 p-4">
                      {currentLesson.grammar_rules.map((rule, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                                {index + 1}
                              </div>
                              <p className="font-arabic leading-relaxed">{rule}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="practice" className="h-full">
                  <ScrollArea className="h-full">
                    <div className="space-y-4 p-4">
                      {currentLesson.practice_exercises.map((exercise, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-semibold mb-1">Question {index + 1}</h4>
                                <p className="font-arabic">{exercise.question}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-green-600 mb-1">Answer</h4>
                                <p className="text-green-700 bg-green-50 p-2 rounded font-arabic">
                                  {exercise.answer}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-muted-foreground mb-1">Explanation</h4>
                                <p className="text-sm font-arabic">{exercise.explanation}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <WordTranslationPopup />
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default SequentialLessonSystem;
