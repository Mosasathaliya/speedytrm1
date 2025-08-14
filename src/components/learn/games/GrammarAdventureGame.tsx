'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, BookOpen, CheckCircle, XCircle, RefreshCw, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { GrammarAdventureGame } from '@/types/comprehensive-learning';

interface GrammarAdventureGameProps {
  gameData: GrammarAdventureGame;
  onComplete: (score: number) => void;
  onGenerateNew?: () => void;
}

interface GameState {
  currentScene: number;
  selectedAnswer: number | null;
  showFeedback: boolean;
  isCorrect: boolean;
  score: number;
  totalQuestions: number;
}

const GrammarAdventureGame: React.FC<GrammarAdventureGameProps> = ({
  gameData,
  onComplete,
  onGenerateNew
}) => {
  const [gameState, setGameState] = useState<GameState>({
    currentScene: 1,
    selectedAnswer: null,
    showFeedback: false,
    isCorrect: false,
    score: 0,
    totalQuestions: 5 // Can be dynamic based on adventure length
  });

  const [animationState, setAnimationState] = useState<'entering' | 'idle' | 'leaving'>('entering');
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    setAnimationState('idle');
  }, []);

  const handleAnswerSelect = (optionIndex: number) => {
    if (gameState.showFeedback) return;

    const isCorrect = gameData.options[optionIndex].isCorrect;
    setGameState(prev => ({
      ...prev,
      selectedAnswer: optionIndex,
      showFeedback: true,
      isCorrect
    }));

    // Update score if correct
    if (isCorrect) {
      setGameState(prev => ({
        ...prev,
        score: prev.score + 1
      }));
    }
  };

  const handleNextScene = () => {
    if (gameState.currentScene >= gameState.totalQuestions) {
      // Game completed
      setShowCelebration(true);
      const finalScore = Math.round((gameState.score / gameState.totalQuestions) * 100);
      setTimeout(() => onComplete(finalScore), 2000);
      return;
    }

    setAnimationState('leaving');
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        currentScene: prev.currentScene + 1,
        selectedAnswer: null,
        showFeedback: false,
        isCorrect: false
      }));
      setAnimationState('entering');
      // Generate new scene data here if needed
      if (onGenerateNew) onGenerateNew();
    }, 500);
  };

  const resetGame = () => {
    setGameState({
      currentScene: 1,
      selectedAnswer: null,
      showFeedback: false,
      isCorrect: false,
      score: 0,
      totalQuestions: 5
    });
    setAnimationState('entering');
    setShowCelebration(false);
    if (onGenerateNew) onGenerateNew();
  };

  const playPronunciation = async (text: string) => {
    try {
      const response = await fetch('/api/ai/pronounce-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: text.split(' ')[0] }) // Pronounce first word
      });
      
      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch (error) {
      console.error('Pronunciation error:', error);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Game Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-500" />
              Grammar Adventure
              <Badge variant="secondary">Scene {gameState.currentScene}</Badge>
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge variant="outline">
                <BookOpen className="h-4 w-4 mr-1" />
                Score: {gameState.score}/{gameState.totalQuestions}
              </Badge>
            </div>
          </div>
          <Progress 
            value={(gameState.currentScene / gameState.totalQuestions) * 100} 
            className="h-3" 
          />
        </CardHeader>
      </Card>

      {/* Main Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Story Scene */}
        <Card className={cn(
          "relative overflow-hidden transition-all duration-500",
          animationState === 'entering' && "animate-slide-in-left",
          animationState === 'leaving' && "animate-slide-out-right"
        )}>
          {gameData.imageUrl && (
            <div className="relative h-64 w-full">
              <Image
                src={gameData.imageUrl}
                alt="Adventure scene"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-4 right-4 opacity-75 hover:opacity-100"
                onClick={() => playPronunciation(gameData.story)}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <CardContent className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">
                📖 The Adventure Continues...
              </h3>
              <p className="text-foreground leading-relaxed">
                {gameData.story}
              </p>
              <p className="text-muted-foreground font-arabic text-right" dir="rtl">
                {gameData.storyAr}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Grammar Challenge */}
        <Card className={cn(
          "relative transition-all duration-500",
          animationState === 'entering' && "animate-slide-in-right",
          animationState === 'leaving' && "animate-slide-out-left",
          gameState.showFeedback && gameState.isCorrect && "ring-2 ring-green-400",
          gameState.showFeedback && !gameState.isCorrect && "ring-2 ring-red-400"
        )}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              ⚔️ Grammar Challenge
              <Button
                size="sm"
                variant="ghost"
                onClick={() => playPronunciation(gameData.question)}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium text-lg mb-2">{gameData.question}</p>
              <p className="text-sm text-muted-foreground font-arabic" dir="rtl">
                {gameData.questionAr}
              </p>
            </div>

            <div className="space-y-3">
              {gameData.options.map((option, index) => (
                <Button
                  key={index}
                  variant={
                    gameState.selectedAnswer === index
                      ? gameState.isCorrect
                        ? 'default'
                        : 'destructive'
                      : 'outline'
                  }
                  onClick={() => handleAnswerSelect(index)}
                  disabled={gameState.showFeedback}
                  className={cn(
                    "w-full text-left justify-start h-auto p-4 transition-all duration-300",
                    gameState.selectedAnswer === index && gameState.isCorrect && "bg-green-500 hover:bg-green-600 animate-pulse",
                    gameState.selectedAnswer === index && !gameState.isCorrect && "bg-red-500 hover:bg-red-600 animate-shake",
                    "hover:scale-105"
                  )}
                >
                  <div className="w-full">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <div className="flex-1">
                        <p className="font-medium">{option.text}</p>
                        <p className="text-sm text-muted-foreground font-arabic" dir="rtl">
                          {option.textAr}
                        </p>
                      </div>
                      {gameState.showFeedback && gameState.selectedAnswer === index && (
                        gameState.isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )
                      )}
                    </div>
                  </div>
                </Button>
              ))}
            </div>

            {/* Feedback Section */}
            {gameState.showFeedback && (
              <Card className={cn(
                "mt-6 border-2 transition-all duration-500 animate-fade-in",
                gameState.isCorrect ? "border-green-400 bg-green-50 dark:bg-green-950" : "border-red-400 bg-red-50 dark:bg-red-950"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {gameState.isCorrect ? (
                      <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-2">
                      <h4 className={cn(
                        "font-semibold",
                        gameState.isCorrect ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
                      )}>
                        {gameState.isCorrect ? "Correct! Well done!" : "Not quite right!"}
                      </h4>
                      <p className="text-sm">{gameData.explanation}</p>
                      <p className="text-sm text-muted-foreground font-arabic" dir="rtl">
                        {gameData.explanationAr}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-3">
                    <Button 
                      onClick={handleNextScene}
                      className="flex-1"
                      disabled={gameState.currentScene >= gameState.totalQuestions && showCelebration}
                    >
                      {gameState.currentScene >= gameState.totalQuestions ? 'Complete Adventure!' : 'Next Scene'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={resetGame}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Restart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Completion Celebration */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center space-y-6">
              <div className="text-6xl animate-bounce">🏆</div>
              <h2 className="text-2xl font-bold text-primary">Adventure Complete!</h2>
              <p className="text-muted-foreground font-arabic" dir="rtl">
                مبروك! أنهيت المغامرة بنجاح
              </p>
              
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-lg font-semibold">
                  Final Score: {Math.round((gameState.score / gameState.totalQuestions) * 100)}%
                </p>
                <p className="text-sm text-muted-foreground">
                  {gameState.score} out of {gameState.totalQuestions} correct
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button onClick={resetGame} variant="outline" className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  New Adventure
                </Button>
                <Button 
                  onClick={() => onComplete(Math.round((gameState.score / gameState.totalQuestions) * 100))}
                  className="flex-1"
                >
                  Continue Learning
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-out-left {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(-100px); }
        }
        
        @keyframes slide-out-right {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(100px); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-slide-in-left { animation: slide-in-left 0.5s ease-out; }
        .animate-slide-in-right { animation: slide-in-right 0.5s ease-out; }
        .animate-slide-out-left { animation: slide-out-left 0.5s ease-in; }
        .animate-slide-out-right { animation: slide-out-right 0.5s ease-in; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
      `}</style>
    </div>
  );
};

export default GrammarAdventureGame;
