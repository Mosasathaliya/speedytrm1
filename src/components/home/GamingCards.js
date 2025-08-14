'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Gamepad2 } from 'lucide-react';
import userTrackingService from '@/lib/services/userTrackingService';

const GamingCards = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [currentGameIndex, setCurrentGameIndex] = useState(0);

  // Educational games data with iframe sources
  const games = [
    {
      id: 'alphabet-quiz',
      title: 'اختبار الأبجدية',
      englishTitle: 'Alphabet Quiz',
      description: 'اختبار الحروف والكلمات',
      englishDescription: 'Letters and Words Quiz',
      icon: '🔤',
      color: 'from-blue-500 to-cyan-500',
      iframeSrc: 'https://www.educaplay.com/game/21968487-alphabets_a4_apple_quiz.html'
    },
    {
      id: 'capital-small-letters',
      title: 'الحروف الكبيرة والصغيرة',
      englishTitle: 'Capital vs Small Letters',
      description: 'اختبار الحروف الكبيرة والصغيرة',
      englishDescription: 'Capital and Small Letters Quiz',
      icon: 'Aa',
      color: 'from-green-500 to-emerald-500',
      iframeSrc: 'https://www.educaplay.com/game/21963284-capital_vs_small_letters_quiz.html'
    },
    {
      id: 'pronoun-matching',
      title: 'مطابقة الضمائر',
      englishTitle: 'Pronoun Matching',
      description: 'لعبة مطابقة الضمائر',
      englishDescription: 'Pronoun Matching Game',
      icon: '👤',
      color: 'from-purple-500 to-violet-500',
      iframeSrc: 'https://www.educaplay.com/game/21969092-pronoun_matching_game.html'
    },
    {
      id: 'noun-english',
      title: 'الأسماء في الإنجليزية',
      englishTitle: 'English Nouns',
      description: 'تعلم الأسماء الإنجليزية',
      englishDescription: 'Learn English Nouns',
      icon: '📝',
      color: 'from-orange-500 to-amber-500',
      iframeSrc: 'https://www.educaplay.com/game/21969306-noun_english_language.html'
    },
    {
      id: 'understanding-nouns-pronouns',
      title: 'فهم الأسماء والضمائر',
      englishTitle: 'Understanding Nouns & Pronouns',
      description: 'فهم الأسماء والضمائر',
      englishDescription: 'Understanding Nouns and Pronouns',
      icon: '🎯',
      color: 'from-red-500 to-rose-500',
      iframeSrc: 'https://www.educaplay.com/game/22375175-understanding_nouns_and_pronouns.html'
    },
    {
      id: 'questions-nouns-pronouns',
      title: 'أسئلة الأسماء والضمائر',
      englishTitle: 'Questions on Nouns & Pronouns',
      description: 'أسئلة حول الأسماء والضمائر',
      englishDescription: 'Ask Questions of Nouns and Pronouns',
      icon: '❓',
      color: 'from-teal-500 to-cyan-500',
      iframeSrc: 'https://www.educaplay.com/game/22375681-ask_questions_of_nouns_and_pronouns.html'
    },
    {
      id: 'noun-pronoun-quiz',
      title: 'تحدي اختبار الأسماء والضمائر',
      englishTitle: 'Noun & Pronoun Quiz Challenge',
      description: 'تحدي شامل للأسماء والضمائر',
      englishDescription: 'Comprehensive Quiz Challenge',
      icon: '🏆',
      color: 'from-pink-500 to-fuchsia-500',
      iframeSrc: 'https://www.educaplay.com/game/22375843-noun_and_pronoun_quiz_challenge.html'
    }
  ];

  const openGame = async (game, index) => {
    setSelectedGame(game);
    setCurrentGameIndex(index);
    
    // Track game interaction
    await userTrackingService.trackCardInteraction(
      'gaming',
      game.id,
      game.title,
      'open'
    );
  };

  const closeGame = async () => {
    if (selectedGame) {
      // Track close interaction
      await userTrackingService.trackCardInteraction(
        'gaming',
        selectedGame.id,
        selectedGame.title,
        'close'
      );
    }
    setSelectedGame(null);
  };

  const goToNext = async () => {
    const nextIndex = (currentGameIndex + 1) % games.length;
    setCurrentGameIndex(nextIndex);
    setSelectedGame(games[nextIndex]);
    
    // Track navigation
    await userTrackingService.trackCardInteraction(
      'gaming',
      games[nextIndex].id,
      games[nextIndex].title,
      'navigate-next'
    );
  };

  const goToPrevious = async () => {
    const prevIndex = currentGameIndex === 0 ? games.length - 1 : currentGameIndex - 1;
    setCurrentGameIndex(prevIndex);
    setSelectedGame(games[prevIndex]);
    
    // Track navigation
    await userTrackingService.trackCardInteraction(
      'gaming',
      games[prevIndex].id,
      games[prevIndex].title,
      'navigate-previous'
    );
  };

  return (
    <>
      {/* Slidable Gaming Cards Container */}
      <div className="relative">
        {/* Cards Grid */}
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
          <div className="flex gap-4 min-w-max">
            {games.map((game, index) => (
              <div
                key={game.id}
                className="flex-shrink-0 w-72 h-48 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                onClick={() => openGame(game, index)}
              >
                <div className={`w-full h-full bg-gradient-to-br ${game.color}/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:shadow-xl transition-all duration-300`}>
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    {/* Icon */}
                    <div className={`p-4 rounded-full bg-gradient-to-br ${game.color} shadow-lg flex items-center justify-center`}>
                      {typeof game.icon === 'string' ? (
                        <span className="text-3xl">{game.icon}</span>
                      ) : (
                        <span className="text-2xl font-bold text-white">{game.icon}</span>
                      )}
                    </div>
                    
                    {/* Title */}
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-primary-foreground mb-1" dir="rtl">
                        {game.title}
                      </h3>
                      <p className="text-sm text-muted-foreground font-medium">
                        {game.englishTitle}
                      </p>
                    </div>
                    
                    {/* Description */}
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground/80" dir="rtl">
                        {game.description}
                      </p>
                      <p className="text-xs text-muted-foreground/60 italic">
                        {game.englishDescription}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicators */}
        <div className="flex justify-center mt-4 space-x-2">
          {games.map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-muted-foreground/30 transition-all duration-300"
            />
          ))}
        </div>
      </div>

      {/* Game Modal Dialog */}
      <Dialog open={!!selectedGame} onOpenChange={() => closeGame()}>
        <DialogContent className="max-w-[900px] max-h-[95vh] overflow-hidden p-0">
          <DialogHeader className="flex flex-row items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full bg-gradient-to-br ${selectedGame?.color} shadow-lg flex items-center justify-center`}>
                <Gamepad2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold" dir="rtl">
                  {selectedGame?.title}
                </DialogTitle>
                <p className="text-muted-foreground">{selectedGame?.englishTitle}</p>
              </div>
            </div>
            
            {/* Navigation and Close */}
            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevious}
                className="flex items-center space-x-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>السابق</span>
              </Button>
              
              {/* Next Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={goToNext}
                className="flex items-center space-x-1"
              >
                <span>التالي</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              {/* Close Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={closeGame}
                className="flex items-center space-x-1"
              >
                <X className="h-4 w-4" />
                <span>إغلاق</span>
              </Button>
            </div>
          </DialogHeader>
          
          {/* Game iframe Content */}
          <div className="w-full h-[750px] p-4">
            {selectedGame && (
              <iframe
                src={selectedGame.iframeSrc}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="fullscreen; autoplay; allow-top-navigation-by-user-activation"
                allowFullScreen
                className="rounded-lg border border-border"
                title={selectedGame.englishTitle}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Custom CSS for scroll behavior */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default GamingCards;
