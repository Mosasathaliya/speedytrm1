'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Eye, Volume2, Lightbulb, ArrowRight, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { StoryBuilderGame } from '@/types/comprehensive-learning';

interface StoryBuilderGameProps {
  gameData: StoryBuilderGame;
  onComplete: (score: number) => void;
  onGenerateNext?: (choice: string) => void;
}

interface GameState {
  currentScene: number;
  selectedChoice: number | null;
  storyProgress: string[];
  vocabularyLearned: string[];
  showVocabulary: boolean;
  score: number;
  totalScenes: number;
}

const StoryBuilderGame: React.FC<StoryBuilderGameProps> = ({
  gameData,
  onComplete,
  onGenerateNext
}) => {
  const [gameState, setGameState] = useState<GameState>({
    currentScene: 1,
    selectedChoice: null,
    storyProgress: [gameData.sceneDescription],
    vocabularyLearned: [],
    showVocabulary: false,
    score: 0,
    totalScenes: 5 // Dynamic based on story length
  });

  const [animationState, setAnimationState] = useState<'entering' | 'idle' | 'choosing'>('entering');
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    setAnimationState('idle');
  }, []);

  const handleChoiceSelect = (choiceIndex: number) => {
    if (gameState.selectedChoice !== null) return;

    setGameState(prev => ({
      ...prev,
      selectedChoice: choiceIndex
    }));

    setAnimationState('choosing');

    // Add vocabulary to learned list
    const newVocab = gameData.vocabulary.map(v => v.word);
    setGameState(prev => ({
      ...prev,
      vocabularyLearned: [...new Set([...prev.vocabularyLearned, ...newVocab])],
      score: prev.score + 1
    }));

    // Simulate next scene generation
    setTimeout(() => {
      if (gameState.currentScene >= gameState.totalScenes) {
        setShowCompletion(true);
        const finalScore = Math.round((gameState.score / gameState.totalScenes) * 100);
        setTimeout(() => onComplete(finalScore), 2000);
      } else {
        const choice = gameData.choices[choiceIndex];
        setGameState(prev => ({
          ...prev,
          currentScene: prev.currentScene + 1,
          selectedChoice: null,
          storyProgress: [...prev.storyProgress, choice.consequence]
        }));
        
        if (onGenerateNext) {
          onGenerateNext(choice.text);
        }
        
        setAnimationState('entering');
      }
    }, 2000);
  };

  const toggleVocabulary = () => {
    setGameState(prev => ({
      ...prev,
      showVocabulary: !prev.showVocabulary
    }));
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
    setGameState({
      currentScene: 1,
      selectedChoice: null,
      storyProgress: [gameData.sceneDescription],
      vocabularyLearned: [],
      showVocabulary: false,
      score: 0,
      totalScenes: 5
    });
    setAnimationState('entering');
    setShowCompletion(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Game Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-green-500" />
              Story Builder: {gameData.theme}
              <Badge variant="secondary" className="font-arabic">
                {gameData.themeAr}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge variant="outline">
                Scene {gameState.currentScene}/{gameState.totalScenes}
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleVocabulary}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Vocabulary ({gameState.vocabularyLearned.length})
              </Button>
            </div>
          </div>
          <Progress 
            value={(gameState.currentScene / gameState.totalScenes) * 100} 
            className="h-3" 
          />
        </CardHeader>
      </Card>

      {/* Vocabulary Panel */}
      {gameState.showVocabulary && (
        <Card className="animate-slide-down">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Vocabulary Learned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gameData.vocabulary.map((vocab, index) => (
                <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-primary">{vocab.word}</h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => playPronunciation(vocab.word)}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{vocab.definition}</p>
                    <p className="text-sm font-arabic text-right" dir="rtl">
                      {vocab.definitionAr}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Story Scene */}
        <Card className={cn(
          "lg:col-span-2 relative overflow-hidden transition-all duration-700",
          animationState === 'entering' && "animate-fade-in-up",
          animationState === 'choosing' && "animate-pulse-glow"
        )}>
          {gameData.imageUrl && (
            <div className="relative h-64 w-full">
              <Image
                src={gameData.imageUrl}
                alt="Story scene"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white text-lg font-bold mb-2">
                  📖 Chapter {gameState.currentScene}
                </h3>
              </div>
            </div>
          )}
          
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="prose max-w-none">
                <p className="text-lg leading-relaxed text-foreground">
                  {gameData.sceneDescription}
                </p>
                <p className="text-muted-foreground font-arabic text-right mt-3" dir="rtl">
                  {gameData.sceneDescriptionAr}
                </p>
              </div>

              {/* Vocabulary Highlights */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  New Vocabulary in this Scene
                </h4>
                <div className="flex flex-wrap gap-2">
                  {gameData.vocabulary.map((vocab, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => playPronunciation(vocab.word)}
                    >
                      {vocab.word}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Choices Panel */}
        <Card className={cn(
          "relative transition-all duration-500",
          animationState === 'choosing' && "animate-choice-selected"
        )}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              🎭 What happens next?
              <Badge variant="outline" className="text-xs">
                Choose wisely!
              </Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {gameData.choices.map((choice, index) => (
              <Button
                key={index}
                variant={gameState.selectedChoice === index ? 'default' : 'outline'}
                onClick={() => handleChoiceSelect(index)}
                disabled={gameState.selectedChoice !== null}
                className={cn(
                  "w-full text-left justify-start h-auto p-4 transition-all duration-300",
                  gameState.selectedChoice === index && "animate-bounce bg-primary text-primary-foreground",
                  gameState.selectedChoice === null && "hover:scale-105 hover:shadow-md"
                )}
              >
                <div className="w-full space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold bg-muted rounded-full w-8 h-8 flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-left">{choice.text}</p>
                      <p className="text-sm text-muted-foreground font-arabic text-right" dir="rtl">
                        {choice.textAr}
                      </p>
                    </div>
                    {gameState.selectedChoice === index && (
                      <ArrowRight className="h-5 w-5 animate-bounce" />
                    )}
                  </div>
                  
                  {gameState.selectedChoice === index && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg animate-fade-in">
                      <p className="text-sm italic">
                        "{choice.consequence}"
                      </p>
                    </div>
                  )}
                </div>
              </Button>
            ))}
            
            {gameState.selectedChoice !== null && (
              <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-center text-muted-foreground">
                  Generating next scene...
                </p>
                <div className="flex justify-center mt-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Story Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📚 Your Story So Far</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {gameState.storyProgress.map((scene, index) => (
              <div
                key={index}
                className={cn(
                  "p-3 rounded-lg transition-all duration-300",
                  index === gameState.storyProgress.length - 1 
                    ? "bg-primary/10 border border-primary/20" 
                    : "bg-muted/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">
                    Scene {index + 1}
                  </Badge>
                  <p className="text-sm flex-1">{scene}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Completion Modal */}
      {showCompletion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center space-y-6">
              <div className="text-6xl animate-bounce">📖</div>
              <h2 className="text-2xl font-bold text-primary">Story Complete!</h2>
              <p className="text-muted-foreground font-arabic" dir="rtl">
                مبروك! أنهيت القصة بنجاح
              </p>
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="font-semibold">Vocabulary Learned: {gameState.vocabularyLearned.length} words</p>
                <p className="text-sm text-muted-foreground">
                  Story Length: {gameState.storyProgress.length} scenes
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button onClick={resetGame} variant="outline" className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  New Story
                </Button>
                <Button 
                  onClick={() => onComplete(Math.round((gameState.score / gameState.totalScenes) * 100))}
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
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          50% { box-shadow: 0 0 20px 10px rgba(59, 130, 246, 0.2); }
        }
        
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes choice-selected {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
        
        .animate-fade-in-up { animation: fade-in-up 0.7s ease-out; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-slide-down { animation: slide-down 0.5s ease-out; }
        .animate-choice-selected { animation: choice-selected 0.6s ease-out; }
      `}</style>
    </div>
  );
};

export default StoryBuilderGame;
