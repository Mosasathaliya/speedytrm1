'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import userTrackingService from '@/lib/services/userTrackingService';

export default function HomePage() {
  const router = useRouter();
  
  // Redirect to dashboard
  useEffect(() => {
    userTrackingService.trackPageView('home');
    router.push('/(app)/home');
  }, [router]);
  
  return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnimatedBackground />
      
      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-6">
          {/* Arabic Main Heading */}
          <div className="space-y-3">
            <h1 className="text-5xl md:text-7xl font-bold text-primary bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent" dir="rtl">
              الدليل حسب سرعة الإتقان
            </h1>
            <h2 className="text-2xl md:text-4xl font-semibold text-primary-foreground/90">
              The Guide by Speed of Mastery
            </h2>
          </div>
          


          {/* Motivational Review Card */}
          <div className="mt-8">
            <MotivationalReviewCard />
          </div>
          
          {/* Basic English Section */}
          <div className="w-full max-w-6xl mx-auto mt-12">
            {/* Basic English Subheading */}
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2" dir="rtl">
                الإنجليزية الأساسية
              </h2>
              <p className="text-lg text-muted-foreground">Basic English Learning</p>
            </div>
            
            {/* Slidable Cards Grid */}
            {/* Encourage starting study (no login required) */}
            <div className="flex justify-center mb-6">
              <Link href="/learn" className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition">
                Start Studying
              </Link>
            </div>
            <BasicEnglishCards />
          </div>
          
          {/* Learning with Gaming Section */}
          <div className="w-full max-w-6xl mx-auto mt-16">
            {/* Gaming Subheading */}
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2" dir="rtl">
                التعلم مع الألعاب
              </h2>
              <p className="text-lg text-muted-foreground">Learning with Gaming</p>
            </div>
            
            {/* Gaming Cards Grid */}
            <GamingCards />
          </div>
          
          {/* Certificate Preview Section */}
          <div className="w-full max-w-6xl mx-auto mt-16">
            {/* Certificate Preview Card */}
            <Link href="/certificate-preview" className="block">
              <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-50 border-2 border-yellow-200 rounded-xl p-8 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                <div className="text-center space-y-6">
                  {/* Certificate Icon */}
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  
                  {/* Certificate Title */}
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
                      Certificate Preview
                    </h2>
                    <h3 className="text-2xl font-semibold text-orange-800" dir="rtl">
                      معاينة الشهادة
                    </h3>
                  </div>
                  
                  {/* Certificate Description */}
                  <div className="space-y-2">
                    <p className="text-lg text-orange-700 font-medium">
                      See exactly how your Speed of Mastery certificate will look!
                    </p>
                    <p className="text-base text-orange-600" dir="rtl">
                      شاهد بالضبط كيف ستبدو شهادة Speed of Mastery الخاصة بك!
                    </p>
                  </div>
                  
                  {/* Features */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="flex items-center justify-center gap-2 text-orange-700">
                      <Eye className="h-5 w-5" />
                      <span className="text-sm font-medium">Free Preview</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-orange-700">
                      <Trophy className="h-5 w-5" />
                      <span className="text-sm font-medium">Professional Design</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-orange-700">
                      <GraduationCap className="h-5 w-5" />
                      <span className="text-sm font-medium">Downloadable PDF</span>
                    </div>
                  </div>
                  
                  {/* Call to Action */}
                  <div className="pt-4">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-full font-semibold group-hover:shadow-lg transition-shadow">
                      <Eye className="h-5 w-5" />
                      <span>View Certificate Sample</span>
                      <span dir="rtl">عرض نموذج الشهادة</span>
                    </div>
                  </div>
                  
                  {/* No Requirements Notice */}
                  <div className="text-xs text-orange-600/80">
                    ✨ No registration or requirements needed • متاح للجميع بدون متطلبات ✨
                  </div>
                </div>
              </div>
            </Link>
          </div>
          
          {/* Dashboard Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-6xl w-full">
            {/* Home Card */}
            <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-blue-500/10 backdrop-blur-sm border border-blue-200/50 rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 group-hover:scale-110 transition-transform">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">Home</h3>
                <p className="text-sm text-muted-foreground text-center" dir="rtl">الرئيسية</p>
                <p className="text-xs text-muted-foreground/70 text-center">Your learning dashboard</p>
              </div>
            </div>
            
            {/* Learn Card */}
            <div className="bg-gradient-to-br from-green-500/10 via-teal-500/10 to-green-500/10 backdrop-blur-sm border border-green-200/50 rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 rounded-full bg-gradient-to-br from-green-500 to-teal-500 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">Learn</h3>
                <p className="text-sm text-muted-foreground text-center" dir="rtl">التعلم</p>
                <p className="text-xs text-muted-foreground/70 text-center">Interactive lessons & exercises</p>
              </div>
            </div>
            
            {/* AI Card */}
            <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10 backdrop-blur-sm border border-purple-200/50 rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 group-hover:scale-110 transition-transform">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">AI</h3>
                <p className="text-sm text-muted-foreground text-center" dir="rtl">الذكاء الاصطناعي</p>
                <p className="text-xs text-muted-foreground/70 text-center">AI-powered learning</p>
              </div>
            </div>
            
            {/* Score Card */}
            <div className="bg-gradient-to-br from-orange-500/10 via-red-500/10 to-orange-500/10 backdrop-blur-sm border border-orange-200/50 rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 rounded-full bg-gradient-to-br from-orange-500 to-red-500 group-hover:scale-110 transition-transform">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">Score</h3>
                <p className="text-sm text-muted-foreground text-center" dir="rtl">النتائج</p>
                <p className="text-xs text-muted-foreground/70 text-center">Progress & achievements</p>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="mt-16 space-y-8">
            <h3 className="text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ✨ Why Choose Speed of Mastery? ✨
            </h3>
            <p className="text-lg text-center text-muted-foreground font-arabic" dir="rtl">
              لماذا تختار سرعة الإتقان؟
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-lg">AI-Powered Learning</h4>
                <p className="text-sm text-muted-foreground" dir="rtl">تعلم مدعوم بالذكاء الاصطناعي</p>
                <p className="text-xs text-muted-foreground/70">Personalized lessons generated just for you</p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-lg">100-Item Journey</h4>
                <p className="text-sm text-muted-foreground" dir="rtl">رحلة من 100 عنصر</p>
                <p className="text-xs text-muted-foreground/70">Comprehensive learning path with games & quizzes</p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-lg">Arabic Explanations</h4>
                <p className="text-sm text-muted-foreground" dir="rtl">شروحات باللغة العربية</p>
                <p className="text-xs text-muted-foreground/70">Learn English with native Arabic guidance</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="text-center p-4 bg-blue-50/50 rounded-lg border border-blue-100/50">
              <div className="text-2xl font-bold text-blue-600">56</div>
              <div className="text-xs text-muted-foreground">Lessons</div>
              <div className="text-xs text-muted-foreground font-arabic" dir="rtl">درس</div>
            </div>
            <div className="text-center p-4 bg-green-50/50 rounded-lg border border-green-100/50">
              <div className="text-2xl font-bold text-green-600">35</div>
              <div className="text-xs text-muted-foreground">Games</div>
              <div className="text-xs text-muted-foreground font-arabic" dir="rtl">لعبة</div>
            </div>
            <div className="text-center p-4 bg-purple-50/50 rounded-lg border border-purple-100/50">
              <div className="text-2xl font-bold text-purple-600">8</div>
              <div className="text-xs text-muted-foreground">Quizzes</div>
              <div className="text-xs text-muted-foreground font-arabic" dir="rtl">اختبار</div>
            </div>
            <div className="text-center p-4 bg-orange-50/50 rounded-lg border border-orange-100/50">
              <div className="text-2xl font-bold text-orange-600">1</div>
              <div className="text-xs text-muted-foreground">Final Exam</div>
              <div className="text-xs text-muted-foreground font-arabic" dir="rtl">امتحان نهائي</div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavBar />
    </div>
  );
}
