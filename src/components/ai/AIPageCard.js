'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, X } from 'lucide-react';
import PersonalAIAssistant from './PersonalAIAssistant';
import MoodTranslatorAI from './MoodTranslatorAI';
import VoiceTranslatorAI from './VoiceTranslatorAI';
import userTrackingService from '@/lib/services/userTrackingService';

const AIPageCard = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // AI feature cards configuration
  const aiCards = [
    {
      id: 'personal-ai',
      title: 'مساعدك الشخصي',
      englishTitle: 'Your Personal AI Assistant',
      description: 'ذكاء اصطناعي شخصي يعرف تفاصيلك ومسارك التعليمي',
      englishDescription: 'Personal AI that knows your details and learning journey',
      icon: '🤖',
      color: 'from-blue-500 to-purple-500',
      component: <PersonalAIAssistant />
    },
    {
      id: 'mood-translator',
      title: 'مترجم المزاج',
      englishTitle: 'Mood Translator AI',
      description: 'ذكاء اصطناعي للتفاعل بمزاجات مختلفة - إنجليزي فقط',
      englishDescription: 'AI with different mood personalities - English only',
      icon: '🎭',
      color: 'from-green-500 to-teal-500',
      component: <MoodTranslatorAI />
    },
    {
      id: 'voice-translator',
      title: 'مترجم الصوت',
      englishTitle: 'Voice Translator',
      description: 'ترجمة فورية من العربية إلى الإنجليزية بالصوت',
      englishDescription: 'Real-time Arabic to English voice translation',
      icon: '🎤',
      color: 'from-orange-500 to-red-500',
      component: <VoiceTranslatorAI />
    },
    {
      id: 'conversation-ai',
      title: 'محادث ذكي',
      englishTitle: 'Conversation Partner',
      description: 'شريك محادثة ذكي لتطوير مهارات التحدث',
      englishDescription: 'Smart conversation partner for speaking skills',
      icon: '💬',
      color: 'from-pink-500 to-rose-500',
      component: <div className="text-center text-muted-foreground">Conversation Partner - Coming Soon</div>
    },
    {
      id: 'writing-ai',
      title: 'مساعد الكتابة',
      englishTitle: 'Writing Assistant',
      description: 'ذكاء اصطناعي لتحسين مهارات الكتابة',
      englishDescription: 'AI assistant for improving writing skills',
      icon: '✍️',
      color: 'from-indigo-500 to-blue-500',
      component: <div className="text-center text-muted-foreground">Writing Assistant - Coming Soon</div>
    }
  ];

  const currentCard = aiCards[currentCardIndex];

  const goToNext = async () => {
    const nextIndex = (currentCardIndex + 1) % aiCards.length;
    setCurrentCardIndex(nextIndex);
    
    // Track navigation
    await userTrackingService.trackCardInteraction(
      'ai-features',
      aiCards[nextIndex].id,
      aiCards[nextIndex].title,
      'navigate-next'
    );
  };

  const goToPrevious = async () => {
    const prevIndex = currentCardIndex === 0 ? aiCards.length - 1 : currentCardIndex - 1;
    setCurrentCardIndex(prevIndex);
    
    // Track navigation
    await userTrackingService.trackCardInteraction(
      'ai-features',
      aiCards[prevIndex].id,
      aiCards[prevIndex].title,
      'navigate-previous'
    );
  };

  const toggleFullScreen = async () => {
    setIsFullScreen(!isFullScreen);
    
    // Track fullscreen toggle
    await userTrackingService.trackCardInteraction(
      'ai-features',
      currentCard.id,
      currentCard.title,
      isFullScreen ? 'exit-fullscreen' : 'enter-fullscreen'
    );
  };

  // Track initial card view
  useEffect(() => {
    userTrackingService.trackCardInteraction(
      'ai-features',
      currentCard.id,
      currentCard.title,
      'view'
    );
  }, [currentCardIndex]);

  return (
    <>
      {/* AI Page Card */}
      <div className={`
        ai-card-container ai-fullscreen-transition
        ${isFullScreen 
          ? 'fixed inset-0 z-50 bg-background' 
          : 'relative w-full max-w-5xl mx-auto mt-8'
        }
      `}>
        <div className={`
          bg-gradient-to-br from-background/95 via-muted/30 to-background/95 
          backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl
          transition-all duration-500 ease-in-out
          ${isFullScreen 
            ? 'h-full m-4' 
            : 'h-[500px] w-[65%] mx-auto'
          }
        `}>
          {/* Card Header */}
          <div className="flex items-center justify-between p-6 border-b border-border/30">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full bg-gradient-to-br ${currentCard.color} shadow-lg`}>
                <span className="text-2xl">{currentCard.icon}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-primary-foreground" dir="rtl">
                  {currentCard.title}
                </h2>
                <p className="text-base text-muted-foreground">
                  {currentCard.englishTitle}
                </p>
                <p className="text-sm text-muted-foreground/80 mt-1" dir="rtl">
                  {currentCard.description}
                </p>
              </div>
            </div>
            
            {/* Control Buttons */}
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
              
              {/* Card Counter */}
              <div className="px-3 py-1 bg-muted/50 rounded-md text-sm text-muted-foreground">
                {currentCardIndex + 1} / {aiCards.length}
              </div>
              
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
              
              {/* Fullscreen Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullScreen}
                className="flex items-center space-x-1"
              >
                {isFullScreen ? (
                  <>
                    <Minimize2 className="h-4 w-4" />
                    <span>تصغير</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-4 w-4" />
                    <span>ملء الشاشة</span>
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Card Content */}
          <div className="p-6 h-[calc(100%-100px)] overflow-y-auto">
            <div className="h-full">
              {currentCard.component}
            </div>
          </div>
        </div>
      </div>

      {/* Slide Animation Indicators */}
      {!isFullScreen && (
        <div className="flex justify-center mt-6 space-x-2">
          {aiCards.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentCardIndex 
                  ? 'bg-primary shadow-lg' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      )}

      {/* Custom CSS for slide animations */}
      <style jsx>{`
        .slide-enter {
          opacity: 0;
          transform: translateX(100%);
        }
        .slide-enter-active {
          opacity: 1;
          transform: translateX(0);
          transition: opacity 300ms ease-in-out, transform 300ms ease-in-out;
        }
        .slide-exit {
          opacity: 1;
          transform: translateX(0);
        }
        .slide-exit-active {
          opacity: 0;
          transform: translateX(-100%);
          transition: opacity 300ms ease-in-out, transform 300ms ease-in-out;
        }
      `}</style>
    </>
  );
};

export default AIPageCard;
