'use client';

import React, { useState } from 'react';
import './learn-styles.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Commented out complex components for now to avoid TypeScript issues
// import AILessonCard from '@/components/learn/AILessonCard';
// import ComprehensiveSequentialSystem from '@/components/learn/ComprehensiveSequentialSystem';
// import UserJourneyNavigator from '@/components/learn/UserJourneyNavigator';
// import OptimizedLearnPage from '@/components/learn/OptimizedLearnPage';
// import WordTranslationPopup from '@/components/learn/WordTranslationPopup';
// import { useGlobalWordTranslation } from '@/hooks/useGlobalWordTranslation';
import { 
  Sparkles, 
  BookOpen, 
  GraduationCap, 
  Target,
  Brain,
  Search,
  Play,
  Users,
  Gamepad2 
} from 'lucide-react';

export default function LearnPage() {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [userLevel, setUserLevel] = useState('beginner');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Simplified component for demo - will be enhanced later
  const currentLearningCard = {
    id: 'lesson-1',
    title: 'Introduction to English Grammar',
    titleAr: 'مقدمة في قواعد اللغة الإنجليزية',
    description: 'Learn the fundamental concepts of English grammar with comprehensive explanations in Arabic.',
    descriptionAr: 'تعلم المفاهيم الأساسية لقواعد اللغة الإنجليزية مع شروحات شاملة باللغة العربية.',
    type: 'lesson',
    index: 0,
    is_completed: false,
    is_locked: false,
    is_accessible: true
  };

  // Predefined topics for quick selection
  const topics = [
    { id: 'alphabet', name: 'English Alphabet', arabic: 'الأبجدية الإنجليزية', category: 'basics' },
    { id: 'numbers', name: 'Numbers', arabic: 'الأرقام', category: 'basics' },
    { id: 'colors', name: 'Colors', arabic: 'الألوان', category: 'basics' },
    { id: 'greetings', name: 'Greetings', arabic: 'التحيات', category: 'basics' },
    { id: 'family', name: 'Family', arabic: 'العائلة', category: 'basics' },
    { id: 'food', name: 'Food', arabic: 'الطعام', category: 'basics' },
    { id: 'animals', name: 'Animals', arabic: 'الحيوانات', category: 'basics' },
    { id: 'verbs', name: 'Common Verbs', arabic: 'الأفعال الشائعة', category: 'grammar' },
    { id: 'nouns', name: 'Common Nouns', arabic: 'الأسماء الشائعة', category: 'grammar' },
    { id: 'adjectives', name: 'Adjectives', arabic: 'الصفات', category: 'grammar' },
    { id: 'tenses', name: 'Tenses', arabic: 'الأزمنة', category: 'grammar' },
    { id: 'prepositions', name: 'Prepositions', arabic: 'حروف الجر', category: 'grammar' },
    { id: 'phrasal-verbs', name: 'Phrasal Verbs', arabic: 'الأفعال الاصطلاحية', category: 'vocabulary' },
    { id: 'idioms', name: 'Idioms', arabic: 'التعابير الاصطلاحية', category: 'vocabulary' },
    { id: 'business-english', name: 'Business English', arabic: 'الإنجليزية للأعمال', category: 'specialized' },
    { id: 'travel-english', name: 'Travel English', arabic: 'الإنجليزية للسفر', category: 'specialized' },
  ];

  const categories = [
    { id: 'basics', name: 'Basics', arabic: 'الأساسيات', icon: BookOpen },
    { id: 'grammar', name: 'Grammar', arabic: 'القواعد', icon: GraduationCap },
    { id: 'vocabulary', name: 'Vocabulary', arabic: 'المفردات', icon: Target },
    { id: 'specialized', name: 'Specialized', arabic: 'متخصص', icon: Brain },
  ];

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
  };

  const filteredTopics = topics.filter(topic =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.arabic.includes(searchQuery)
  );

  // Simple Learn Card Component
  const LearnCard = ({ card }) => {
    return (
      <div className="learn-page-container">
        <div className="learn-card">
          <Card className="relative overflow-hidden transition-all duration-300 shadow-xl backdrop-blur-sm bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-blue-500/10 border-2 border-blue-200 hover:shadow-2xl">
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl md:text-2xl">{card.title}</CardTitle>
                    <p className="text-sm text-muted-foreground font-arabic" dir="rtl">
                      {card.titleAr}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {card.index + 1} / 100
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="relative z-10 min-h-[300px]">
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-base leading-relaxed">{card.description}</p>
                  <p className="text-sm text-muted-foreground font-arabic leading-relaxed" dir="rtl">
                    {card.descriptionAr}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-white/50 to-gray-50/50 rounded-lg p-6 border border-gray-200 backdrop-blur-sm min-h-[200px]">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Lesson Content</h3>
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4 mr-2" />
                        Start
                      </Button>
                    </div>
                    
                    <div className="prose prose-sm max-w-none">
                      <p className="text-muted-foreground">
                        This is where the actual lesson content would be displayed.
                        The content is personalized for each user and generated based on their learning progress.
                      </p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                        <h4 className="font-medium text-blue-900 mb-2">📚 Learning Objectives:</h4>
                        <ul className="text-blue-800 text-sm space-y-1">
                          <li>• Understand basic English sentence structure</li>
                          <li>• Learn subject-verb agreement rules</li>
                          <li>• Practice with interactive examples</li>
                          <li>• Complete assessment quiz</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Full Screen Button */}
        <div className="flex justify-center mt-4">
          <Button variant="outline" size="sm" className="backdrop-blur-sm bg-white/80 border-gray-200 hover:bg-white">
            <Target className="h-4 w-4 mr-2" />
            Full Screen
          </Button>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            size="lg"
            disabled={true}
            className="backdrop-blur-sm bg-white/80 border-gray-200 hover:bg-white opacity-50 cursor-not-allowed"
          >
            <GraduationCap className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <div className="text-center">
            <div className="text-xs text-muted-foreground">
              Item 1 of 100
            </div>
          </div>

          <Button
            variant="outline"
            size="lg"
            className="backdrop-blur-sm bg-white/80 border-gray-200 hover:bg-white"
          >
            Next
            <Target className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 relative">
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-bold text-primary mb-4">
          مركز التعلم - Learning Center
        </h1>
        <p className="text-lg text-muted-foreground">
          AI-Powered English Learning with Arabic Explanations
        </p>
        <p className="text-sm font-arabic text-muted-foreground">
          تعلم اللغة الإنجليزية بشرح عربي مفصل مع الذكاء الاصطناعي
        </p>
      </header>

      <main className="max-w-7xl mx-auto">
        <Tabs defaultValue="optimized-learn" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="optimized-learn" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Learn
            </TabsTrigger>
            <TabsTrigger value="journey-map" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Journey Map
            </TabsTrigger>
            <TabsTrigger value="ai-generator" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Generator
            </TabsTrigger>
            <TabsTrigger value="topics" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Topics
            </TabsTrigger>
          </TabsList>

          {/* Main Learn Tab - 65% Center Card */}
          <TabsContent value="optimized-learn" className="space-y-6">
            <LearnCard card={currentLearningCard} />
          </TabsContent>

          {/* Journey Map Tab */}
          <TabsContent value="journey-map" className="space-y-6">
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-2">🗺️ Your Learning Journey Map</h2>
                <p className="text-muted-foreground mb-4">
                  Visual overview of your 100-item learning journey with progress tracking.
                </p>
                <p className="text-sm font-arabic text-muted-foreground">
                  نظرة عامة مرئية على رحلتك التعليمية المكونة من 100 عنصر مع تتبع التقدم.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-10 gap-2 max-w-4xl mx-auto">
              {Array.from({ length: 100 }).map((_, index) => {
                const isCurrent = index === 0;
                const isCompleted = false;
                const isQuiz = [11, 23, 34, 45, 56, 67, 78, 89, 99].includes(index);
                
                return (
                  <div
                    key={index}
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transition-all
                      ${isCurrent ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' : ''}
                      ${isCompleted ? 'bg-green-500 text-white' : ''}
                      ${!isCurrent && !isCompleted ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : ''}
                    `}
                    title={`Item ${index + 1} - ${isQuiz ? 'Quiz' : 'Lesson'}`}
                  >
                    {isQuiz ? <Target className="h-3 w-3" /> : index + 1}
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="ai-generator" className="space-y-6">
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-2">✨ AI Lesson Generator</h2>
                <p className="text-muted-foreground mb-4">
                  Generate custom English lessons on any topic, tailored to your level, with comprehensive Arabic explanations.
                </p>
                <p className="text-sm font-arabic text-muted-foreground">
                  أنشئ دروسًا إنجليزية مخصصة حول أي موضوع، مصممة لمستواك، مع شروحات عربية شاملة.
                </p>
              </div>
              <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                <div className="w-full md:w-1/2">
                  <Label htmlFor="topic-input" className="sr-only">Topic</Label>
                  <Input
                    id="topic-input"
                    type="text"
                    placeholder="Enter a topic (e.g., 'Present Simple', 'Travel Vocabulary')"
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="w-full md:w-1/2 flex justify-center gap-2">
                  <Button
                    variant={userLevel === 'beginner' ? 'default' : 'outline'}
                    onClick={() => setUserLevel('beginner')}
                  >
                    Beginner
                  </Button>
                  <Button
                    variant={userLevel === 'intermediate' ? 'default' : 'outline'}
                    onClick={() => setUserLevel('intermediate')}
                  >
                    Intermediate
                  </Button>
                  <Button
                    variant={userLevel === 'advanced' ? 'default' : 'outline'}
                    onClick={() => setUserLevel('advanced')}
                  >
                    Advanced
                  </Button>
                </div>
              </div>
            </div>
            
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Sparkles className="h-16 w-16 mx-auto text-purple-500" />
                  <h3 className="text-xl font-semibold">AI Lesson Generator</h3>
                  <p className="text-muted-foreground">
                    Enter a topic above and select your level to generate a personalized lesson.
                  </p>
                  <Button className="w-full" disabled={!selectedTopic}>
                    Generate Lesson
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="topics" className="space-y-6">
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-2">📚 Explore Topics</h2>
                <p className="text-muted-foreground mb-4">
                  Browse lessons by category or search for specific topics.
                </p>
                <p className="text-sm font-arabic text-muted-foreground">
                  تصفح الدروس حسب الفئة أو ابحث عن مواضيع محددة.
                </p>
              </div>
              <div className="relative w-full max-w-md mx-auto">
                <Input
                  type="text"
                  placeholder="Search topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(category => (
                <Card key={category.id} className="bg-card text-card-foreground shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <category.icon className="h-4 w-4 text-muted-foreground" />
                      {category.name}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground font-arabic" dir="rtl">{category.arabic}</span>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {topics.filter(topic => topic.category === category.id).map(topic => (
                        <Badge
                          key={topic.id}
                          variant="secondary"
                          className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                          onClick={() => handleTopicSelect(topic.name)}
                        >
                          {topic.name}
                          <span className="ml-1 text-xs opacity-75 font-arabic" dir="rtl">({topic.arabic})</span>
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
