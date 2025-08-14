'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WordTranslationData {
  word: string;
  arabic_translation: string;
  arabic_meaning: string;
  alternative_meanings_arabic: string[];
  part_of_speech_arabic: string;
  pronunciation_guide_arabic: string;
  example_english: string;
  example_arabic: string;
  definition_arabic: string;
}

interface WordTranslationPopupProps {
  word: string;
  position: { x: number; y: number };
  onClose: () => void;
}

const WordTranslationPopup: React.FC<WordTranslationPopupProps> = ({
  word,
  position,
  onClose
}) => {
  const [translationData, setTranslationData] = useState<WordTranslationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTranslation();
  }, [word]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const fetchTranslation = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/ai/translate-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: word.toLowerCase().trim() })
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      setTranslationData(data);
    } catch (err) {
      console.error('Translation error:', err);
      setError('Translation unavailable');
      // Fallback translation - all in Arabic
      setTranslationData({
        word: word,
        arabic_translation: `ترجمة ${word}`,
        arabic_meaning: `معنى الكلمة ${word} باللغة العربية`,
        alternative_meanings_arabic: ["معنى بديل"],
        part_of_speech_arabic: "غير محدد",
        pronunciation_guide_arabic: `دليل نطق ${word}`,
        example_english: `Example with ${word}`,
        example_arabic: `مثال مع ${word}`,
        definition_arabic: `تعريف كامل للكلمة ${word} باللغة العربية`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const playPronunciation = async () => {
    if (isPlaying) return;

    try {
      setIsPlaying(true);
      const response = await fetch('/api/ai/pronounce-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.onerror = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };

        await audio.play();
      } else {
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Pronunciation error:', error);
      setIsPlaying(false);
    }
  };

  // Calculate popup position to stay within viewport
  const getPopupStyle = () => {
    const padding = 10;
    const popupWidth = 320;
    const popupHeight = 200;
    
    let left = position.x;
    let top = position.y + 30; // Offset below the word

    // Adjust if popup would go off right edge
    if (left + popupWidth > window.innerWidth - padding) {
      left = window.innerWidth - popupWidth - padding;
    }

    // Adjust if popup would go off left edge
    if (left < padding) {
      left = padding;
    }

    // Adjust if popup would go off bottom edge
    if (top + popupHeight > window.innerHeight - padding) {
      top = position.y - popupHeight - 10; // Show above the word
    }

    // Adjust if popup would go off top edge
    if (top < padding) {
      top = padding;
    }

    return {
      position: 'fixed' as const,
      left: `${left}px`,
      top: `${top}px`,
      zIndex: 1000,
      width: `${popupWidth}px`,
      maxHeight: `${popupHeight}px`
    };
  };

  return (
    <div
      ref={popupRef}
      style={getPopupStyle()}
      className="animate-fade-in-scale"
    >
      <Card className="border-2 border-primary/20 shadow-lg bg-white dark:bg-gray-900">
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-primary">{word}</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={playPronunciation}
                disabled={isPlaying}
                className="h-6 w-6 p-0"
                title="استمع إلى النطق الإنجليزي"
              >
                {isPlaying ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Volume2 className="h-3 w-3" />
                )}
              </Button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="h-6 w-6 p-0"
              title="إغلاق"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground font-arabic" dir="rtl">جاري تحميل الترجمة...</span>
            </div>
          ) : error ? (
            <div className="text-center py-2">
              <p className="text-sm text-red-500 font-arabic" dir="rtl">الترجمة غير متوفرة</p>
            </div>
          ) : translationData ? (
            <div className="space-y-3">
              {/* Arabic Translation */}
              <div className="border-b pb-2">
                <p className="text-lg font-bold text-right font-arabic text-green-600" dir="rtl">
                  {translationData.arabic_translation}
                </p>
                {translationData.part_of_speech_arabic && (
                  <p className="text-xs text-muted-foreground text-right font-arabic mt-1" dir="rtl">
                    ({translationData.part_of_speech_arabic})
                  </p>
                )}
              </div>

              {/* Arabic Meaning/Definition */}
              {translationData.arabic_meaning && (
                <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded p-3">
                  <p className="text-sm font-medium font-arabic text-right" dir="rtl">
                    <span className="text-orange-600">المعنى:</span> {translationData.arabic_meaning}
                  </p>
                </div>
              )}

              {/* Full Arabic Definition */}
              {translationData.definition_arabic && (
                <div className="bg-gray-50 dark:bg-gray-950/30 rounded p-3">
                  <p className="text-sm font-arabic text-right leading-relaxed" dir="rtl">
                    <span className="font-medium text-blue-600">التعريف:</span> {translationData.definition_arabic}
                  </p>
                </div>
              )}

              {/* Pronunciation Guide in Arabic */}
              {translationData.pronunciation_guide_arabic && (
                <div className="bg-purple-50 dark:bg-purple-950/20 rounded p-2">
                  <p className="text-sm font-arabic text-right" dir="rtl">
                    <span className="font-medium text-purple-600">دليل النطق:</span> {translationData.pronunciation_guide_arabic}
                  </p>
                </div>
              )}

              {/* Example */}
              {translationData.example_english && (
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded p-3">
                  <p className="text-sm font-medium mb-2 text-left" dir="ltr">"{translationData.example_english}"</p>
                  <p className="text-sm font-arabic text-right" dir="rtl">
                    "{translationData.example_arabic}"
                  </p>
                </div>
              )}

              {/* Alternative Meanings in Arabic */}
              {translationData.alternative_meanings_arabic && translationData.alternative_meanings_arabic.length > 0 && (
                <div className="bg-green-50 dark:bg-green-950/20 rounded p-2">
                  <p className="text-xs font-arabic text-right" dir="rtl">
                    <span className="font-medium text-green-600">معاني أخرى:</span>{' '}
                    {translationData.alternative_meanings_arabic.join(' • ')}
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes fade-in-scale {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-fade-in-scale {
          animation: fade-in-scale 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default WordTranslationPopup;
