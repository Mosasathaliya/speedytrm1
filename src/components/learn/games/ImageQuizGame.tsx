'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Eye, Lightbulb, CheckCircle, XCircle, RefreshCw, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { ImageQuizGame } from '@/types/comprehensive-learning';

interface ImageQuizGameProps {
  gameData: ImageQuizGame;
  onComplete: (score: number) => void;
}

const ImageQuizGameComponent: React.FC<ImageQuizGameProps> = ({
  gameData,
  onComplete
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(gameData.images.length).fill(null));
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const currentImage = gameData.images[currentImageIndex];

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    const newAnswers = [...answers];
    newAnswers[currentImageIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentImageIndex < gameData.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setSelectedAnswer(answers[currentImageIndex + 1]);
      setShowHint(false);
    } else {
      calculateScore();
    }
  };

  const handlePrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
      setSelectedAnswer(answers[currentImageIndex - 1]);
      setShowHint(false);
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    gameData.images.forEach((image, index) => {
      const correctIndex = image.options.indexOf(image.correctAnswer);
      if (answers[index] === correctIndex) {
        correctAnswers++;
      }
    });
    
    const finalScore = Math.round((correctAnswers / gameData.images.length) * 100);
    setScore(finalScore);
    setShowResults(true);
    setTimeout(() => onComplete(finalScore), 2000);
  };

  const resetGame = () => {
    setCurrentImageIndex(0);
    setSelectedAnswer(null);
    setShowHint(false);
    setAnswers(new Array(gameData.images.length).fill(null));
    setShowResults(false);
    setScore(0);
  };

  const getProgress = () => ((currentImageIndex + 1) / gameData.images.length) * 100;

  const getCorrectAnswers = () => {
    return gameData.images.filter((image, index) => {
      const correctIndex = image.options.indexOf(image.correctAnswer);
      return answers[index] === correctIndex;
    }).length;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Game Header */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Camera className="h-6 w-6 text-orange-500" />
              Image Quiz
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge variant="outline">
                Image {currentImageIndex + 1}/{gameData.images.length}
              </Badge>
              {!showResults && (
                <Badge variant="outline">
                  Answered: {answers.filter(a => a !== null).length}
                </Badge>
              )}
            </div>
          </div>
          <Progress value={getProgress()} className="h-3" />
        </CardHeader>
      </Card>

      {!showResults ? (
        <>
          {/* Main Quiz Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image Display */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-lg">
                  📸 What do you see?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    {currentImage.url ? (
                      <Image
                        src={currentImage.url}
                        alt="Quiz image"
                        fill
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-2">
                          <Camera className="h-16 w-16 mx-auto text-muted-foreground" />
                          <p className="text-muted-foreground">Image Loading...</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hint Section */}
                  {currentImage.hint && (
                    <div className="text-center">
                      {!showHint ? (
                        <Button 
                          onClick={() => setShowHint(true)} 
                          variant="ghost" 
                          size="sm"
                          className="text-muted-foreground"
                        >
                          <Lightbulb className="h-4 w-4 mr-2" />
                          Need a hint?
                        </Button>
                      ) : (
                        <Card className="border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-950">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Lightbulb className="h-4 w-4 text-yellow-600" />
                              <span className="font-semibold text-yellow-700 dark:text-yellow-300">Hint:</span>
                            </div>
                            <p className="text-sm">{currentImage.hint}</p>
                            {currentImage.hintAr && (
                              <p className="text-sm font-arabic text-right mt-2" dir="rtl">
                                {currentImage.hintAr}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Options Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  🎯 Choose the correct answer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentImage.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === index ? 'default' : 'outline'}
                    onClick={() => handleAnswerSelect(index)}
                    className={cn(
                      "w-full text-left justify-start h-auto p-4 transition-all duration-300",
                      selectedAnswer === index && "ring-2 ring-primary",
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
                          {currentImage.optionsAr && currentImage.optionsAr[index] && (
                            <p className="text-sm text-muted-foreground font-arabic text-right" dir="rtl">
                              {currentImage.optionsAr[index]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handlePrevious}
                    disabled={currentImageIndex === 0}
                    variant="outline"
                    className="flex-1"
                  >
                    ← Previous
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={selectedAnswer === null}
                    className="flex-1"
                  >
                    {currentImageIndex === gameData.images.length - 1 ? 'Finish Quiz' : 'Next →'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📊 Quiz Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {gameData.images.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "aspect-square rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-all cursor-pointer",
                      index === currentImageIndex ? "ring-2 ring-primary border-primary bg-primary/10" : "",
                      answers[index] !== null 
                        ? "border-green-400 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300" 
                        : "border-muted bg-muted/30"
                    )}
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setSelectedAnswer(answers[index]);
                      setShowHint(false);
                    }}
                  >
                    {index + 1}
                    {answers[index] !== null && (
                      <CheckCircle className="h-3 w-3 absolute -top-1 -right-1 text-green-600" />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-center text-sm text-muted-foreground">
                {answers.filter(a => a !== null).length} of {gameData.images.length} images answered
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
            <h2 className="text-2xl font-bold text-primary">Image Quiz Complete!</h2>
            <p className="text-muted-foreground font-arabic" dir="rtl">
              {score >= 80 ? 'ممتاز! أداء رائع في التعرف على الصور' : score >= 60 ? 'جيد! استمر في التحسن' : 'تحتاج إلى مزيد من التدريب'}
            </p>
            
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <div className="text-3xl font-bold text-primary">{score}%</div>
              <div className="text-lg">
                {getCorrectAnswers()} / {gameData.images.length} Correct Answers
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-lg font-bold">{getCorrectAnswers()}</div>
                  <div className="text-xs text-muted-foreground">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{gameData.images.length - getCorrectAnswers()}</div>
                  <div className="text-xs text-muted-foreground">Incorrect</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">
                    {score >= 80 ? '⭐⭐⭐' : score >= 60 ? '⭐⭐' : '⭐'}
                  </div>
                  <div className="text-xs text-muted-foreground">Stars</div>
                </div>
              </div>
            </div>
            
            {/* Detailed Results */}
            <Card className="text-left">
              <CardHeader>
                <CardTitle className="text-lg text-center">📝 Detailed Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {gameData.images.map((image, index) => {
                    const correctIndex = image.options.indexOf(image.correctAnswer);
                    const userAnswer = answers[index];
                    const isCorrect = userAnswer === correctIndex;
                    
                    return (
                      <div
                        key={index}
                        className={cn(
                          "p-3 rounded-lg border",
                          isCorrect ? "border-green-400 bg-green-50 dark:bg-green-950" : "border-red-400 bg-red-50 dark:bg-red-950"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">Image {index + 1}</p>
                            <p className="text-sm text-muted-foreground">
                              Correct: {image.correctAnswer}
                              {!isCorrect && userAnswer !== null && (
                                <span> | Your answer: {image.options[userAnswer]}</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
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
    </div>
  );
};

export default ImageQuizGameComponent;
