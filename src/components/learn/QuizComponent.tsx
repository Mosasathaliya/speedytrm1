'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Clock, 
  Mic, 
  MicOff, 
  Volume2, 
  CheckCircle, 
  XCircle, 
  Trophy,
  Target,
  BookOpen,
  AlertTriangle,
  Star,
  RefreshCw,
  Play
} from 'lucide-react';
import type { 
  Quiz, 
  QuizQuestion, 
  QuizAttempt, 
  UserAnswer, 
  AssessmentResult,
  FillBlankQuestion,
  PronunciationQuestion
} from '@/types/assessment';

interface QuizComponentProps {
  quiz: Quiz;
  userId: string;
  onQuizComplete: (result: AssessmentResult) => void;
  onExit: () => void;
}

const QuizComponent: React.FC<QuizComponentProps> = ({
  quiz,
  userId,
  onQuizComplete,
  onExit
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [pronunciationAccuracy, setPronunciationAccuracy] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(quiz.time_limit ? quiz.time_limit * 60 : 0);
  const [showResult, setShowResult] = useState(false);
  const [quizResult, setQuizResult] = useState<AssessmentResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTime = useRef<number>(Date.now());

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.total_questions) * 100;

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        handlePronunciationResult(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Start timer if quiz has time limit
    if (quiz.time_limit && sessionStarted && !showResult) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sessionStarted, showResult]);

  useEffect(() => {
    // Reset question timer
    questionStartTime.current = Date.now();
  }, [currentQuestionIndex]);

  const startQuiz = () => {
    setSessionStarted(true);
    questionStartTime.current = Date.now();
  };

  const handleTimeUp = () => {
    // Auto-submit quiz when time is up
    submitQuiz();
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      setIsRecording(true);
      setPronunciationAccuracy(null);
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handlePronunciationResult = async (transcript: string) => {
    const question = currentQuestion as PronunciationQuestion;
    const targetWord = question.target_word.toLowerCase();
    
    try {
      // Send to backend for pronunciation analysis
      const response = await fetch('/api/ai/analyze-pronunciation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_word: targetWord,
          user_pronunciation: transcript,
          user_id: userId
        })
      });

      const analysis = await response.json();
      const accuracy = analysis.accuracy || 0;
      
      setPronunciationAccuracy(accuracy);
      setCurrentAnswer(transcript);
    } catch (error) {
      console.error('Pronunciation analysis error:', error);
      // Fallback: simple similarity check
      const similarity = calculateSimilarity(transcript, targetWord);
      setPronunciationAccuracy(similarity);
      setCurrentAnswer(transcript);
    }
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    // Simple similarity calculation
    const words1 = str1.toLowerCase().split(' ');
    const words2 = str2.toLowerCase().split(' ');
    
    let matches = 0;
    words1.forEach(word => {
      if (words2.includes(word)) matches++;
    });
    
    return Math.min((matches / Math.max(words1.length, words2.length)) * 100, 100);
  };

  const handleAnswer = (answer: string) => {
    setCurrentAnswer(answer);
  };

  const nextQuestion = () => {
    const timeSpent = Math.round((Date.now() - questionStartTime.current) / 1000);
    
    // Determine if answer is correct
    let isCorrect = false;
    let userAnswer = currentAnswer;

    if (currentQuestion.type === 'mcq') {
      isCorrect = currentAnswer === currentQuestion.correct_answer;
    } else if (currentQuestion.type === 'fill-blank') {
      const fillBlankQ = currentQuestion as FillBlankQuestion;
      isCorrect = fillBlankQ.acceptable_answers.some(
        acceptable => acceptable.toLowerCase() === currentAnswer.toLowerCase()
      );
    } else if (currentQuestion.type === 'pronunciation') {
      const pronunciationQ = currentQuestion as PronunciationQuestion;
      isCorrect = (pronunciationAccuracy || 0) >= pronunciationQ.minimum_accuracy;
      userAnswer = `${currentAnswer} (${pronunciationAccuracy?.toFixed(1)}% accuracy)`;
    }

    const answer: UserAnswer = {
      question_id: currentQuestion.id,
      user_answer: userAnswer,
      is_correct: isCorrect,
      pronunciation_accuracy: pronunciationAccuracy || undefined,
      time_spent: timeSpent
    };

    setAnswers(prev => [...prev, answer]);
    setCurrentAnswer('');
    setPronunciationAccuracy(null);

    if (currentQuestionIndex < quiz.total_questions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitQuiz([...answers, answer]);
    }
  };

  const submitQuiz = async (finalAnswers?: UserAnswer[]) => {
    setIsSubmitting(true);
    const answersToSubmit = finalAnswers || answers;
    
    try {
      const score = answersToSubmit.filter(a => a.is_correct).length;
      const result = calculateResult(score, quiz.max_score, quiz.passing_score, quiz.total_questions === 60);
      
      // Save quiz attempt
      const attempt: Omit<QuizAttempt, 'id'> = {
        quiz_id: quiz.id,
        user_id: userId,
        attempt_number: 1, // Will be determined by backend
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        is_completed: true,
        score: score,
        total_possible: quiz.max_score,
        passing_score: quiz.passing_score,
        result: result.result,
        answers: answersToSubmit,
        time_taken: quiz.time_limit ? (quiz.time_limit * 60) - timeLeft : undefined
      };

      // Submit to backend
      await fetch('/api/assessment/submit-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attempt)
      });

      setQuizResult(result);
      setShowResult(true);
      onQuizComplete(result);
    } catch (error) {
      console.error('Quiz submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateResult = (score: number, maxScore: number, passingScore: number, isFinalExam: boolean): AssessmentResult => {
    const percentage = (score / maxScore) * 100;
    let result: 'failed' | 'pass' | 'good' | 'excellent';
    let messageEn = '';
    let messageAr = '';
    let animationType: 'celebration' | 'encouragement' | 'failure';

    if (isFinalExam) {
      if (score < 40) {
        result = 'failed';
        messageEn = 'Failed - Course Review Required';
        messageAr = 'راسب - يتطلب مراجعة الدورة';
        animationType = 'failure';
      } else if (score >= 54) {
        result = 'excellent';
        messageEn = 'Excellent Mastery!';
        messageAr = 'إتقان ممتاز!';
        animationType = 'celebration';
      } else if (score >= 48) {
        result = 'good';
        messageEn = 'Good Performance';
        messageAr = 'أداء جيد';
        animationType = 'celebration';
      } else {
        result = 'pass';
        messageEn = 'Passed - Satisfactory';
        messageAr = 'نجح - مرضي';
        animationType = 'encouragement';
      }
    } else {
      if (score < 12) {
        result = 'failed';
        messageEn = 'Failed - Review Required';
        messageAr = 'راسب - يتطلب مراجعة';
        animationType = 'failure';
      } else if (score >= 19) {
        result = 'excellent';
        messageEn = 'Excellent Work!';
        messageAr = 'عمل ممتاز!';
        animationType = 'celebration';
      } else if (score >= 17) {
        result = 'good';
        messageEn = 'Good Performance';
        messageAr = 'أداء جيد';
        animationType = 'celebration';
      } else {
        result = 'pass';
        messageEn = 'Passed - Good Work';
        messageAr = 'نجح - عمل جيد';
        animationType = 'encouragement';
      }
    }

    return {
      score,
      total_possible: maxScore,
      percentage,
      result,
      message_english: messageEn,
      message_arabic: messageAr,
      animation_type: animationType,
      recommendations: [],
      weak_areas: [],
      strong_areas: []
    };
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    return (
      <div className="space-y-6">
        {/* Question Header */}
        <div className="text-center space-y-2">
          <Badge variant="outline" className="mb-2">
            Question {currentQuestionIndex + 1} of {quiz.total_questions}
          </Badge>
          <h3 className="text-xl font-semibold">{currentQuestion.question_english}</h3>
          <p className="text-sm text-muted-foreground font-arabic" dir="rtl">
            {currentQuestion.question_arabic}
          </p>
        </div>

        {/* Question Content */}
        <div className="space-y-4">
          {currentQuestion.type === 'mcq' && (
            <RadioGroup value={currentAnswer} onValueChange={handleAnswer} className="space-y-3">
              {currentQuestion.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {currentQuestion.type === 'fill-blank' && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-lg">
                  {(currentQuestion as FillBlankQuestion).sentence_with_blank.split('_____').map((part, index, arr) => (
                    <span key={index}>
                      {part}
                      {index < arr.length - 1 && (
                        <Input
                          value={currentAnswer}
                          onChange={(e) => handleAnswer(e.target.value)}
                          className="inline-block w-32 mx-2"
                          placeholder="..."
                        />
                      )}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          )}

          {currentQuestion.type === 'pronunciation' && (
            <div className="space-y-4 text-center">
              <div className="bg-muted p-6 rounded-lg">
                <h4 className="text-2xl font-bold mb-2">
                  {(currentQuestion as PronunciationQuestion).target_word}
                </h4>
                <p className="text-muted-foreground mb-4">
                  {(currentQuestion as PronunciationQuestion).phonetic_spelling}
                </p>
                <Button
                  size="lg"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="mr-2 h-5 w-5" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-5 w-5" />
                      Start Recording
                    </>
                  )}
                </Button>
              </div>
              
              {pronunciationAccuracy !== null && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-800">
                    Pronunciation Accuracy: {pronunciationAccuracy.toFixed(1)}%
                  </p>
                  <p className="text-sm text-green-600">
                    {pronunciationAccuracy >= 70 ? 'Great pronunciation!' : 'Try again for better accuracy'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={onExit}>
            Exit Quiz
          </Button>
          <Button 
            onClick={nextQuestion}
            disabled={!currentAnswer || (currentQuestion.type === 'pronunciation' && pronunciationAccuracy === null)}
          >
            {currentQuestionIndex === quiz.total_questions - 1 ? 'Submit Quiz' : 'Next Question'}
          </Button>
        </div>
      </div>
    );
  };

  const renderResult = () => {
    if (!quizResult) return null;

    const getResultIcon = () => {
      switch (quizResult.result) {
        case 'excellent': return <Trophy className="h-16 w-16 text-yellow-500" />;
        case 'good': return <Star className="h-16 w-16 text-blue-500" />;
        case 'pass': return <CheckCircle className="h-16 w-16 text-green-500" />;
        case 'failed': return <XCircle className="h-16 w-16 text-red-500" />;
      }
    };

    const getResultColor = () => {
      switch (quizResult.result) {
        case 'excellent': return 'text-yellow-600';
        case 'good': return 'text-blue-600';
        case 'pass': return 'text-green-600';
        case 'failed': return 'text-red-600';
      }
    };

    return (
      <div className="text-center space-y-6">
        <div className={`animate-bounce ${quizResult.animation_type === 'celebration' ? 'animate-pulse' : ''}`}>
          {getResultIcon()}
        </div>
        
        <div className="space-y-2">
          <h2 className={`text-3xl font-bold ${getResultColor()}`}>
            {quizResult.message_english}
          </h2>
          <p className={`text-xl font-arabic ${getResultColor()}`} dir="rtl">
            {quizResult.message_arabic}
          </p>
        </div>

        <div className="bg-muted p-6 rounded-lg space-y-2">
          <p className="text-2xl font-bold">
            Score: {quizResult.score} / {quizResult.total_possible}
          </p>
          <p className="text-lg text-muted-foreground">
            {quizResult.percentage.toFixed(1)}%
          </p>
          <Progress value={quizResult.percentage} className="w-full h-3" />
        </div>

        <div className="flex gap-4 justify-center">
          <Button onClick={onExit} variant="outline">
            Continue Learning
          </Button>
          {quizResult.result === 'failed' && (
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retake Quiz
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (!sessionStarted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{quiz.title}</CardTitle>
          <p className="text-muted-foreground">{quiz.description_english}</p>
          <p className="text-sm font-arabic" dir="rtl">{quiz.description_arabic}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-muted p-4 rounded-lg">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="font-semibold">{quiz.total_questions} Questions</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <Target className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="font-semibold">Pass: {quiz.passing_score}/{quiz.max_score}</p>
            </div>
            {quiz.time_limit && (
              <div className="bg-muted p-4 rounded-lg col-span-2">
                <Clock className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <p className="font-semibold">Time Limit: {quiz.time_limit} minutes</p>
              </div>
            )}
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold">Important Notice:</p>
                <p>If you exit without completing, a new test will be generated next time.</p>
                <p className="font-arabic" dir="rtl">إذا خرجت بدون إكمال، سيتم إنشاء اختبار جديد في المرة القادمة.</p>
              </div>
            </div>
          </div>

          <Button onClick={startQuiz} className="w-full" size="lg">
            <Play className="mr-2 h-5 w-5" />
            Start Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showResult) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8">
          {renderResult()}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{quiz.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {quiz.total_questions}
            </p>
          </div>
          {quiz.time_limit && (
            <div className="flex items-center space-x-2 text-lg font-mono">
              <Clock className="h-5 w-5" />
              <span className={timeLeft < 300 ? 'text-red-500' : ''}>{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      <CardContent>
        {isSubmitting ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Submitting quiz...</p>
          </div>
        ) : (
          renderQuestion()
        )}
      </CardContent>
    </Card>
  );
};

export default QuizComponent;
