'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Puzzle, Eye, Lightbulb, CheckCircle, XCircle, RefreshCw, Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WordPuzzleGame } from '@/types/comprehensive-learning';

interface WordPuzzleGameProps {
  gameData: WordPuzzleGame;
  onComplete: (score: number) => void;
}

const WordPuzzleGameComponent: React.FC<WordPuzzleGameProps> = ({
  gameData,
  onComplete
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [solvedWords, setSolvedWords] = useState<boolean[]>(new Array(gameData.words.length).fill(false));
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);

  const currentWord = gameData.words[currentWordIndex];

  useEffect(() => {
    // Scramble the current word letters
    if (currentWord) {
      const letters = currentWord.word.split('');
      const scrambled = [...letters].sort(() => Math.random() - 0.5);
      setScrambledLetters(scrambled);
    }
  }, [currentWord]);

  const checkAnswer = () => {
    const isCorrect = userAnswer.toLowerCase().trim() === currentWord.word.toLowerCase();
    setAttempts(attempts + 1);

    if (isCorrect) {
      setSolvedWords(prev => {
        const newSolved = [...prev];
        newSolved[currentWordIndex] = true;
        return newSolved;
      });
      setScore(score + (showHint ? 5 : 10)); // Lower points if hint was used
      
      // Move to next word or complete game
      if (currentWordIndex < gameData.words.length - 1) {
        setTimeout(() => {
          setCurrentWordIndex(currentWordIndex + 1);
          setUserAnswer('');
          setShowHint(false);
        }, 1500);
      } else {
        setGameCompleted(true);
        const finalScore = Math.round((score + (showHint ? 5 : 10)) / (gameData.words.length * 10) * 100);
        setTimeout(() => onComplete(finalScore), 2000);
      }
    }

    return isCorrect;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  const scrambleAgain = () => {
    const letters = currentWord.word.split('');
    const scrambled = [...letters].sort(() => Math.random() - 0.5);
    setScrambledLetters(scrambled);
  };

  const addLetterToAnswer = (letter: string, index: number) => {
    setUserAnswer(prev => prev + letter);
  };

  const clearAnswer = () => {
    setUserAnswer('');
  };

  const skipWord = () => {
    if (currentWordIndex < gameData.words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setUserAnswer('');
      setShowHint(false);
    }
  };

  const resetGame = () => {
    setCurrentWordIndex(0);
    setUserAnswer('');
    setSolvedWords(new Array(gameData.words.length).fill(false));
    setShowHint(false);
    setAttempts(0);
    setScore(0);
    setGameCompleted(false);
  };

  const getProgress = () => (solvedWords.filter(Boolean).length / gameData.words.length) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Game Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Puzzle className="h-6 w-6 text-purple-500" />
              {gameData.title}
              <Badge variant="secondary" className="font-arabic">
                {gameData.titleAr}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge variant="outline">
                Word {currentWordIndex + 1}/{gameData.words.length}
              </Badge>
              <Badge variant="outline">
                Score: {score}
              </Badge>
            </div>
          </div>
          <Progress value={getProgress()} className="h-3" />
        </CardHeader>
      </Card>

      {!gameCompleted ? (
        <>
          {/* Current Word Puzzle */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-lg">
                🧩 Unscramble the Word
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Clue */}
              <div className="text-center space-y-4">
                <div className="bg-muted/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">💡 Clue:</h3>
                  <p className="text-lg">{currentWord.clue}</p>
                  <p className="text-sm text-muted-foreground font-arabic mt-2" dir="rtl">
                    {currentWord.clueAr}
                  </p>
                </div>

                {/* Scrambled Letters */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium">Scrambled Letters:</h4>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {scrambledLetters.map((letter, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => addLetterToAnswer(letter, index)}
                        className={cn(
                          "w-12 h-12 text-lg font-bold transition-all duration-200",
                          "hover:scale-110 hover:bg-primary hover:text-primary-foreground"
                        )}
                      >
                        {letter.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={scrambleAgain} 
                    variant="ghost" 
                    size="sm"
                    className="text-muted-foreground"
                  >
                    <Shuffle className="h-4 w-4 mr-2" />
                    Shuffle Again
                  </Button>
                </div>

                {/* Answer Input */}
                <div className="space-y-4">
                  <div className="max-w-sm mx-auto">
                    <Input
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your answer..."
                      className="text-center text-lg font-medium"
                      autoFocus
                    />
                  </div>
                  
                  <div className="flex gap-3 justify-center">
                    <Button onClick={clearAnswer} variant="outline" size="sm">
                      Clear
                    </Button>
                    <Button 
                      onClick={checkAnswer} 
                      disabled={!userAnswer.trim()}
                      className="px-8"
                    >
                      Check Answer
                    </Button>
                  </div>
                </div>

                {/* Hint Section */}
                {!showHint ? (
                  <Button 
                    onClick={() => setShowHint(true)} 
                    variant="ghost" 
                    size="sm"
                    className="text-muted-foreground"
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Need a hint? (-5 points)
                  </Button>
                ) : (
                  <Card className="max-w-md mx-auto border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-950">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-yellow-600" />
                        <span className="font-semibold text-yellow-700 dark:text-yellow-300">Hint:</span>
                      </div>
                      <p className="text-sm">{currentWord.hint}</p>
                      <p className="text-sm font-arabic text-right mt-2" dir="rtl">
                        {currentWord.hintAr}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={skipWord} 
                    variant="outline"
                    disabled={currentWordIndex === gameData.words.length - 1}
                  >
                    Skip Word
                  </Button>
                  <Button onClick={() => setShowHint(!showHint)} variant="ghost">
                    <Eye className="h-4 w-4 mr-2" />
                    {showHint ? 'Hide Hint' : 'Show Hint'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📊 Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-3">
                {gameData.words.map((word, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-3 rounded-lg border-2 text-center transition-all cursor-pointer",
                      index === currentWordIndex ? "ring-2 ring-primary" : "",
                      solvedWords[index] 
                        ? "border-green-400 bg-green-50 dark:bg-green-950" 
                        : "border-muted bg-muted/30"
                    )}
                    onClick={() => setCurrentWordIndex(index)}
                  >
                    <div className="text-xs font-medium truncate mb-2" title={word.word}>
                      Word {index + 1}
                    </div>
                    <div className="flex justify-center">
                      {solvedWords[index] ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : index === currentWordIndex ? (
                        <div className="h-5 w-5 border-2 border-primary rounded-full animate-pulse" />
                      ) : (
                        <div className="h-5 w-5 border-2 border-muted rounded-full" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center text-sm text-muted-foreground">
                {solvedWords.filter(Boolean).length} of {gameData.words.length} words solved
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Game Completion */
        <Card className="text-center">
          <CardContent className="p-8 space-y-6">
            <div className="text-6xl animate-bounce">🧩</div>
            <h2 className="text-2xl font-bold text-primary">Puzzle Complete!</h2>
            <p className="text-muted-foreground font-arabic" dir="rtl">
              مبروك! أكملت جميع الألغاز بنجاح
            </p>
            
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <div className="text-3xl font-bold text-primary">
                {Math.round((score / (gameData.words.length * 10)) * 100)}%
              </div>
              <div className="text-lg">
                {solvedWords.filter(Boolean).length} / {gameData.words.length} Words Solved
              </div>
              <div className="text-sm text-muted-foreground">
                Total Score: {score} points
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-lg font-bold">{attempts}</div>
                  <div className="text-xs text-muted-foreground">Total Attempts</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{solvedWords.filter(Boolean).length}</div>
                  <div className="text-xs text-muted-foreground">Words Solved</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{score}</div>
                  <div className="text-xs text-muted-foreground">Final Score</div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={resetGame} variant="outline" className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Play Again
              </Button>
              <Button 
                onClick={() => onComplete(Math.round((score / (gameData.words.length * 10)) * 100))} 
                className="flex-1"
              >
                Continue Learning
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <style jsx>{`
        @keyframes bounce-in {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default WordPuzzleGameComponent;
