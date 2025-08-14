'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Mic, Volume2, CheckCircle, XCircle, RefreshCw, Lightbulb, PenTool } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SpellingGame } from '@/types/comprehensive-learning';

interface SpellingGameProps {
  gameData: SpellingGame;
  onComplete: (score: number) => void;
}

const SpellingGameComponent: React.FC<SpellingGameProps> = ({
  gameData,
  onComplete
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wordResults, setWordResults] = useState<boolean[]>([]);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showDefinition, setShowDefinition] = useState(true);

  const currentWord = gameData.words[currentWordIndex];

  useEffect(() => {
    // Auto-play audio when word changes (for dictation mode)
    if (gameData.gameMode === 'dictation') {
      playWordAudio();
    }
  }, [currentWordIndex, gameData.gameMode]);

  const playWordAudio = async () => {
    try {
      const response = await fetch('/api/ai/pronounce-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: currentWord.word })
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

  const checkSpelling = () => {
    const isCorrect = userInput.toLowerCase().trim() === currentWord.word.toLowerCase();
    setAttempts(attempts + 1);
    
    const newResults = [...wordResults];
    newResults[currentWordIndex] = isCorrect;
    setWordResults(newResults);

    if (isCorrect) {
      setCorrectAnswers(correctAnswers + 1);
    }

    // Move to next word or complete game
    setTimeout(() => {
      if (currentWordIndex < gameData.words.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
        setUserInput('');
        setShowHint(false);
        setShowDefinition(gameData.gameMode !== 'dictation');
      } else {
        setGameCompleted(true);
        const finalScore = Math.round((correctAnswers + (isCorrect ? 1 : 0)) / gameData.words.length * 100);
        setTimeout(() => onComplete(finalScore), 2000);
      }
    }, 1500);

    return isCorrect;
  };

  const skipWord = () => {
    const newResults = [...wordResults];
    newResults[currentWordIndex] = false;
    setWordResults(newResults);

    if (currentWordIndex < gameData.words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setUserInput('');
      setShowHint(false);
      setShowDefinition(gameData.gameMode !== 'dictation');
    } else {
      setGameCompleted(true);
      const finalScore = Math.round(correctAnswers / gameData.words.length * 100);
      setTimeout(() => onComplete(finalScore), 2000);
    }
  };

  const resetGame = () => {
    setCurrentWordIndex(0);
    setUserInput('');
    setShowHint(false);
    setAttempts(0);
    setCorrectAnswers(0);
    setWordResults([]);
    setGameCompleted(false);
    setShowDefinition(gameData.gameMode !== 'dictation');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && userInput.trim()) {
      checkSpelling();
    }
  };

  const getScrambledWord = () => {
    if (gameData.gameMode !== 'scrambled') return '';
    const letters = currentWord.word.split('');
    return letters.sort(() => Math.random() - 0.5).join('');
  };

  const getFillBlanksDisplay = () => {
    if (gameData.gameMode !== 'fill-blanks') return '';
    const word = currentWord.word;
    const blanksCount = Math.ceil(word.length * 0.3); // 30% of letters as blanks
    const positions = [];
    
    // Select random positions for blanks
    while (positions.length < blanksCount) {
      const pos = Math.floor(Math.random() * word.length);
      if (!positions.includes(pos)) {
        positions.push(pos);
      }
    }
    
    return word.split('').map((letter, index) => 
      positions.includes(index) ? '_' : letter
    ).join(' ');
  };

  const getProgress = () => ((currentWordIndex + 1) / gameData.words.length) * 100;

  const getGameModeTitle = () => {
    switch (gameData.gameMode) {
      case 'dictation': return '🎧 Listen & Spell';
      case 'fill-blanks': return '📝 Fill the Blanks';
      case 'scrambled': return '🔤 Unscramble Letters';
      default: return '✏️ Spelling Practice';
    }
  };

  const getGameModeDescription = () => {
    switch (gameData.gameMode) {
      case 'dictation': return 'Listen to the word and spell it correctly';
      case 'fill-blanks': return 'Complete the missing letters in the word';
      case 'scrambled': return 'Unscramble the letters to form the correct word';
      default: return 'Spell the word correctly';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Game Header */}
      <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <PenTool className="h-6 w-6 text-cyan-500" />
              {getGameModeTitle()}
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge variant="outline">
                Word {currentWordIndex + 1}/{gameData.words.length}
              </Badge>
              <Badge variant="outline">
                Score: {correctAnswers}/{Math.max(currentWordIndex, wordResults.length)}
              </Badge>
            </div>
          </div>
          <Progress value={getProgress()} className="h-3" />
        </CardHeader>
      </Card>

      {!gameCompleted ? (
        <>
          {/* Main Spelling Area */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-lg">
                {getGameModeDescription()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Word Information */}
              <div className="text-center space-y-4">
                {/* Audio Controls */}
                <div className="space-y-3">
                  <Button
                    onClick={playWordAudio}
                    className="w-20 h-20 rounded-full text-white bg-blue-500 hover:bg-blue-600 hover:scale-110 transition-all duration-300"
                  >
                    <Volume2 className="h-8 w-8" />
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Click to hear the word pronunciation
                  </p>
                </div>

                {/* Definition (show based on game mode) */}
                {showDefinition && (
                  <div className="bg-muted/30 rounded-lg p-4 max-w-md mx-auto">
                    <h3 className="font-semibold mb-2">💡 Definition:</h3>
                    <p className="text-lg">{currentWord.definition}</p>
                    <p className="text-sm text-muted-foreground font-arabic mt-2" dir="rtl">
                      {currentWord.definitionAr}
                    </p>
                  </div>
                )}

                {/* Game Mode Specific Display */}
                {gameData.gameMode === 'scrambled' && (
                  <div className="bg-yellow-50 dark:bg-yellow-950 rounded-lg p-4 max-w-md mx-auto">
                    <h3 className="font-semibold mb-2">🔤 Scrambled Letters:</h3>
                    <div className="text-2xl font-mono font-bold tracking-widest">
                      {getScrambledWord()}
                    </div>
                  </div>
                )}

                {gameData.gameMode === 'fill-blanks' && (
                  <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 max-w-md mx-auto">
                    <h3 className="font-semibold mb-2">📝 Fill the Blanks:</h3>
                    <div className="text-2xl font-mono font-bold tracking-widest">
                      {getFillBlanksDisplay()}
                    </div>
                  </div>
                )}

                {/* Difficulty Indicator */}
                <Badge variant={
                  currentWord.difficulty <= 3 ? "secondary" : 
                  currentWord.difficulty <= 7 ? "default" : "destructive"
                }>
                  Difficulty: {currentWord.difficulty}/10
                </Badge>
              </div>

              {/* Input Area */}
              <div className="max-w-sm mx-auto space-y-4">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type the spelling here..."
                  className="text-center text-xl font-medium"
                  autoFocus
                />

                <div className="flex gap-3">
                  <Button onClick={checkSpelling} disabled={!userInput.trim()} className="flex-1">
                    Check Spelling
                  </Button>
                  <Button onClick={skipWord} variant="outline">
                    Skip
                  </Button>
                </div>
              </div>

              {/* Hint Section */}
              {currentWord.hint && (
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
                    <Card className="max-w-md mx-auto border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-950">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-yellow-600" />
                          <span className="font-semibold text-yellow-700 dark:text-yellow-300">Hint:</span>
                        </div>
                        <p className="text-sm">{currentWord.hint}</p>
                        {currentWord.hintAr && (
                          <p className="text-sm font-arabic text-right mt-2" dir="rtl">
                            {currentWord.hintAr}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📊 Spelling Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {gameData.words.map((word, index) => (
                  <div
                    key={index}
                    className={cn(
                      "aspect-square rounded-lg border-2 flex items-center justify-center text-xs font-medium transition-all",
                      index === currentWordIndex ? "ring-2 ring-primary border-primary bg-primary/10" : "",
                      wordResults[index] === true 
                        ? "border-green-400 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300" 
                        : wordResults[index] === false
                          ? "border-red-400 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300"
                          : "border-muted bg-muted/30"
                    )}
                  >
                    {index + 1}
                    {wordResults[index] === true && (
                      <CheckCircle className="h-3 w-3 absolute -top-1 -right-1 text-green-600" />
                    )}
                    {wordResults[index] === false && (
                      <XCircle className="h-3 w-3 absolute -top-1 -right-1 text-red-600" />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-center text-sm text-muted-foreground">
                {wordResults.length} of {gameData.words.length} words attempted
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Game Completion */
        <Card className="text-center">
          <CardContent className="p-8 space-y-6">
            <div className="text-6xl animate-bounce">
              {correctAnswers === gameData.words.length ? '🏆' : correctAnswers >= gameData.words.length * 0.8 ? '🎉' : '📚'}
            </div>
            <h2 className="text-2xl font-bold text-primary">Spelling Test Complete!</h2>
            <p className="text-muted-foreground font-arabic" dir="rtl">
              {correctAnswers === gameData.words.length ? 'ممتاز! تهجئة مثالية!' : 
               correctAnswers >= gameData.words.length * 0.8 ? 'جيد جداً! أداء رائع' : 
               'جيد! استمر في التدريب'}
            </p>
            
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <div className="text-3xl font-bold text-primary">
                {Math.round((correctAnswers / gameData.words.length) * 100)}%
              </div>
              <div className="text-lg">
                {correctAnswers} / {gameData.words.length} Words Spelled Correctly
              </div>
              <div className="text-sm text-muted-foreground">
                Total Attempts: {attempts}
              </div>
            </div>
            
            {/* Detailed Results */}
            <Card className="text-left max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-lg text-center">📝 Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {gameData.words.map((word, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded",
                        wordResults[index] ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950"
                      )}
                    >
                      {wordResults[index] ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-medium">{word.word}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <div className="flex gap-3">
              <Button onClick={resetGame} variant="outline" className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Practice Again
              </Button>
              <Button 
                onClick={() => onComplete(Math.round((correctAnswers / gameData.words.length) * 100))} 
                className="flex-1"
              >
                Continue Learning
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SpellingGameComponent;
