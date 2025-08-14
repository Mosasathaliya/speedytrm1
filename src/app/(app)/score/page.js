// src/app/(app)/score/page.js
"use client"; 

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, CheckCircle, Target, Zap, User, Award, Edit, Star, TrendingUp, Brain, Gamepad2, Trophy, BookOpen, Calendar, Clock } from "lucide-react";
import { Bar, BarChart as RechartsBarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ThemeSwitcher from "@/components/home/ThemeSwitcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle as DialogTitleComponent, DialogDescription as DialogDescriptionComponent } from "@/components/ui/dialog";
import Certificate from "@/components/progress/Certificate";
import MockCertificate from "@/components/progress/MockCertificate";
import userProfileService from "@/lib/services/userProfileService";
import AnimatedBackground from "@/components/layout/AnimatedBackground";
import BottomNavBar from "@/components/navigation/BottomNavBar";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ScorePage() {
  const [mounted, setMounted] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [learningProgress, setLearningProgress] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [certificateData, setCertificateData] = useState(null);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    setMounted(true);
    loadUserData();
  }, []);

  const loadUserData = () => {
    const profile = userProfileService.getUserProfile();
    const progress = userProfileService.getLearningProgress();
    const stats = userProfileService.getProgressStatistics();
    const userAchievements = userProfileService.checkAchievements();

    setUserProfile(profile);
    setLearningProgress(progress);
    setStatistics(stats);
    setAchievements(userAchievements);
    setEditedName(profile?.fullName || '');

    // Generate sample data for demonstration
    if (progress && !progress.lessons.completed) {
      generateSampleProgress();
    }
  };

  const generateSampleProgress = () => {
    // Simulate completed lessons and quizzes for demonstration
    for (let i = 1; i <= 56; i++) {
      userProfileService.completeLesson(`lesson_${i}`, Math.floor(Math.random() * 30) + 70);
    }

    for (let i = 1; i <= 8; i++) {
      const score = Math.floor(Math.random() * 30) + 70;
      userProfileService.completeQuiz(`quiz_${i}`, score, score >= 70);
    }

    // Complete final exam
    userProfileService.completeFinalExam(85);

    // Reload data
    loadUserData();
  };

  const handleSaveProfile = () => {
    if (editedName.trim()) {
      userProfileService.updateUserProfile({ fullName: editedName.trim() });
      setIsEditingProfile(false);
      loadUserData();
    }
  };

  const handleGenerateCertificate = () => {
    try {
      const certData = userProfileService.generateCertificate();
      setCertificateData(certData);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSaveCertificate = () => {
    try {
      userProfileService.saveCertificate();
      loadUserData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDownloadCertificate = () => {
    try {
      userProfileService.downloadCertificate();
      loadUserData();
    } catch (error) {
      alert(error.message);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <AnimatedBackground />
        <div className="container mx-auto p-4 md:p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-muted rounded-md"></div>
            <div className="h-24 bg-muted rounded-md"></div>
            <div className="h-64 bg-muted rounded-md"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-40 bg-muted rounded-md"></div>
              <div className="h-40 bg-muted rounded-md"></div>
            </div>
          </div>
        </div>
        <BottomNavBar />
      </div>
    );
  }

  if (!userProfile || !learningProgress || !statistics) {
    return <div>Loading...</div>;
  }

  const weeklyActivityData = learningProgress.weeklyActivity.lessons.map((lessons, index) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index],
    dayAr: ['اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت', 'أحد'][index],
    lessons: lessons,
    quizzes: learningProgress.weeklyActivity.quizzes[index]
  }));

  const skillsProgressData = [
    { skill: 'Grammar', skillAr: 'القواعد', progress: statistics.lessonsCompletion, icon: BookOpen },
    { skill: 'Vocabulary', skillAr: 'المفردات', progress: Math.min(100, learningProgress.lessons.completed * 1.2), icon: Brain },
    { skill: 'Listening', skillAr: 'الاستماع', progress: Math.min(100, learningProgress.quizzes.completed * 12), icon: Target },
    { skill: 'Speaking', skillAr: 'التحدث', progress: Math.min(100, learningProgress.aiInteractions.voiceTranslator.completedTranslations * 3), icon: Zap }
  ];

  const learningJourneyData = [
    { name: 'Lessons', nameAr: 'الدروس', completed: learningProgress.lessons.completed, total: learningProgress.lessons.total, color: '#3b82f6' },
    { name: 'Games', nameAr: 'الألعاب', completed: learningProgress.games.completed, total: learningProgress.games.total, color: '#10b981' },
    { name: 'Quizzes', nameAr: 'الاختبارات', completed: learningProgress.quizzes.completed, total: learningProgress.quizzes.total, color: '#f59e0b' },
    { name: 'AI Sessions', nameAr: 'جلسات الذكاء الاصطناعي', completed: learningProgress.aiInteractions.personalAI.sessions + learningProgress.aiInteractions.moodTranslator.completedMoods, total: 50, color: '#8b5cf6' }
  ];

  const chartConfig = {
    lessons: { label: "الدروس المكتملة", color: "#3b82f6" },
    quizzes: { label: "الاختبارات المجتازة", color: "#10b981" }
  };

  const certificateStatus = learningProgress.certificateStatus;
  const isEligibleForCertificate = certificateStatus.eligible;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnimatedBackground />
      
      <div className="relative z-10 container mx-auto p-4 md:p-8 pb-24">
        
        {/* User Profile Card */}
        <Card className="mb-8 shadow-lg bg-card/90 backdrop-blur-sm border-2 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline text-primary flex items-center">
              <User className="ml-2"/> 
              <span dir="rtl">ملفك الشخصي</span>
            </CardTitle>
            <ThemeSwitcher />
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-primary shadow-lg">
              <AvatarImage src={userProfile.avatar || "https://placehold.co/150x150.png"} alt="User Avatar" />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                {userProfile.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              {isEditingProfile ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder="أدخل اسمك الكامل"
                    className="text-xl font-bold"
                    dir="rtl"
                  />
                  <Button onClick={handleSaveProfile} size="sm">حفظ</Button>
                  <Button onClick={() => setIsEditingProfile(false)} variant="outline" size="sm">إلغاء</Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold font-headline text-primary-foreground" dir="rtl">
                    {userProfile.fullName || 'الاسم غير محدد'}
                  </h3>
                  <Button onClick={() => setIsEditingProfile(true)} variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <p className="text-sm text-muted-foreground font-body" dir="rtl">
                عضو منذ {new Date(userProfile.joinDate).toLocaleDateString('ar-SA')}
              </p>
              <div className="flex items-center gap-4">
                <Badge className="bg-blue-100 text-blue-800">
                  المستوى: متقدم مبتدئ
                </Badge>
                <Badge className="bg-green-100 text-green-800">
                  معرف المستخدم: {userProfile.id.slice(-8)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">إجمالي التقدم</p>
                  <p className="text-3xl font-bold text-blue-600">{statistics.overallCompletion}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">الدروس المكتملة</p>
                  <p className="text-3xl font-bold text-green-600">{learningProgress.lessons.completed}</p>
                  <p className="text-xs text-muted-foreground">من {learningProgress.lessons.total}</p>
                </div>
                <BookOpen className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">متوسط الدرجات</p>
                  <p className="text-3xl font-bold text-yellow-600">{Math.round(statistics.averageQuizScore)}%</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">الامتحان النهائي</p>
                  <p className="text-3xl font-bold text-purple-600">{statistics.finalExamScore}%</p>
                </div>
                <Trophy className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skills Progress */}
        <Card className="mb-8 shadow-lg bg-card/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-headline text-primary flex items-center">
              <Target className="ml-2"/> 
              <span dir="rtl">تقدم المهارات</span>
            </CardTitle>
            <CardDescription className="font-body" dir="rtl">
              إتقانك الحالي لمهارات اللغة الإنجليزية المختلفة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {skillsProgressData.map((skill, index) => {
              const IconComponent = skill.icon;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5 text-primary" />
                      <span className="font-body text-sm font-medium text-card-foreground">{skill.skill}</span>
                      <span className="font-body text-sm text-muted-foreground" dir="rtl">({skill.skillAr})</span>
                    </div>
                    <span className="font-body text-xs text-muted-foreground">{Math.round(skill.progress)}% مكتمل</span>
                  </div>
                  <Progress value={skill.progress} className="h-3" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Mock Certificate Section */}
        <Dialog>
          <Card className="shadow-lg mb-6 bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200">
            <CardHeader className="flex flex-row items-center gap-4">
              <Eye className="w-10 h-10 text-gray-600" />
              <div className="flex-1">
                <CardTitle className="font-headline text-primary" dir="rtl">
                  معاينة الشهادة النموذجية
                </CardTitle>
                <CardDescription className="font-body">
                  شاهد كيف ستبدو شهادتك النهائية - متاحة للجميع بدون أي متطلبات
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2" dir="rtl">✨ معاينة مجانية للشهادة</h4>
                  <ul className="text-sm text-blue-700 space-y-1" dir="rtl">
                    <li>👁️ شاهد تصميم شهادة Speed of Mastery المميز</li>
                    <li>🎨 تصميم احترافي مع شعار الشركة</li>
                    <li>📥 قابل للتحميل كملف PDF</li>
                    <li>🆓 متاح للجميع بدون أي شروط</li>
                  </ul>
                </div>

                <div className="text-center">
                  <DialogTrigger asChild>
                    <Button className="bg-gray-600 hover:bg-gray-700 text-white font-headline">
                      <Eye className="w-4 h-4 mr-2" />
                      مشاهدة الشهادة النموذجية
                    </Button>
                  </DialogTrigger>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <DialogContent className="max-w-5xl p-0 bg-transparent border-0">
            <DialogHeader className="sr-only">
              <DialogTitleComponent>Sample Certificate Preview</DialogTitleComponent>
              <DialogDescriptionComponent>Preview of Speed of Mastery certificate design</DialogDescriptionComponent>
            </DialogHeader>
            <MockCertificate />
          </DialogContent>
        </Dialog>

        {/* Certificate Section */}
        <Dialog>
          <Card className={`shadow-lg mb-8 ${isEligibleForCertificate ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 'bg-card/90 backdrop-blur-sm'}`}>
            <CardHeader className="flex flex-row items-center gap-4">
              <Award className={`w-12 h-12 ${isEligibleForCertificate ? 'text-green-600' : 'text-gray-400'}`} />
              <div className="flex-1">
                <CardTitle className="font-headline text-primary" dir="rtl">
                  شهادة إتمام دورة Speed of Mastery
                </CardTitle>
                <CardDescription className="font-body">
                  {isEligibleForCertificate 
                    ? 'مبروك! لقد أكملت جميع متطلبات الحصول على الشهادة'
                    : 'أكمل جميع الدروس والاختبارات واجتز الامتحان النهائي للحصول على الشهادة'
                  }
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {isEligibleForCertificate ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-100 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2" dir="rtl">متطلبات الشهادة مكتملة ✅</h4>
                    <ul className="text-sm text-green-700 space-y-1" dir="rtl">
                      <li>✅ جميع الدروس مكتملة ({learningProgress.lessons.completed}/{learningProgress.lessons.total})</li>
                      <li>✅ جميع الاختبارات منجزة ({learningProgress.quizzes.passed}/{learningProgress.quizzes.total})</li>
                      <li>✅ الامتحان النهائي مجتاز ({statistics.finalExamScore}% ≥ 70%)</li>
                      <li>✅ متوسط الدرجات ({Math.round(statistics.averageQuizScore)}% ≥ 70%)</li>
                    </ul>
                  </div>

                  {certificateStatus.saved ? (
                    <div className="text-center space-y-4">
                      <p className="text-green-800 font-semibold" dir="rtl">
                        تم حفظ الشهادة! يمكنك تحميلها الآن فقط
                      </p>
                      <DialogTrigger asChild>
                        <Button 
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={handleDownloadCertificate}
                        >
                          تحميل الشهادة (PDF)
                        </Button>
                      </DialogTrigger>
                      <p className="text-xs text-muted-foreground">
                        تم تحميل الشهادة {certificateStatus.downloadCount} مرة
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <DialogTrigger asChild>
                        <Button 
                          onClick={handleGenerateCertificate}
                          className="bg-green-600 hover:bg-green-700 text-white font-headline"
                        >
                          إنشاء الشهادة
                        </Button>
                      </DialogTrigger>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-100 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2" dir="rtl">متطلبات الشهادة</h4>
                    <ul className="text-sm text-gray-700 space-y-1" dir="rtl">
                      <li className={learningProgress.lessons.completed >= learningProgress.lessons.total ? '✅' : '❌'}>
                        إكمال جميع الدروس ({learningProgress.lessons.completed}/{learningProgress.lessons.total})
                      </li>
                      <li className={learningProgress.quizzes.passed >= learningProgress.quizzes.total ? '✅' : '❌'}>
                        اجتياز جميع الاختبارات ({learningProgress.quizzes.passed}/{learningProgress.quizzes.total})
                      </li>
                      <li className={learningProgress.finalExam.passed ? '✅' : '❌'}>
                        اجتياز الامتحان النهائي ({statistics.finalExamScore}% / 70%+)
                      </li>
                      <li className={statistics.averageQuizScore >= 70 ? '✅' : '❌'}>
                        متوسط درجات 70% أو أكثر ({Math.round(statistics.averageQuizScore)}%)
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <DialogContent className="max-w-5xl p-0 bg-transparent border-0">
            <DialogHeader className="sr-only">
              <DialogTitleComponent>Certificate of Completion</DialogTitleComponent>
              <DialogDescriptionComponent>Speed of Mastery course completion certificate</DialogDescriptionComponent>
            </DialogHeader>
            {certificateData && (
              <Certificate 
                userName={certificateData.userName}
                credentialId={certificateData.credentialId}
                completionDate={certificateData.completionDate}
                courseName={certificateData.courseName}
                isGenerated={certificateStatus.generated}
                onSave={handleSaveCertificate}
                onDownload={handleDownloadCertificate}
              />
            )}
          </DialogContent>
        </Dialog>

      </div>

      <BottomNavBar />
    </div>
  );
}
