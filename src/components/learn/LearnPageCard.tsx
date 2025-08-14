'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2,
  BookOpen,
  Gamepad2,
  Target,
  Star,
  Play,
  Lock,
  CheckCircle
} from 'lucide-react';
// Using CSS animations instead of framer-motion for compatibility
import { cn } from '@/lib/utils';

interface LearnPageCardProps {
  currentCard: any;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  onCardAction?: (action: string) => void;
}

const LearnPageCard: React.FC<LearnPageCardProps> = ({
  currentCard,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  onCardAction
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleNext = () => {
    if (!canGoNext || isTransitioning) return;
    setIsTransitioning(true);
    setSlideDirection('left');
    setTimeout(() => {
      onNext();
      setSlideDirection(null);
      setIsTransitioning(false);
    }, 300);
  };

  const handlePrevious = () => {
    if (!canGoPrevious || isTransitioning) return;
    setIsTransitioning(true);
    setSlideDirection('right');
    setTimeout(() => {
      onPrevious();
      setSlideDirection(null);
      setIsTransitioning(false);
    }, 300);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const getCardIcon = () => {
    switch (currentCard?.type) {
      case 'lesson': return <BookOpen className="h-6 w-6" />;
      case 'game': return <Gamepad2 className="h-6 w-6" />;
      case 'quiz': return <Target className="h-6 w-6" />;
      default: return <Star className="h-6 w-6" />;
    }
  };

  const getCardGradient = () => {
    switch (currentCard?.type) {
      case 'lesson': return 'from-blue-500/10 via-purple-500/10 to-blue-500/10';
      case 'game': return 'from-green-500/10 via-emerald-500/10 to-green-500/10';
      case 'quiz': return 'from-orange-500/10 via-red-500/10 to-orange-500/10';
      default: return 'from-gray-500/10 via-slate-500/10 to-gray-500/10';
    }
  };

  const getCardBorder = () => {
    switch (currentCard?.type) {
      case 'lesson': return 'border-blue-200 dark:border-blue-800';
      case 'game': return 'border-green-200 dark:border-green-800';
      case 'quiz': return 'border-orange-200 dark:border-orange-800';
      default: return 'border-gray-200 dark:border-gray-800';
    }
  };

  // CSS animations are handled in learn-styles.css

  if (!currentCard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-[65%] max-w-4xl">
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-700">
            <CardContent className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">No content available</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "learn-page-container transition-all duration-300",
      isFullScreen 
        ? "fixed inset-0 z-50 bg-background/95 backdrop-blur-md" 
        : "min-h-screen flex items-center justify-center py-4 md:py-8"
    )}>
      <div className={cn(
        "relative transition-all duration-300",
        isFullScreen 
          ? "w-full h-full p-4 flex flex-col" 
          : "w-[65%] max-w-4xl mx-auto"
      )}>
        {/* Main Card */}
        <div
          key={currentCard.id}
          className={cn(
            "learn-card relative backdrop-blur-lg transition-all duration-300",
            isFullScreen ? "flex-1 flex flex-col" : "",
            slideDirection === 'left' ? "slide-exit-left" : "",
            slideDirection === 'right' ? "slide-exit-right" : "",
            !slideDirection ? "slide-enter-center" : ""
          )}
        >
            <Card className={cn(
              "relative overflow-hidden transition-all duration-300 shadow-xl",
              "backdrop-blur-sm bg-gradient-to-br",
              getCardGradient(),
              getCardBorder(),
              "border-2 hover:shadow-2xl",
              isFullScreen ? "h-full flex flex-col" : "min-h-[500px]"
            )}>
              {/* Card Header */}
              <CardHeader className={cn(
                "relative z-10 transition-all duration-300",
                isFullScreen ? "pb-4" : "pb-6"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg bg-gradient-to-br",
                      currentCard.type === 'lesson' ? "from-blue-500 to-purple-500" :
                      currentCard.type === 'game' ? "from-green-500 to-emerald-500" :
                      currentCard.type === 'quiz' ? "from-orange-500 to-red-500" :
                      "from-gray-500 to-slate-500"
                    )}>
                      <div className="text-white">
                        {getCardIcon()}
                      </div>
                    </div>
                    <div>
                      <CardTitle className={cn(
                        "transition-all duration-300",
                        isFullScreen ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
                      )}>
                        {currentCard.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground font-arabic" dir="rtl">
                        {currentCard.title_ar}
                      </p>
                    </div>
                  </div>
                  
                  {/* Status Badges */}
                  <div className="flex flex-col gap-2">
                    {currentCard.is_completed && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                    {currentCard.is_locked && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                        <Lock className="h-3 w-3 mr-1" />
                        Locked
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {currentCard.index + 1} / 100
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              {/* Card Content */}
              <CardContent className={cn(
                "relative z-10 transition-all duration-300",
                isFullScreen ? "flex-1 overflow-y-auto" : "min-h-[300px]"
              )}>
                <div className="space-y-6">
                  {/* Description */}
                  <div className="space-y-2">
                    <p className="text-base leading-relaxed">
                      {currentCard.description}
                    </p>
                    <p className="text-sm text-muted-foreground font-arabic leading-relaxed" dir="rtl">
                      {currentCard.description_ar}
                    </p>
                  </div>

                  {/* Content Area - This would be replaced with actual content */}
                  <div className={cn(
                    "bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50",
                    "rounded-lg p-6 border border-gray-200 dark:border-gray-700",
                    "backdrop-blur-sm transition-all duration-300",
                    isFullScreen ? "min-h-[400px]" : "min-h-[200px]"
                  )}>
                    {currentCard.is_locked ? (
                      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                        <Lock className="h-16 w-16 text-orange-500" />
                        <div>
                          <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                            Content Locked
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {currentCard.lock_reason || "This content is no longer accessible"}
                          </p>
                          <p className="text-xs font-arabic text-muted-foreground mt-2" dir="rtl">
                            هذا المحتوى مقفل ولا يمكن الوصول إليه
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">
                            {currentCard.type === 'lesson' ? 'Lesson Content' :
                             currentCard.type === 'game' ? 'Game Content' :
                             currentCard.type === 'quiz' ? 'Assessment Content' :
                             'Learning Content'}
                          </h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onCardAction?.('start')}
                            disabled={currentCard.is_locked}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Start
                          </Button>
                        </div>
                        
                        <div className="prose prose-sm max-w-none">
                          <p className="text-muted-foreground">
                            This is where the actual {currentCard.type} content would be displayed.
                            The content is personalized for each user and generated based on their learning progress.
                          </p>
                        </div>

                        {/* Progress Indicator */}
                        {currentCard.is_completed && (
                          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                              <CheckCircle className="h-5 w-5" />
                              <span className="font-medium">Completed successfully!</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        {/* Full Screen Button */}
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullScreen}
            className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-900"
          >
            {isFullScreen ? (
              <>
                <Minimize2 className="h-4 w-4 mr-2" />
                Exit Full Screen
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4 mr-2" />
                Full Screen
              </>
            )}
          </Button>
        </div>

        {/* Navigation Buttons */}
        <div className={cn(
          "flex justify-between items-center transition-all duration-300",
          isFullScreen ? "mt-4" : "mt-6"
        )}>
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevious}
            disabled={!canGoPrevious}
            className={cn(
              "backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-700",
              "hover:bg-white dark:hover:bg-gray-900 transition-all duration-300",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "touch-manipulation", // Mobile optimization
              isFullScreen ? "text-base px-6 py-3" : "text-sm px-4 py-2"
            )}
          >
            <ChevronLeft className={cn(
              "mr-2 transition-transform duration-200",
              !canGoPrevious ? "opacity-50" : "group-hover:-translate-x-1",
              isFullScreen ? "h-5 w-5" : "h-4 w-4"
            )} />
            Previous
          </Button>

          <div className="text-center">
            <div className={cn(
              "text-xs text-muted-foreground transition-all duration-300",
              isFullScreen ? "text-sm" : ""
            )}>
              Item {currentCard.index + 1} of 100
            </div>
          </div>

          <Button
            variant="outline"
            size="lg"
            onClick={handleNext}
            disabled={!canGoNext}
            className={cn(
              "backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-700",
              "hover:bg-white dark:hover:bg-gray-900 transition-all duration-300",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "touch-manipulation", // Mobile optimization
              isFullScreen ? "text-base px-6 py-3" : "text-sm px-4 py-2"
            )}
          >
            Next
            <ChevronRight className={cn(
              "ml-2 transition-transform duration-200",
              !canGoNext ? "opacity-50" : "group-hover:translate-x-1",
              isFullScreen ? "h-5 w-5" : "h-4 w-4"
            )} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LearnPageCard;
