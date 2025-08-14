'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Volume2, CheckCircle, XCircle, RefreshCw, Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ListeningGame } from '@/types/comprehensive-learning';

interface ListeningGameProps {
  gameData: ListeningGame;
  onComplete: (score: number) => void;
}

const ListeningGameComponent: React.FC<ListeningGameProps> = ({
  gameData,
  onComplete
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [score, setScore] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentQuestion = gameData.questions[currentQuestionIndex];

  const playAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
        setPlayCount(prev => prev + 1);
      }
    } else if (gameData.audioUrl) {
      const audio = new Audio(gameData.audioUrl);
      audioRef.current = audio;
      audio.play();
      setIsPlaying(true);
      setPlayCount(prev => prev + 1);
      
      audio.onended = () => {
        setIsPlaying(false);
      };
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < gameData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateScore();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    gameData.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const finalScore = Math.round((correctAnswers / gameData.questions.length) * 100);
    setScore(finalScore);
    setShowResults(true);
    setTimeout(() => onComplete(finalScore), 2000);
  };

  const resetGame = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setIsPlaying(false);
    setPlayCount(0);
    setScore(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const getProgress = () => ((currentQuestionIndex + 1) / gameData.questions.length) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Game Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Headphones className="h-6 w-6 text-blue-500" />
              Listening Comprehension
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge variant="outline">
                Question {currentQuestionIndex + 1}/{gameData.questions.length}
              </Badge>
              <Badge variant="outline">
                <Volume2 className="h-4 w-4 mr-1" />
                Played: {playCount}
              </Badge>
            </div>
          </div>
          <Progress value={getProgress()} className="h-3" />
        </CardHeader>
      </Card>

      {!showResults ? (
        <>
          {/* Audio Player */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-lg">🎧 Listen Carefully</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="bg-muted/30 rounded-lg p-8">
                <Button
                  onClick={playAudio}
                  className={cn(
                    "w-20 h-20 rounded-full text-white transition-all duration-300",
                    isPlaying 
                      ? "bg-red-500 hover:bg-red-600" 
                      : "bg-blue-500 hover:bg-blue-600 hover:scale-110"
                  )}
                >
                  {isPlaying ? (
                    <Pause className="h-8 w-8" />
                  ) : (
                    <Play className="h-8 w-8" />
                  )}
                </Button>
                
                <p className="text-sm text-muted-foreground mt-4">
                  {isPlaying ? "Playing audio..." : "Click to play audio"}
                </p>
                
                {playCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Audio played {playCount} times
                  </p>
                )}
              </div>

              {/* Transcript Option (for advanced difficulty) */}
              {playCount >= 3 && (
                <Card className="animate-fade-in border-2 border-dashed border-primary/50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-primary mb-2">💡 Need help?</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      You've listened 3 times. Here's the transcript:
                    </p>
                    <div className="bg-muted/50 rounded p-3">
                      <p className="text-sm">{gameData.transcript}</p>
                      <p className="text-sm font-arabic text-right mt-2" dir="rtl">
                        {gameData.transcriptAr}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Question */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                📝 Question {currentQuestionIndex + 1}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium text-lg mb-2">{currentQuestion.question}</h3>
                <p className="text-sm text-muted-foreground font-arabic" dir="rtl">
                  {currentQuestion.questionAr}
                </p>
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswers[currentQuestionIndex] === index ? 'default' : 'outline'}
                    onClick={() => handleAnswerSelect(index)}
                    className={cn(
                      "w-full text-left justify-start h-auto p-4 transition-all duration-300",
                      selectedAnswers[currentQuestionIndex] === index && "ring-2 ring-primary",
                      "hover:scale-105"
                    )}
                  >
                    <div className="w-full">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold bg-muted rounded-full w-8 h-8 flex items-center justify-center">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-left">{option}</p>
                          <p className="text-sm text-muted-foreground font-arabic text-right" dir="rtl">
                            {currentQuestion.optionsAr[index]}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  variant="outline"
                  className="flex-1"
                >
                  ← Previous
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={selectedAnswers[currentQuestionIndex] === undefined}
                  className="flex-1"
                >
                  {currentQuestionIndex === gameData.questions.length - 1 ? 'Finish' : 'Next →'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📊 Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {gameData.questions.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "aspect-square rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-all cursor-pointer",
                      index === currentQuestionIndex ? "ring-2 ring-primary border-primary bg-primary/10" : "",
                      selectedAnswers[index] !== undefined 
                        ? "border-green-400 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300" 
                        : index < currentQuestionIndex 
                          ? "border-orange-400 bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300"
                          : "border-muted bg-muted/30"
                    )}
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    {index + 1}
                    {selectedAnswers[index] !== undefined && (
                      <CheckCircle className="h-3 w-3 absolute -top-1 -right-1 text-green-600" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Results */
        <Card className="text-center">
          <CardContent className="p-8 space-y-6">
            <div className="text-6xl animate-bounce">
              {score >= 80 ? '🎉' : score >= 60 ? '👍' : '📚'}
            </div>
            <h2 className="text-2xl font-bold text-primary">Listening Test Complete!</h2>
            <p className="text-muted-foreground font-arabic" dir="rtl">
              {score >= 80 ? 'ممتاز! أداء رائع في الاستماع' : score >= 60 ? 'جيد! استمر في التحسن' : 'تحتاج إلى مزيد من التدريب'}
            </p>
            
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <div className="text-3xl font-bold text-primary">{score}%</div>
              <div className="text-lg">
                {gameData.questions.filter((_, index) => selectedAnswers[index] === gameData.questions[index].correctAnswer).length} / {gameData.questions.length} Correct
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-lg font-bold">{playCount}</div>
                  <div className="text-xs text-muted-foreground">Times Played</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{Math.round(getProgress())}%</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">
                    {score >= 80 ? '⭐⭐⭐' : score >= 60 ? '⭐⭐' : '⭐'}
                  </div>
                  <div className="text-xs text-muted-foreground">Stars</div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={resetGame} variant="outline" className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={() => onComplete(score)} className="flex-1">
                Continue Learning
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ListeningGameComponent;
