'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Timer, Trophy, Star, RefreshCw, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VocabularyMatchingGame } from '@/types/comprehensive-learning';

interface VocabularyMatchingGameProps {
  gameData: VocabularyMatchingGame;
  onComplete: (score: number) => void;
  onGameGenerate?: () => void;
}

interface SelectedPair {
  english: string;
  arabic: string;
}

interface MatchedPair {
  english: string;
  arabic: string;
  isCorrect: boolean;
}

const VocabularyMatchingGame: React.FC<VocabularyMatchingGameProps> = ({
  gameData,
  onComplete,
  onGameGenerate
}) => {
  const [selectedEnglish, setSelectedEnglish] = useState<string | null>(null);
  const [selectedArabic, setSelectedArabic] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<MatchedPair[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [gameState, setGameState] = useState<'playing' | 'completed' | 'failed'>('playing');
  const [showCelebration, setShowCelebration] = useState(false);

  // Shuffle arrays for randomization
  const shuffledEnglish = [...gameData.pairs].sort(() => Math.random() - 0.5);
  const shuffledArabic = [...gameData.pairs].sort(() => Math.random() - 0.5);

  useEffect(() => {
    if (timeLeft > 0 && gameState === 'playing') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameState('failed');
    }
  }, [timeLeft, gameState]);

  useEffect(() => {
    if (matchedPairs.length === gameData.pairs.length) {
      setGameState('completed');
      setShowCelebration(true);
      const finalScore = Math.round((score / gameData.pairs.length) * 100);
      setTimeout(() => onComplete(finalScore), 2000);
    }
  }, [matchedPairs, gameData.pairs.length, score, onComplete]);

  const handleEnglishClick = (word: string) => {
    if (matchedPairs.some(pair => pair.english === word)) return;
    
    setSelectedEnglish(word);
    if (selectedArabic) {
      checkMatch(word, selectedArabic);
    }
  };

  const handleArabicClick = (word: string) => {
    if (matchedPairs.some(pair => pair.arabic === word)) return;
    
    setSelectedArabic(word);
    if (selectedEnglish) {
      checkMatch(selectedEnglish, word);
    }
  };

  const checkMatch = (english: string, arabic: string) => {
    setAttempts(attempts + 1);
    const pair = gameData.pairs.find(p => p.english === english && p.arabic === arabic);
    
    if (pair) {
      setMatchedPairs([...matchedPairs, { english, arabic, isCorrect: true }]);
      setScore(score + 1);
      setSelectedEnglish(null);
      setSelectedArabic(null);
    } else {
      // Show incorrect feedback
      setTimeout(() => {
        setSelectedEnglish(null);
        setSelectedArabic(null);
      }, 1000);
    }
  };

  const playPronunciation = async (word: string) => {
    try {
      const response = await fetch('/api/ai/pronounce-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word })
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

  const resetGame = () => {
    setSelectedEnglish(null);
    setSelectedArabic(null);
    setMatchedPairs([]);
    setScore(0);
    setAttempts(0);
    setTimeLeft(300);
    setGameState('playing');
    setShowCelebration(false);
    if (onGameGenerate) onGameGenerate();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isMatched = (word: string, type: 'english' | 'arabic') => {
    return matchedPairs.some(pair => pair[type] === word);
  };

  const isSelected = (word: string, type: 'english' | 'arabic') => {
    return type === 'english' ? selectedEnglish === word : selectedArabic === word;
  };

  const getProgress = () => (matchedPairs.length / gameData.pairs.length) * 100;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Game Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              🎯 {gameData.theme}
              <Badge variant="secondary" className="text-sm font-arabic">
                {gameData.themeAr}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Timer className="h-4 w-4" />
                {formatTime(timeLeft)}
              </Badge>
              <Badge variant="outline">
                <Trophy className="h-4 w-4 mr-1" />
                {score}/{gameData.pairs.length}
              </Badge>
            </div>
          </div>
          <Progress value={getProgress()} className="h-3" />
        </CardHeader>
      </Card>

      {/* Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* English Words */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-lg">
              🇺🇸 English Words
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {shuffledEnglish.map((pair, index) => (
                <Button
                  key={`english-${index}`}
                  variant={isMatched(pair.english, 'english') ? 'default' : 
                          isSelected(pair.english, 'english') ? 'secondary' : 'outline'}
                  onClick={() => handleEnglishClick(pair.english)}
                  disabled={isMatched(pair.english, 'english') || gameState !== 'playing'}
                  className={cn(
                    "h-16 text-sm font-medium transition-all duration-300 relative group",
                    isMatched(pair.english, 'english') && "bg-green-500 hover:bg-green-600 text-white animate-pulse",
                    isSelected(pair.english, 'english') && "ring-2 ring-blue-400 animate-bounce",
                    "hover:scale-105"
                  )}
                >
                  <div className="text-center">
                    <div className="text-lg mb-1">{pair.emoji}</div>
                    <div>{pair.english}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-1 right-1 p-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      playPronunciation(pair.english);
                    }}
                  >
                    <Volume2 className="h-3 w-3" />
                  </Button>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Arabic Words */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-lg">
              🇸🇦 Arabic Words
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {shuffledArabic.map((pair, index) => (
                <Button
                  key={`arabic-${index}`}
                  variant={isMatched(pair.arabic, 'arabic') ? 'default' : 
                          isSelected(pair.arabic, 'arabic') ? 'secondary' : 'outline'}
                  onClick={() => handleArabicClick(pair.arabic)}
                  disabled={isMatched(pair.arabic, 'arabic') || gameState !== 'playing'}
                  className={cn(
                    "h-16 text-sm font-medium transition-all duration-300 font-arabic",
                    isMatched(pair.arabic, 'arabic') && "bg-green-500 hover:bg-green-600 text-white animate-pulse",
                    isSelected(pair.arabic, 'arabic') && "ring-2 ring-blue-400 animate-bounce",
                    "hover:scale-105"
                  )}
                  dir="rtl"
                >
                  <div className="text-center">
                    <div className="text-lg mb-1">{pair.emoji}</div>
                    <div>{pair.arabic}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Game Over Overlay */}
      {gameState !== 'playing' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center space-y-4">
              {gameState === 'completed' ? (
                <>
                  <div className={cn("text-6xl mb-4", showCelebration && "animate-bounce")}>
                    🎉
                  </div>
                  <h2 className="text-2xl font-bold text-green-600">Congratulations!</h2>
                  <p className="text-muted-foreground font-arabic" dir="rtl">
                    مبروك! أكملت اللعبة بنجاح
                  </p>
                  <div className="flex justify-center gap-2">
                    {[...Array(3)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-8 w-8 transition-all duration-500",
                          i < Math.floor(score / gameData.pairs.length * 3) + 1 
                            ? "text-yellow-400 fill-yellow-400" 
                            : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                  <p>Score: {Math.round((score / gameData.pairs.length) * 100)}%</p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">⏰</div>
                  <h2 className="text-2xl font-bold text-red-600">Time's Up!</h2>
                  <p className="text-muted-foreground font-arabic" dir="rtl">
                    انتهى الوقت! جرب مرة أخرى
                  </p>
                  <p>Score: {score}/{gameData.pairs.length}</p>
                </>
              )}
              
              <div className="flex gap-3 pt-4">
                <Button onClick={resetGame} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Play Again
                </Button>
                {gameState === 'completed' && (
                  <Button variant="outline" onClick={() => onComplete(Math.round((score / gameData.pairs.length) * 100))}>
                    Continue
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <style jsx>{`
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        
        .animate-sparkle {
          animation: sparkle 1s ease-in-out infinite;
        }
        
        .game-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        
        .match-success {
          animation: matchSuccess 0.6s ease-out;
        }
        
        @keyframes matchSuccess {
          0% { transform: scale(1); background-color: rgb(34 197 94); }
          50% { transform: scale(1.1); background-color: rgb(22 163 74); }
          100% { transform: scale(1); background-color: rgb(34 197 94); }
        }
      `}</style>
    </div>
  );
};

export default VocabularyMatchingGame;
