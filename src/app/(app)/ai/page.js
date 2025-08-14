'use client';

import React, { useEffect } from 'react';
import AnimatedBackground from '@/components/layout/AnimatedBackground';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import AIPageCard from '@/components/ai/AIPageCard';
import AIErrorBoundary from '@/components/ai/AIErrorBoundary';
import userTrackingService from '@/lib/services/userTrackingService';
import './ai-styles.css';

export default function AIPage() {
  // Track AI page view
  useEffect(() => {
    userTrackingService.trackPageView('ai');
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnimatedBackground />
      
      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-6 w-full">
          {/* Arabic Main Heading */}
          <div className="space-y-3">
            <h1 className="text-5xl md:text-7xl font-bold text-primary bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent" dir="rtl">
              مركز الذكاء الاصطناعي
            </h1>
            <h2 className="text-2xl md:text-4xl font-semibold text-primary-foreground/90">
              AI Learning Center
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto" dir="rtl">
              استكشف قوة الذكاء الاصطناعي في تعلم اللغة الإنجليزية
            </p>
            <p className="text-base text-muted-foreground/80 max-w-3xl mx-auto">
              Explore the power of AI in English language learning
            </p>
          </div>
          
          {/* AI Page Card Component */}
          <AIErrorBoundary>
            <AIPageCard />
          </AIErrorBoundary>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavBar />
    </div>
  );
}
