'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, RefreshCw, Timer, Trophy, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { MemoryCardsGame } from '@/types/comprehensive-learning';

interface MemoryCardsGameProps {
  gameData: MemoryCardsGame;
  onComplete: (score: number) => void;
}

interface FlippedCard {
  index: number;
  card: typeof gameData.cards[0];
}

const MemoryCardsGameComponent: React.FC<MemoryCardsGameProps> = ({
  gameData,
  onComplete
}) => {
  const [flippedCards, setFlippedCards] = useState<FlippedCard[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [shuffledCards, setShuffledCards] = useState(gameData.cards);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setTimeElapsed(time => time + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameCompleted]);

  // Check for game completion
  useEffect(() => {
    const uniqueMatchIds = [...new Set(gameData.cards.map(card => card.matchId))];
    if (matchedPairs.length === uniqueMatchIds.length && gameStarted) {
      setGameCompleted(true);
      const score = calculateScore();
      setTimeout(() => onComplete(score), 2000);
    }
  }, [matchedPairs, gameData.cards, gameStarted, attempts, timeElapsed]);

  // Start game and shuffle cards
  const startGame = () => {
    const shuffled = [...gameData.cards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setGameStarted(true);
    setTimeElapsed(0);
    setAttempts(0);
    setFlippedCards([]);
    setMatchedPairs([]);
    setGameCompleted(false);
  };

  const calculateScore = () => {
    const baseScore = 100;
    const timePenalty = Math.min(timeElapsed * 0.5, 30); // Max 30 points penalty
    const attemptPenalty = Math.min(attempts * 2, 40); // Max 40 points penalty
    return Math.max(Math.round(baseScore - timePenalty - attemptPenalty), 10);
  };

  const handleCardClick = (index: number) => {
    if (!gameStarted || flippedCards.length >= 2 || gameCompleted) return;
    
    const card = shuffledCards[index];
    
    // Don't flip if already matched or already flipped
    if (matchedPairs.includes(card.matchId) || flippedCards.some(f => f.index === index)) {
      return;
    }

    const newFlippedCards = [...flippedCards, { index, card }];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setAttempts(attempts + 1);
      
      // Check for match
      if (newFlippedCards[0].card.matchId === newFlippedCards[1].card.matchId) {
        // Match found
        setMatchedPairs([...matchedPairs, card.matchId]);
        setFlippedCards([]);
      } else {
        // No match - flip back after delay
        setTimeout(() => {
          setFlippedCards([]);
        }, 1500);
      }
    }
  };

  const playAudio = async (text: string) => {
    try {
      const response = await fetch('/api/ai/pronounce-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: text })
      });
      
      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setFlippedCards([]);
    setMatchedPairs([]);
    setAttempts(0);
    setTimeElapsed(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isCardFlipped = (index: number) => {
    const card = shuffledCards[index];
    return flippedCards.some(f => f.index === index) || matchedPairs.includes(card.matchId);
  };

  const isCardMatched = (index: number) => {
    const card = shuffledCards[index];
    return matchedPairs.includes(card.matchId);
  };

  const getProgress = () => {
    const uniqueMatchIds = [...new Set(gameData.cards.map(card => card.matchId))];
    return (matchedPairs.length / uniqueMatchIds.length) * 100;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Game Header */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Brain className="h-6 w-6 text-indigo-500" />
              Memory Cards: {gameData.theme}
              <Badge variant="secondary" className="font-arabic">
                {gameData.themeAr}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-4">
              {gameStarted && (
                <>
                  <Badge variant="outline">
                    <Timer className="h-4 w-4 mr-1" />
                    {formatTime(timeElapsed)}
                  </Badge>
                  <Badge variant="outline">
                    Attempts: {attempts}
                  </Badge>
                </>
              )}
            </div>
          </div>
          {gameStarted && <Progress value={getProgress()} className="h-3" />}
        </CardHeader>
      </Card>

      {!gameStarted ? (
        /* Start Screen */
        <Card className="text-center">
          <CardContent className="p-8 space-y-6">
            <div className="text-6xl">🧠</div>
            <h2 className="text-2xl font-bold text-primary">Memory Card Game</h2>
            <p className="text-muted-foreground">
              Find matching pairs by flipping cards. Test your memory and learn vocabulary!
            </p>
            <p className="text-sm font-arabic text-muted-foreground" dir="rtl">
              اعثر على الأزواج المتطابقة عن طريق قلب البطاقات. اختبر ذاكرتك وتعلم المفردات!
            </p>
            
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold">Game Rules:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Click on cards to flip them</li>
                <li>• Find pairs that match each other</li>
                <li>• Complete the game in the fewest attempts and time</li>
                <li>• Listen to pronunciation by clicking the audio button</li>
              </ul>
            </div>
            
            <Button onClick={startGame} size="lg" className="px-8">
              Start Memory Game
            </Button>
          </CardContent>
        </Card>
      ) : gameCompleted ? (
        /* Completion Screen */
        <Card className="text-center">
          <CardContent className="p-8 space-y-6">
            <div className="text-6xl animate-bounce">🏆</div>
            <h2 className="text-2xl font-bold text-primary">Memory Master!</h2>
            <p className="text-muted-foreground font-arabic" dir="rtl">
              مبروك! أكملت لعبة الذاكرة بنجاح
            </p>
            
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <div className="text-3xl font-bold text-primary">{calculateScore()}%</div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold">{formatTime(timeElapsed)}</div>
                  <div className="text-xs text-muted-foreground">Time</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{attempts}</div>
                  <div className="text-xs text-muted-foreground">Attempts</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{matchedPairs.length}</div>
                  <div className="text-xs text-muted-foreground">Pairs Found</div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={resetGame} variant="outline" className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Play Again
              </Button>
              <Button onClick={() => onComplete(calculateScore())} className="flex-1">
                Continue Learning
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Game Area */
        <>
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {shuffledCards.map((card, index) => (
                  <div
                    key={index}
                    className={cn(
                      "relative aspect-square cursor-pointer transition-all duration-300",
                      !isCardFlipped(index) && "hover:scale-105"
                    )}
                    onClick={() => handleCardClick(index)}
                  >
                    <Card className={cn(
                      "h-full border-2 transition-all duration-500",
                      isCardMatched(index) ? "border-green-400 bg-green-50 dark:bg-green-950" :
                      isCardFlipped(index) ? "border-blue-400 bg-blue-50 dark:bg-blue-950" :
                      "border-muted hover:border-primary cursor-pointer"
                    )}>
                      <CardContent className="p-3 h-full flex flex-col items-center justify-center">
                        {isCardFlipped(index) ? (
                          <div className="text-center space-y-2">
                            {card.type === 'image' && card.imageUrl ? (
                              <div className="relative w-12 h-12">
                                <Image
                                  src={card.imageUrl}
                                  alt={card.content}
                                  fill
                                  className="object-cover rounded"
                                />
                              </div>
                            ) : card.type === 'sound' ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playAudio(card.content);
                                }}
                                className="p-2"
                              >
                                <Volume2 className="h-6 w-6" />
                              </Button>
                            ) : (
                              <div className="text-lg font-medium">{card.content}</div>
                            )}
                            
                            {card.contentAr && (
                              <div className="text-xs text-muted-foreground font-arabic" dir="rtl">
                                {card.contentAr}
                              </div>
                            )}
                            
                            {card.type === 'word' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playAudio(card.content);
                                }}
                                className="p-1"
                              >
                                <Volume2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 rounded flex items-center justify-center">
                            <div className="text-2xl">🃏</div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Game Stats */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-primary">{matchedPairs.length}</div>
                  <div className="text-xs text-muted-foreground">Pairs Found</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-primary">{attempts}</div>
                  <div className="text-xs text-muted-foreground">Attempts</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-primary">{formatTime(timeElapsed)}</div>
                  <div className="text-xs text-muted-foreground">Time</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-primary">{Math.round(getProgress())}%</div>
                  <div className="text-xs text-muted-foreground">Progress</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default MemoryCardsGameComponent;
