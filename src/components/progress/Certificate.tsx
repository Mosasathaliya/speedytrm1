'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, RotateCcw, Save, Star } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CertificateProps {
  userName?: string;
  completionDate?: string;
  credentialId?: string;
  courseName?: string;
  isGenerated?: boolean;
  onSave?: () => void;
  onDownload?: () => void;
}

const Certificate: React.FC<CertificateProps> = ({
  userName = "أحمد محمد",
  completionDate = new Date().toLocaleDateString('ar-SA'),
  credentialId = `SOM-${Date.now().toString().slice(-6)}`,
  courseName = "إتقان اللغة الإنجليزية للمبتدئين",
  isGenerated = false,
  onSave,
  onDownload
}) => {
  const [isSaved, setIsSaved] = useState(isGenerated);
  const [isGenerating, setIsGenerating] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!certificateRef.current) return;

    setIsGenerating(true);
    
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 297; // A4 landscape width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Speed-of-Mastery-Certificate-${credentialId}.pdf`);
      
      if (onDownload) onDownload();
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    setIsSaved(true);
    if (onSave) onSave();
  };

  const handleRegenerate = () => {
    if (!isSaved) {
      // Allow regeneration only if not saved
      window.location.reload();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Certificate Design */}
      <div 
        ref={certificateRef}
        className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 border-8 border-blue-600 rounded-lg p-8 shadow-2xl"
        style={{ minHeight: '600px' }}
      >
        {/* Decorative Corner Elements */}
        <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-blue-600 rounded-tl-lg"></div>
        <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-blue-600 rounded-tr-lg"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-blue-600 rounded-bl-lg"></div>
        <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-blue-600 rounded-br-lg"></div>

        {/* Header with Logo */}
        <div className="text-center mb-8">
          {/* Speed of Mastery Logo */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 mb-4 border-4 border-white shadow-lg">
            <div className="text-center">
              {/* Geometric Brain Icon */}
              <div className="w-12 h-12 relative">
                <svg viewBox="0 0 100 100" className="w-12 h-12 text-white fill-current">
                  <path d="M20,30 Q30,10 50,15 Q70,10 80,30 Q85,40 80,50 Q85,60 80,70 Q70,90 50,85 Q30,90 20,70 Q15,60 20,50 Q15,40 20,30 Z" />
                  <circle cx="35" cy="35" r="3" className="fill-blue-200" />
                  <circle cx="65" cy="35" r="3" className="fill-blue-200" />
                  <circle cx="50" cy="45" r="2" className="fill-blue-200" />
                  <circle cx="40" cy="55" r="2" className="fill-blue-200" />
                  <circle cx="60" cy="55" r="2" className="fill-blue-200" />
                  <path d="M30,40 L35,45 L30,50 M45,35 L50,40 L45,45 M55,40 L60,45 L55,50 M35,60 L40,65 L35,70 M55,60 L60,65 L55,70" 
                        stroke="currentColor" strokeWidth="1.5" fill="none" className="text-blue-200" />
                </svg>
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-blue-800 mb-2">SPEED OF MASTERY</h1>
          <p className="text-lg text-blue-600 mb-1" dir="rtl">سرعة الإتقان</p>
          <p className="text-sm text-gray-600">AI-Powered English Learning Platform</p>
        </div>

        {/* Certificate Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">CERTIFICATE OF COMPLETION</h2>
          <p className="text-xl text-gray-600" dir="rtl">شهادة إتمام الدورة</p>
        </div>

        {/* Certificate Content */}
        <div className="text-center mb-8">
          <p className="text-lg text-gray-700 mb-4">This is to certify that</p>
          <p className="text-lg text-gray-700 mb-4" dir="rtl">هذا يشهد أن</p>
          
          <div className="my-6">
            <h3 className="text-4xl font-bold text-blue-800 border-b-2 border-blue-300 pb-2 inline-block px-8">
              {userName}
            </h3>
          </div>
          
          <p className="text-lg text-gray-700 mb-2">has successfully completed</p>
          <p className="text-lg text-gray-700 mb-4" dir="rtl">قد أكمل بنجاح</p>
          
          <h4 className="text-2xl font-semibold text-blue-700 mb-6">{courseName}</h4>
          <p className="text-xl font-semibold text-blue-700 mb-6" dir="rtl">دورة تعلم اللغة الإنجليزية بالذكاء الاصطناعي</p>
        </div>

        {/* Achievement Details */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">56</div>
              <div className="text-sm text-gray-600">Lessons Completed</div>
              <div className="text-sm text-gray-600" dir="rtl">درس مكتمل</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-sm text-gray-600">Quizzes Passed</div>
              <div className="text-sm text-gray-600" dir="rtl">اختبار نجح</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">100</div>
              <div className="text-sm text-gray-600">Learning Items</div>
              <div className="text-sm text-gray-600" dir="rtl">عنصر تعليمي</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-end">
          <div className="text-left">
            <div className="border-t-2 border-gray-400 pt-2 w-48">
              <p className="text-sm font-semibold text-gray-700">Date / التاريخ</p>
              <p className="text-lg font-bold text-blue-700">{completionDate}</p>
            </div>
          </div>
          
          <div className="text-center">
            {/* Stars decoration */}
            <div className="flex justify-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-current mx-1" />
              ))}
            </div>
            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
              Credential ID: {credentialId}
            </Badge>
          </div>
          
          <div className="text-right">
            <div className="border-t-2 border-gray-400 pt-2 w-48">
              <p className="text-sm font-semibold text-gray-700">Authorized By</p>
              <p className="text-sm font-semibold text-gray-700" dir="rtl">مُعتمد من</p>
              <p className="text-lg font-bold text-blue-700">Speed of Mastery</p>
            </div>
          </div>
        </div>

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
          <div className="text-9xl font-bold text-blue-600 transform rotate-45">
            SPEED OF MASTERY
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-4 mt-6">
        {!isSaved && (
          <>
            <Button 
              onClick={handleRegenerate}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Regenerate
              <span dir="rtl">إعادة إنشاء</span>
            </Button>
            
            <Button 
              onClick={handleSave}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4" />
              Save Certificate
              <span dir="rtl">حفظ الشهادة</span>
            </Button>
          </>
        )}
        
        <Button 
          onClick={generatePDF}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Download className="w-4 h-4" />
          {isGenerating ? 'Generating...' : 'Download PDF'}
          <span dir="rtl">{isGenerating ? 'جاري الإنشاء...' : 'تحميل PDF'}</span>
        </Button>
      </div>

      {isSaved && (
        <div className="text-center mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-semibold">
            ✅ Certificate saved! You can only download now.
          </p>
          <p className="text-green-800 text-sm" dir="rtl">
            تم حفظ الشهادة! يمكنك التحميل فقط الآن.
          </p>
        </div>
      )}
    </div>
  );
};

export default Certificate;
