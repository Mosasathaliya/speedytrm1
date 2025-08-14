'use client';

import React, { useState, useEffect } from 'react';
// Using CSS animations for compatibility
import LearnPageCard from './LearnPageCard';
import { getCompleteJourneyWithQuizzes } from '@/lib/quiz-integration';
import type { LearningItem } from '@/types/comprehensive-learning';
import '../../../app/(app)/learn/learn-styles.css';

interface OptimizedLearnPageProps {
  userId: string;
  onProgressUpdate?: (progress: any) => void;
}

const OptimizedLearnPage: React.FC<OptimizedLearnPageProps> = ({
  userId,
  onProgressUpdate
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [journeyItems, setJourneyItems] = useState<LearningItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<any>(null);

  const currentCard = journeyItems[currentIndex];

  useEffect(() => {
    initializeJourney();
  }, [userId]);

  const initializeJourney = async () => {
    try {
      setIsLoading(true);
      
      // Get complete journey with quizzes (100 items)
      const items = getCompleteJourneyWithQuizzes();
      setJourneyItems(items);
      
      // Load user progress
      await loadUserProgress();
      
    } catch (error) {
      console.error('Error initializing journey:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProgress = async () => {
    // No backend: start from index 0 with empty local state
    setUserProgress({ current_item_index: 0 });
    setCurrentIndex(0);
  };

  const handleNext = async () => {
    if (currentIndex >= journeyItems.length - 1) return;
    
    const newIndex = currentIndex + 1;
    
    setCurrentIndex(newIndex);
  };

  const handlePrevious = async () => {
    if (currentIndex <= 0) return;
    
    const newIndex = currentIndex - 1;
    
    setCurrentIndex(newIndex);
  };

  const handleCardAction = async (action: string) => {
    if (!currentCard) return;

    switch (action) {
      case 'start':
        // Handle starting the current content
        console.log(`Starting ${currentCard.type}: ${currentCard.title}`);
        
        if (currentCard.type === 'quiz') {
          // Generate and start quiz
          await startQuiz();
        } else if (currentCard.type === 'lesson') {
          // Generate and start lesson
          await generateUserContent('lesson');
        } else if (currentCard.type === 'game') {
          // Generate and start game
          await generateUserContent('game');
        }
        break;
        
      case 'complete':
        // Mark item as completed
        await markItemComplete();
        break;
    }
  };

  const startQuiz = async () => {
    console.log('Quiz start (no backend):', currentCard?.id);
  };

  const generateUserContent = async (contentType: 'lesson' | 'game') => {
    console.log(`Generate ${contentType} (no backend):`, currentCard?.id);
  };

  const markItemComplete = async () => {
    const updatedItems = journeyItems.map((item, index) => 
      index === currentIndex 
        ? { ...item, is_completed: true }
        : item
    );
    setJourneyItems(updatedItems);
  };

  const canGoNext = currentIndex < journeyItems.length - 1;
  const canGoPrevious = currentIndex > 0;

  if (isLoading) {
    return (
      <div className="learn-page-container">
        <div className="w-[65%] max-w-4xl mx-auto">
          <div className="learn-card-skeleton h-96 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="learn-page-container">
      <div className="fade-in">
        <LearnPageCard
          currentCard={currentCard}
          onNext={handleNext}
          onPrevious={handlePrevious}
          canGoNext={canGoNext}
          canGoPrevious={canGoPrevious}
          onCardAction={handleCardAction}
        />
      </div>
    </div>
  );
};

export default OptimizedLearnPage;
