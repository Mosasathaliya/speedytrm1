'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen, Target, Trophy, Brain, GraduationCap } from 'lucide-react';

export default function MotivationalReviewCard() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);

  // Welcome message in Arabic
  const welcomeMessage = {
    arabic: "أهلاً وسهلاً بك في منصة سرعة الإتقان! 🌟",
    english: "Welcome to Speed of Mastery Platform!",
    subtitle: "منصتك لتعلم اللغة الإنجليزية بالذكاء الاصطناعي",
    subtitleEnglish: "Your AI-Powered English Learning Platform",
    icon: Sparkles
  };

  // Motivational messages in Arabic and English
  const motivationalMessages = [
    {
      arabic: "تعلم اللغة الإنجليزية يفتح لك أبواب الفرص في العالم! 🌍",
      english: "Learning English opens doors to opportunities worldwide!",
      icon: Sparkles
    },
    {
      arabic: "كل كلمة جديدة هي خطوة نحو مستقبل أفضل! 🚀",
      english: "Every new word is a step toward a better future!",
      icon: Target
    },
    {
      arabic: "أنت قادر على إتقان اللغة الإنجليزية! 💪",
      english: "You are capable of mastering English!",
      icon: Trophy
    },
    {
      arabic: "الذكاء الاصطناعي يساعدك في رحلتك التعليمية! 🤖",
      english: "AI helps you in your learning journey!",
      icon: Brain
    },
    {
      arabic: "استمر في التعلم، النجاح ينتظرك! ⭐",
      english: "Keep learning, success awaits you!",
      icon: GraduationCap
    },
    {
      arabic: "اللغة الإنجليزية هي مفتاح المعرفة العالمية! 🔑",
      english: "English is the key to global knowledge!",
      icon: BookOpen
    }
  ];

  // Learning review reminders in Arabic
  const learningReviews = [
    "تذكر: الأفعال في المضارع البسيط تأخذ 's' مع الضمير الثالث المفرد",
    "تذكر: الصفات تأتي قبل الأسماء في اللغة الإنجليزية",
    "تذكر: 'a' تستخدم مع الكلمات المفردة التي تبدأ بحرف ساكن",
    "تذكر: 'an' تستخدم مع الكلمات المفردة التي تبدأ بحرف متحرك",
    "تذكر: الضمائر الشخصية لا تأخذ 'the' قبلها",
    "تذكر: الأفعال المساعدة تأتي قبل الفعل الرئيسي في الأسئلة",
    "تذكر: 'there is' للمفرد و 'there are' للجمع",
    "تذكر: الصفات المقارنة تأخذ 'er' أو 'more'",
    "تذكر: الصفات التفضيلية تأخذ 'est' أو 'most'",
    "تذكر: 'some' تستخدم في الجمل الإيجابية و 'any' في النفي"
  ];

  // Show welcome message for 10 seconds, then start motivational rotation
  useEffect(() => {
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(false);
    }, 10000); // Show welcome for 10 seconds

    return () => clearTimeout(welcomeTimer);
  }, []);

  // Change motivational message every 30 seconds (after welcome)
  useEffect(() => {
    if (!showWelcome) {
      const messageInterval = setInterval(() => {
        setCurrentMessageIndex(prev => (prev + 1) % motivationalMessages.length);
      }, 30000); // 30 seconds

      return () => clearInterval(messageInterval);
    }
  }, [showWelcome]);

  // Change learning review every 30 seconds (offset by 15 seconds, after welcome)
  useEffect(() => {
    if (!showWelcome) {
      const reviewInterval = setInterval(() => {
        setCurrentReviewIndex(prev => (prev + 1) % learningReviews.length);
      }, 30000); // 30 seconds

      // Start review changes 15 seconds after message changes for variety
      const initialDelay = setTimeout(() => {
        setCurrentReviewIndex(1);
      }, 15000);

      return () => {
        clearInterval(reviewInterval);
        clearTimeout(initialDelay);
      };
    }
  }, [showWelcome]);

  const currentMessage = motivationalMessages[currentMessageIndex];
  const currentReview = learningReviews[currentReviewIndex];
  const IconComponent = currentMessage.icon;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Welcome Message Card - Shows First */}
      {showWelcome && (
        <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-blue-500/10 backdrop-blur-sm border border-blue-200/50 rounded-xl p-6 mb-6 hover:shadow-xl transition-all duration-500">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
              <welcomeMessage.icon className="h-8 w-8 text-white" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🌟 رسالة ترحيب 🌟
              </h3>
              <p className="text-sm text-muted-foreground">Welcome Message</p>
            </div>
          </div>
          
          <div className="space-y-4 text-center">
            <p className="text-2xl md:text-3xl font-semibold text-primary-foreground leading-relaxed" dir="rtl">
              {welcomeMessage.arabic}
            </p>
            <p className="text-lg text-muted-foreground italic">
              {welcomeMessage.english}
            </p>
            <div className="pt-2">
              <p className="text-lg text-primary-foreground/80 leading-relaxed" dir="rtl">
                {welcomeMessage.subtitle}
              </p>
              <p className="text-base text-muted-foreground italic">
                {welcomeMessage.subtitleEnglish}
              </p>
            </div>
          </div>
          
          {/* Welcome Timer */}
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-500/20 rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-600 font-medium">رسالة ترحيب - تظهر لمدة 10 ثواني</span>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Motivational Message Card - Shows After Welcome */}
      {!showWelcome && (
        <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-blue-500/10 backdrop-blur-sm border border-blue-200/50 rounded-xl p-6 mb-6 hover:shadow-xl transition-all duration-500">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
              <IconComponent className="h-8 w-8 text-white" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ✨ رسالة تحفيزية ✨
              </h3>
              <p className="text-sm text-muted-foreground">Motivational Message</p>
            </div>
          </div>
          
          <div className="space-y-4 text-center">
            <p className="text-xl md:text-2xl font-semibold text-primary-foreground leading-relaxed" dir="rtl">
              {currentMessage.arabic}
            </p>
            <p className="text-lg text-muted-foreground italic">
              {currentMessage.english}
            </p>
          </div>
        </div>
      )}

      {/* Learning Review Card - Only Shows After Welcome */}
      {!showWelcome && (
        <div className="bg-gradient-to-br from-green-500/10 via-teal-500/10 to-green-500/10 backdrop-blur-sm border border-green-200/50 rounded-xl p-6 hover:shadow-xl transition-all duration-500">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="p-3 rounded-full bg-gradient-to-br from-green-500 to-teal-500">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              📚 تذكير تعليمي 📚
            </h3>
            <p className="text-sm text-muted-foreground">Learning Reminder</p>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-lg md:text-xl text-primary-foreground leading-relaxed font-medium" dir="rtl">
            {currentReview}
          </p>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">تتغير كل 30 ثانية</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
      )}

      {/* Progress Indicator - Only Shows After Welcome */}
      {!showWelcome && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-muted/50 rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">
              الرسالة {currentMessageIndex + 1} من {motivationalMessages.length}
            </span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">
              التذكير {currentReviewIndex + 1} من {learningReviews.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
