'use client';

import React, { useState, useEffect, useRef } from 'react';
import FloatingAITutor from './FloatingAITutor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  Play, 
  Volume2, 
  BookOpen, 
  MessageSquare, 
  CheckCircle,
  Loader2,
  Languages,
  GraduationCap,
  Target,
  Lightbulb
} from 'lucide-react';

// Types for the AI-generated lesson
interface LessonExample {
  english: string;
  arabic_translation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  explanation: string;
}

interface PracticeExercise {
  question: string;
  answer: string;
  explanation: string;
}

interface GeneratedLesson {
  title_arabic: string;
  title_english: string;
  explanation_arabic: string;
  explanation_english: string;
  grammar_rules: string[];
  examples: LessonExample[];
  pronunciation_tips: string[];
  common_mistakes: string[];
  practice_exercises: PracticeExercise[];
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

interface AILessonCardProps {
  lessonId?: number;
  topic?: string;
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
  onLessonGenerated?: (lesson: GeneratedLesson) => void;
}

const AILessonCard: React.FC<AILessonCardProps> = ({
  lessonId,
  topic = '',
  userLevel = 'beginner',
  onLessonGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLesson, setGeneratedLesson] = useState<GeneratedLesson | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentTab, setCurrentTab] = useState('explanation');
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordTranslation, setWordTranslation] = useState<WordTranslation | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [currentExample, setCurrentExample] = useState(0);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showAITutor, setShowAITutor] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Use Worker URL for RAG-backed endpoints
  const ragApiUrl = process.env.NEXT_PUBLIC_WORKER_URL || 'https://speed-of-mastery-rag.speedofmastry.workers.dev';

  // Generate comprehensive lesson using AI
  const generateLesson = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch(`${ragApiUrl}/api/ai/generate-lesson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lesson_id: lessonId,
          topic,
          user_level: userLevel,
        }),
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (!response.ok) {
        throw new Error('Failed to generate lesson');
      }

      const data = await response.json();
      
      if (data.success && data.lesson) {
        setGeneratedLesson(data.lesson);
        onLessonGenerated?.(data.lesson);
      } else {
        throw new Error('Invalid lesson data received');
      }
    } catch (error) {
      console.error('Error generating lesson:', error);
      // Create fallback lesson
      const fallbackLesson: GeneratedLesson = {
        title_arabic: `درس: ${topic || 'اللغة الإنجليزية'}`,
        title_english: `Lesson: ${topic || 'English Language'}`,
        explanation_arabic: 'شرح تفصيلي للدرس سيتم توليده قريباً. يرجى المحاولة مرة أخرى.',
        explanation_english: 'Detailed lesson explanation will be generated soon. Please try again.',
        grammar_rules: ['Basic grammar rules will be provided'],
        examples: Array.from({ length: 20 }, (_, i) => ({
          english: `Example ${i + 1}: This is a sample English sentence.`,
          arabic_translation: `مثال ${i + 1}: هذه جملة إنجليزية نموذجية.`,
          difficulty: 'beginner' as const,
          explanation: `شرح المثال ${i + 1}`
        })),
        pronunciation_tips: ['Practice pronunciation regularly'],
        common_mistakes: ['Common mistakes will be highlighted'],
        practice_exercises: [{
          question: 'Practice question will be generated',
          answer: 'Answer will be provided',
          explanation: 'Explanation will be included'
        }]
      };
      setGeneratedLesson(fallbackLesson);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 1000);
    }
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
          word: word.replace(/[^\w]/g, ''), // Remove punctuation
          context,
        }),
      });

      if (response.ok) {
        const translation = await response.json();
        setWordTranslation(translation);
      }
    } catch (error) {
      console.error('Error translating word:', error);
      // Fallback translation
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
        
        // Play the audio
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

  // Render interactive English text with clickable words
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
          className="relative cursor-pointer hover:bg-blue-100 hover:text-blue-600 px-1 py-0.5 rounded transition-colors"
          onClick={() => handleWordClick(cleanWord, context)}
        >
          {word}
        </span>
      );
    });
  };

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
            
            {wordTranslation.alternative_meanings.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Alternative Meanings</h4>
                <div className="flex flex-wrap gap-1">
                  {wordTranslation.alternative_meanings.map((meaning, index) => (
                    <Badge key={index} variant="secondary" className="font-arabic">
                      {meaning}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-sm text-muted-foreground">Part of Speech</h4>
              <Badge variant="outline">{wordTranslation.part_of_speech}</Badge>
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

            <div>
              <h4 className="font-semibold text-sm text-muted-foreground">Example</h4>
              <p className="text-sm">{wordTranslation.example_english}</p>
              <p className="text-sm font-arabic text-muted-foreground">{wordTranslation.example_arabic}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Full-screen lesson view
  const FullScreenLesson = () => {
    if (!generatedLesson) return null;

    return (
      <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
        <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl">
                <div className="flex flex-col">
                  <span className="font-arabic">{generatedLesson.title_arabic}</span>
                  <span className="text-lg text-muted-foreground">{generatedLesson.title_english}</span>
                </div>
              </DialogTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullScreen(false)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="explanation">Explanation</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
                <TabsTrigger value="grammar">Grammar</TabsTrigger>
                <TabsTrigger value="tips">Tips</TabsTrigger>
                <TabsTrigger value="practice">Practice</TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-hidden">
                <TabsContent value="explanation" className="h-full">
                  <ScrollArea className="h-full">
                    <div className="space-y-6 p-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          Arabic Explanation
                        </h3>
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <p className="font-arabic text-lg leading-relaxed">
                            {generatedLesson.explanation_arabic}
                          </p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-3">English Explanation</h3>
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <p className="leading-relaxed">
                            {generatedLesson.explanation_english}
                          </p>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="examples" className="h-full">
                  <ScrollArea className="h-full">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <MessageSquare className="h-5 w-5" />
                          Interactive Examples ({generatedLesson.examples.length})
                        </h3>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentExample(Math.max(0, currentExample - 1))}
                            disabled={currentExample === 0}
                          >
                            Previous
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            {currentExample + 1} of {generatedLesson.examples.length}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentExample(Math.min(generatedLesson.examples.length - 1, currentExample + 1))}
                            disabled={currentExample === generatedLesson.examples.length - 1}
                          >
                            Next
                          </Button>
                        </div>
                      </div>

                      {generatedLesson.examples.map((example, index) => (
                        <Card 
                          key={index} 
                          className={`mb-4 ${index === currentExample ? 'ring-2 ring-primary' : 'opacity-50'}`}
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
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-semibold text-sm text-muted-foreground mb-1">English</h4>
                                <p className="text-lg leading-relaxed">
                                  {renderInteractiveText(example.english, `Example ${index + 1}`)}
                                </p>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Arabic Translation</h4>
                                <p className="font-arabic text-lg">{example.arabic_translation}</p>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Explanation</h4>
                                <p className="font-arabic text-sm">{example.explanation}</p>
                              </div>
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
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Grammar Rules
                      </h3>
                      {generatedLesson.grammar_rules.map((rule, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                                {index + 1}
                              </div>
                              <p className="text-sm leading-relaxed">{rule}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="tips" className="h-full">
                  <ScrollArea className="h-full">
                    <div className="space-y-6 p-4">
                      <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                          <Volume2 className="h-5 w-5" />
                          Pronunciation Tips
                        </h3>
                        <div className="space-y-3">
                          {generatedLesson.pronunciation_tips.map((tip, index) => (
                            <Card key={index}>
                              <CardContent className="p-3">
                                <p className="text-sm font-arabic">{tip}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                          <Target className="h-5 w-5" />
                          Common Mistakes to Avoid
                        </h3>
                        <div className="space-y-3">
                          {generatedLesson.common_mistakes.map((mistake, index) => (
                            <Card key={index} className="border-destructive/20">
                              <CardContent className="p-3">
                                <p className="text-sm font-arabic">{mistake}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="practice" className="h-full">
                  <ScrollArea className="h-full">
                    <div className="space-y-4 p-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Practice Exercises
                      </h3>
                      {generatedLesson.practice_exercises.map((exercise, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Question {index + 1}</h4>
                                <p>{exercise.question}</p>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold text-sm text-green-600 mb-1">Answer</h4>
                                <p className="text-green-700 bg-green-50 p-2 rounded">{exercise.answer}</p>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Explanation</h4>
                                <p className="text-sm text-muted-foreground">{exercise.explanation}</p>
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
    );
  };

  return (
    <>
      <Card ref={cardRef} className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span>AI Lesson Generator</span>
            </div>
            {generatedLesson && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullScreen(true)}
              >
                <Maximize2 className="h-4 w-4" />
                Full Screen
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!generatedLesson ? (
            <div className="text-center space-y-4">
              <div className="p-8 bg-muted/50 rounded-lg">
                <Sparkles className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Generate AI-Powered Lesson</h3>
                <p className="text-muted-foreground mb-4">
                  Create a comprehensive English lesson with Arabic explanations and 20 interactive examples
                </p>
                
                {isGenerating && (
                  <div className="space-y-2 mb-4">
                    <Progress value={generationProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground">
                      Generating comprehensive lesson with AI...
                    </p>
                  </div>
                )}
                
                <Button
                  onClick={generateLesson}
                  disabled={isGenerating}
                  size="lg"
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating Lesson...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Generate Lesson
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-semibold font-arabic mb-1">
                  {generatedLesson.title_arabic}
                </h3>
                <p className="text-muted-foreground">{generatedLesson.title_english}</p>
                <Badge variant="secondary" className="mt-2">
                  {generatedLesson.examples.length} Interactive Examples
                </Badge>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-arabic text-sm leading-relaxed line-clamp-3">
                  {generatedLesson.explanation_arabic}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsFullScreen(true)}
                  className="flex-1"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Full Lesson
                </Button>
                <Button
                  onClick={generateLesson}
                  variant="outline"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <FullScreenLesson />
      <WordTranslationPopup />

      {/* Floating AI Tutor */}
      {generatedLesson && (
        <FloatingAITutor
          lessonId={lessonId?.toString() || 'ai-lesson'}
          lessonTitle={generatedLesson.title_english}
          lessonContent={`${generatedLesson.explanation_english}\n\nArabic Explanation: ${generatedLesson.explanation_arabic}`}
          isVisible={showAITutor}
          onClose={() => setShowAITutor(false)}
        />
      )}
      
      {/* Hidden audio element for pronunciation */}
      <audio ref={audioRef} className="hidden" />
    </>
  );
};

export default AILessonCard;
