'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import userTrackingService from '@/lib/services/userTrackingService';
import AlphabetExplorer from '../../app/(app)/home/AlphabetExplorer';
import CommonWordsExplorer from '../../app/(app)/home/CommonWordsExplorer';
import NumbersAndColorsExplorer from '../../app/(app)/home/NumbersAndColorsExplorer';
import SingularPluralVowelsExplorer from '../../app/(app)/home/SingularPluralVowelsExplorer';
import PlaylistViewer from '../../app/(app)/home/PlaylistViewer';

const BasicEnglishCards = () => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // YouTube playlist data for PlaylistViewer - extracted from provided URLs
  const youtubePlaylist = [
    { partTitle: "English Alphabet Song", videoId: "P4W4FueG9Lg" },
    { partTitle: "Basic English Conversation", videoId: "fEbhQngORB4" },
    { partTitle: "English Numbers 1-20", videoId: "h0j5aEjJmRo" },
    { partTitle: "Common English Words", videoId: "euMYCvnl09A" },
    { partTitle: "English Colors", videoId: "NJ9rWf8CqQI" },
    { partTitle: "English Grammar Basics", videoId: "nIim9NmWWLo" },
    { partTitle: "Simple English Sentences", videoId: "yym9IADJNpU" },
    { partTitle: "English Pronunciation Guide", videoId: "kYTHKyEhd20" }
  ];

  // Card data configuration
  const cards = [
    {
      id: 'alphabet',
      title: 'الأبجدية الإنجليزية',
      englishTitle: 'English Alphabet',
      description: 'تعلم الحروف الإنجليزية',
      englishDescription: 'Learn English Letters',
      icon: '🔤',
      color: 'from-blue-500 to-purple-500',
      component: <AlphabetExplorer />
    },
    {
      id: 'common-words',
      title: 'الكلمات الشائعة',
      englishTitle: 'Common Words',
      description: 'الكلمات الأساسية في الإنجليزية',
      englishDescription: 'Essential English Words',
      icon: '📝',
      color: 'from-green-500 to-blue-500',
      component: <CommonWordsExplorer />
    },
    {
      id: 'numbers-colors',
      title: 'الأرقام والألوان',
      englishTitle: 'Numbers & Colors',
      description: 'تعلم الأرقام والألوان',
      englishDescription: 'Learn Numbers & Colors',
      icon: '🔢',
      color: 'from-orange-500 to-red-500',
      component: <NumbersAndColorsExplorer />
    },
    {
      id: 'grammar-basics',
      title: 'أساسيات القواعد',
      englishTitle: 'Grammar Basics',
      description: 'قواعد اللغة الأساسية',
      englishDescription: 'Basic Grammar Rules',
      icon: '📚',
      color: 'from-purple-500 to-pink-500',
      component: <SingularPluralVowelsExplorer />
    },
    {
      id: 'video-lessons',
      title: 'دروس الفيديو',
      englishTitle: 'Video Lessons',
      description: 'دروس تفاعلية بالفيديو',
      englishDescription: 'Interactive Video Lessons',
      icon: '🎥',
      color: 'from-teal-500 to-cyan-500',
      component: <PlaylistViewer playlist={youtubePlaylist} lessonTitle="Basic English Video Course" />
    }
  ];

  const openCard = async (card, index) => {
    setSelectedCard(card);
    setCurrentCardIndex(index);
    
    // Track user interaction
    await userTrackingService.trackCardInteraction(
      'basic-english',
      card.id,
      card.title,
      'open'
    );
  };

  const closeCard = async () => {
    if (selectedCard) {
      // Track close interaction
      await userTrackingService.trackCardInteraction(
        'basic-english',
        selectedCard.id,
        selectedCard.title,
        'close'
      );
    }
    setSelectedCard(null);
  };

  const goToNext = async () => {
    const nextIndex = (currentCardIndex + 1) % cards.length;
    setCurrentCardIndex(nextIndex);
    setSelectedCard(cards[nextIndex]);
    
    // Track navigation
    await userTrackingService.trackCardInteraction(
      'basic-english',
      cards[nextIndex].id,
      cards[nextIndex].title,
      'navigate-next'
    );
  };

  const goToPrevious = async () => {
    const prevIndex = currentCardIndex === 0 ? cards.length - 1 : currentCardIndex - 1;
    setCurrentCardIndex(prevIndex);
    setSelectedCard(cards[prevIndex]);
    
    // Track navigation
    await userTrackingService.trackCardInteraction(
      'basic-english',
      cards[prevIndex].id,
      cards[prevIndex].title,
      'navigate-previous'
    );
  };

  return (
    <>
      {/* Slidable Cards Container */}
      <div className="relative">
        {/* Cards Grid */}
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
          <div className="flex gap-4 min-w-max">
            {cards.map((card, index) => (
              <div
                key={card.id}
                className="flex-shrink-0 w-72 h-48 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                onClick={() => openCard(card, index)}
              >
                <div className={`w-full h-full bg-gradient-to-br ${card.color}/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:shadow-xl transition-all duration-300`}>
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    {/* Icon */}
                    <div className={`p-4 rounded-full bg-gradient-to-br ${card.color} shadow-lg`}>
                      <span className="text-3xl">{card.icon}</span>
                    </div>
                    
                    {/* Title */}
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-primary-foreground mb-1" dir="rtl">
                        {card.title}
                      </h3>
                      <p className="text-sm text-muted-foreground font-medium">
                        {card.englishTitle}
                      </p>
                    </div>
                    
                    {/* Description */}
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground/80" dir="rtl">
                        {card.description}
                      </p>
                      <p className="text-xs text-muted-foreground/60 italic">
                        {card.englishDescription}
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
          {cards.map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-muted-foreground/30 transition-all duration-300"
            />
          ))}
        </div>
      </div>

      {/* Modal Dialog */}
      <Dialog open={!!selectedCard} onOpenChange={() => closeCard()}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full bg-gradient-to-br ${selectedCard?.color} shadow-lg`}>
                <span className="text-2xl">{selectedCard?.icon}</span>
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold" dir="rtl">
                  {selectedCard?.title}
                </DialogTitle>
                <p className="text-muted-foreground">{selectedCard?.englishTitle}</p>
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
                onClick={closeCard}
                className="flex items-center space-x-1"
              >
                <X className="h-4 w-4" />
                <span>إغلاق</span>
              </Button>
            </div>
          </DialogHeader>
          
          {/* Content */}
          <div className="mt-6">
            {selectedCard?.component}
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

export default BasicEnglishCards;
