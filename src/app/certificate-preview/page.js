'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Eye, Share2, Home } from "lucide-react";
import { useRouter } from 'next/navigation';
import MockCertificate from "@/components/progress/MockCertificate";
import AnimatedBackground from "@/components/layout/AnimatedBackground";

export default function CertificatePreviewPage() {
  const router = useRouter();

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Speed of Mastery Certificate Preview',
          text: 'Check out this amazing certificate design from Speed of Mastery!',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnimatedBackground />
      
      <div className="relative z-10 container mx-auto p-4 md:p-8">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            onClick={handleBackToHome}
            variant="outline" 
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
            <span dir="rtl">العودة للرئيسية</span>
          </Button>
          
          <Button 
            onClick={handleShare}
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
            <span dir="rtl">مشاركة</span>
          </Button>
        </div>

        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-primary bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Certificate Preview
          </h1>
          <h2 className="text-2xl md:text-4xl font-semibold text-primary-foreground/90 mb-4" dir="rtl">
            معاينة الشهادة
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Preview the professional certificate design you'll receive upon completing the Speed of Mastery English course
          </p>
          <p className="text-base text-muted-foreground/80 max-w-3xl mx-auto mt-2" dir="rtl">
            شاهد تصميم الشهادة الاحترافية التي ستحصل عليها عند إكمال دورة Speed of Mastery للغة الإنجليزية
          </p>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <Card className="shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="text-center">
              <Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-blue-800">Free Preview</CardTitle>
              <CardTitle className="text-blue-800 text-sm" dir="rtl">معاينة مجانية</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-700 text-center">
                View the exact certificate design without any requirements or sign-up
              </p>
              <p className="text-xs text-blue-600 text-center mt-2" dir="rtl">
                شاهد تصميم الشهادة الدقيق بدون أي متطلبات أو تسجيل
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="text-center">
              <Download className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-green-800">Downloadable</CardTitle>
              <CardTitle className="text-green-800 text-sm" dir="rtl">قابل للتحميل</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-700 text-center">
                Download a sample certificate PDF to see the quality and design
              </p>
              <p className="text-xs text-green-600 text-center mt-2" dir="rtl">
                حمل ملف PDF نموذجي لرؤية الجودة والتصميم
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="text-center">
              <Home className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-purple-800">Professional</CardTitle>
              <CardTitle className="text-purple-800 text-sm" dir="rtl">احترافي</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-purple-700 text-center">
                High-quality certificate with Speed of Mastery branding and logo
              </p>
              <p className="text-xs text-purple-600 text-center mt-2" dir="rtl">
                شهادة عالية الجودة مع علامة Speed of Mastery التجارية والشعار
              </p>
            </CardContent>
          </Card>

        </div>

        {/* How to Earn Section */}
        <Card className="shadow-lg mb-8 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-800 text-center">
              How to Earn Your Official Certificate
            </CardTitle>
            <CardTitle className="text-orange-800 text-center text-lg" dir="rtl">
              كيفية كسب شهادتك الرسمية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-orange-800 mb-3">Requirements:</h3>
                <ul className="space-y-2 text-sm text-orange-700">
                  <li>✅ Complete all 56 lessons</li>
                  <li>✅ Pass all 8 quizzes (70% minimum)</li>
                  <li>✅ Pass the final exam (70% minimum)</li>
                  <li>✅ Maintain 70%+ average score</li>
                </ul>
              </div>
              <div dir="rtl">
                <h3 className="font-semibold text-orange-800 mb-3">المتطلبات:</h3>
                <ul className="space-y-2 text-sm text-orange-700">
                  <li>✅ إكمال جميع الدروس الـ 56</li>
                  <li>✅ اجتياز جميع الاختبارات الـ 8 (70% كحد أدنى)</li>
                  <li>✅ اجتياز الامتحان النهائي (70% كحد أدنى)</li>
                  <li>✅ الحفاظ على متوسط درجات 70%+</li>
                </ul>
              </div>
            </div>
            <div className="text-center mt-6">
              <Button 
                onClick={handleBackToHome}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Start Learning Journey
                <span className="mr-2" dir="rtl">ابدأ رحلة التعلم</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mock Certificate Display */}
        <Card className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-center text-primary">
              Certificate Preview
            </CardTitle>
            <CardTitle className="text-center text-primary text-lg" dir="rtl">
              معاينة الشهادة
            </CardTitle>
            <CardDescription className="text-center">
              This is exactly how your certificate will look when you complete the course
            </CardDescription>
            <CardDescription className="text-center text-sm" dir="rtl">
              هذا بالضبط كيف ستبدو شهادتك عندما تكمل الدورة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MockCertificate showDownloadButton={true} />
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="shadow-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white">
          <CardContent className="text-center p-8">
            <h2 className="text-3xl font-bold mb-4">Ready to Earn Your Certificate?</h2>
            <h3 className="text-2xl font-semibold mb-4" dir="rtl">مستعد لكسب شهادتك؟</h3>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of learners who have already earned their Speed of Mastery certificates
            </p>
            <p className="text-base mb-6 opacity-80" dir="rtl">
              انضم إلى آلاف المتعلمين الذين حصلوا بالفعل على شهادات Speed of Mastery
            </p>
            <Button 
              onClick={handleBackToHome}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
            >
              Start Your Learning Journey Today
              <span className="mr-2" dir="rtl">ابدأ رحلة التعلم اليوم</span>
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
