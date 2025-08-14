'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Volume2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { ConversationGame } from '@/types/comprehensive-learning';

interface ConversationGameProps {
  gameData: ConversationGame;
  onComplete: (score: number) => void;
}

const ConversationGameComponent: React.FC<ConversationGameProps> = ({
  gameData,
  onComplete
}) => {
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [conversationScore, setConversationScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);

  const currentDialogue = gameData.dialogue[currentDialogueIndex];

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    setConversationScore(prev => prev + 10); // Points for participation

    // Move to next dialogue after a short delay
    setTimeout(() => {
      if (currentDialogueIndex < gameData.dialogue.length - 1) {
        setCurrentDialogueIndex(currentDialogueIndex + 1);
        setSelectedOption(null);
      } else {
        setGameCompleted(true);
        const finalScore = Math.round((conversationScore + 10) / (gameData.dialogue.length * 10) * 100);
        setTimeout(() => onComplete(finalScore), 1500);
      }
    }, 2000);
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
    setCurrentDialogueIndex(0);
    setSelectedOption(null);
    setConversationScore(0);
    setGameCompleted(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Game Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-green-500" />
              Conversation Practice
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge variant="outline">
                Turn {currentDialogueIndex + 1}/{gameData.dialogue.length}
              </Badge>
              <Badge variant="outline">
                Score: {conversationScore}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {!gameCompleted ? (
        <>
          {/* Scenario Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🎭 Scenario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h3 className="font-semibold text-primary">{gameData.scenario}</h3>
                <p className="text-muted-foreground font-arabic" dir="rtl">
                  {gameData.scenarioAr}
                </p>
                <Badge variant="secondary" className="mt-2">
                  Speaking with: {gameData.character} | {gameData.characterAr}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Conversation Area */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Character Avatar */}
                {gameData.imageUrl && (
                  <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <Image
                        src={gameData.imageUrl}
                        alt={gameData.character}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Current Dialogue */}
                <div className="space-y-4">
                  {currentDialogue.speaker === 'character' ? (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {gameData.character[0]}
                      </div>
                      <div className="flex-1">
                        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-blue-700 dark:text-blue-300">
                                {gameData.character}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => playAudio(currentDialogue.text)}
                              >
                                <Volume2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-blue-900 dark:text-blue-100">{currentDialogue.text}</p>
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-arabic mt-2" dir="rtl">
                              {currentDialogue.textAr}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 justify-end">
                      <div className="flex-1">
                        <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => playAudio(currentDialogue.text)}
                              >
                                <Volume2 className="h-4 w-4" />
                              </Button>
                              <span className="font-medium text-green-700 dark:text-green-300">
                                You
                              </span>
                            </div>
                            <p className="text-green-900 dark:text-green-100 text-right">{currentDialogue.text}</p>
                            <p className="text-sm text-green-600 dark:text-green-400 font-arabic text-right mt-2" dir="rtl">
                              {currentDialogue.textAr}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                      <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        Y
                      </div>
                    </div>
                  )}
                </div>

                {/* Response Options */}
                {currentDialogue.speaker === 'character' && currentDialogue.options && (
                  <div className="space-y-3 mt-6">
                    <h4 className="font-medium text-center">Choose your response:</h4>
                    {currentDialogue.options.map((option, index) => (
                      <Button
                        key={index}
                        variant={selectedOption === index ? 'default' : 'outline'}
                        onClick={() => handleOptionSelect(index)}
                        disabled={selectedOption !== null}
                        className={cn(
                          "w-full text-left justify-start h-auto p-4 transition-all duration-300",
                          selectedOption === index && "ring-2 ring-green-400 bg-green-500 text-white",
                          "hover:scale-105"
                        )}
                      >
                        <div className="w-full space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold bg-muted rounded-full w-8 h-8 flex items-center justify-center">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <p className="font-medium text-left">{option.text}</p>
                              <p className="text-sm text-muted-foreground font-arabic text-right" dir="rtl">
                                {option.textAr}
                              </p>
                            </div>
                            <Send className="h-4 w-4" />
                          </div>
                          
                          {selectedOption === index && (
                            <div className="mt-3 p-3 bg-muted/50 rounded-lg animate-fade-in">
                              <p className="text-sm italic">
                                <strong>Response:</strong> "{option.response}"
                              </p>
                              <p className="text-sm italic font-arabic text-right mt-1" dir="rtl">
                                {option.responseAr}
                              </p>
                            </div>
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                )}

                {/* Continue Button for User Dialogues */}
                {currentDialogue.speaker === 'user' && !currentDialogue.options && (
                  <div className="text-center mt-6">
                    <Button 
                      onClick={() => {
                        if (currentDialogueIndex < gameData.dialogue.length - 1) {
                          setCurrentDialogueIndex(currentDialogueIndex + 1);
                        } else {
                          setGameCompleted(true);
                          onComplete(100);
                        }
                      }}
                    >
                      Continue Conversation
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Progress */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Conversation Progress
                </span>
                <span className="text-sm font-medium">
                  {currentDialogueIndex + 1} / {gameData.dialogue.length}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentDialogueIndex + 1) / gameData.dialogue.length) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Game Completion */
        <Card className="text-center">
          <CardContent className="p-8 space-y-6">
            <div className="text-6xl animate-bounce">💬</div>
            <h2 className="text-2xl font-bold text-primary">Conversation Complete!</h2>
            <p className="text-muted-foreground font-arabic" dir="rtl">
              مبروك! أكملت المحادثة بنجاح
            </p>
            
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <div className="text-3xl font-bold text-primary">
                {Math.round((conversationScore / (gameData.dialogue.length * 10)) * 100)}%
              </div>
              <div className="text-lg">Conversation Completed Successfully!</div>
              <div className="text-sm text-muted-foreground">
                You've practiced real-world conversation skills
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={resetGame} variant="outline" className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Practice Again
              </Button>
              <Button 
                onClick={() => onComplete(Math.round((conversationScore / (gameData.dialogue.length * 10)) * 100))} 
                className="flex-1"
              >
                Continue Learning
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ConversationGameComponent;
