'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, Languages, CheckCircle, Loader2, Target, Clock, Play, Pause } from 'lucide-react';

const VoiceTranslatorAI = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [translationHistory, setTranslationHistory] = useState([]);
  const [completedTranslations, setCompletedTranslations] = useState(0);
  const [currentTranslation, setCurrentTranslation] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [totalTime, setTotalTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timeIntervalRef = useRef(null);
  const scrollAreaRef = useRef(null);

  const TARGET_TRANSLATIONS = 30;

  // Initialize session time tracking
  useEffect(() => {
    setSessionStartTime(Date.now());
    
    // Load saved progress
    try {
      const savedProgress = localStorage.getItem('voiceTranslatorProgress');
      if (savedProgress) {
        const { completedTranslations: saved, history } = JSON.parse(savedProgress);
        setCompletedTranslations(saved || 0);
        setTranslationHistory(history || []);
      }
    } catch (error) {
      console.error('Error loading saved progress:', error);
    }

    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    };
  }, []);

  // Time tracking
  useEffect(() => {
    if (sessionStartTime) {
      timeIntervalRef.current = setInterval(() => {
        setTotalTime(Math.floor((Date.now() - sessionStartTime) / 1000));
      }, 1000);
    }

    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    };
  }, [sessionStartTime]);

  // Save progress to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('voiceTranslatorProgress', JSON.stringify({
        completedTranslations,
        history: translationHistory
      }));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [completedTranslations, translationHistory]);

  // Auto-scroll to bottom when new translations arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [translationHistory]);

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
        await processArabicToEnglish(audioBlob);
        
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopVoiceRecording();
        }
      }, 10000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('لا يمكن الوصول إلى الميكروفون. يرجى التأكد من الأذونات.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const processArabicToEnglish = async (audioBlob) => {
    setIsProcessing(true);

    try {
      // First: Transcribe Arabic audio using Cloudflare STT
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('language', 'ar');

      const sttResponse = await fetch('/api/cloudflare/stt-arabic', {
        method: 'POST',
        body: formData,
      });

      const sttResult = await sttResponse.json();
      
      if (!sttResult.transcript) {
        throw new Error('فشل في تحويل الصوت إلى نص');
      }

      const arabicText = sttResult.transcript;

      // Second: Translate Arabic text to English
      const translateResponse = await fetch('/api/cloudflare/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: arabicText,
          sourceLanguage: 'ar',
          targetLanguage: 'en'
        }),
      });

      const translateResult = await translateResponse.json();
      
      if (!translateResult.translatedText) {
        throw new Error('فشل في الترجمة');
      }

      const englishText = translateResult.translatedText;

      // Third: Generate English audio using Cloudflare TTS
      const ttsResponse = await fetch('/api/cloudflare/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: englishText,
          voice: 'en-US-Standard-A',
          language: 'en'
        }),
      });

      let englishAudioUrl = null;
      if (ttsResponse.ok) {
        const audioBlob = await ttsResponse.blob();
        englishAudioUrl = URL.createObjectURL(audioBlob);
      }

      // Create translation record
      const newTranslation = {
        id: Date.now() + Math.random(),
        arabicText,
        englishText,
        englishAudioUrl,
        timestamp: new Date(),
        completed: true
      };

      setCurrentTranslation(newTranslation);
      setTranslationHistory(prev => [newTranslation, ...prev]);
      setCompletedTranslations(prev => prev + 1);

      // Auto-play English translation
      if (englishAudioUrl) {
        setTimeout(() => {
          playEnglishTranslation(englishAudioUrl);
        }, 500);
      } else {
        // Fallback to browser TTS
        speakEnglishText(englishText);
      }

      // Check if goal completed
      if (completedTranslations + 1 >= TARGET_TRANSLATIONS) {
        setTimeout(() => {
          showCompletionCelebration();
        }, 2000);
      }

    } catch (error) {
      console.error('Error processing translation:', error);
      
      // Add error message to history
      const errorRecord = {
        id: Date.now() + Math.random(),
        arabicText: 'خطأ في التسجيل',
        englishText: 'Recording error - please try again',
        timestamp: new Date(),
        completed: false,
        isError: true
      };

      setTranslationHistory(prev => [errorRecord, ...prev]);
    } finally {
      setIsProcessing(false);
    }
  };

  const playEnglishTranslation = (audioUrl) => {
    if (isSpeaking) return;

    setIsSpeaking(true);
    const audio = new Audio(audioUrl);
    
    audio.onended = () => {
      setIsSpeaking(false);
    };
    
    audio.onerror = () => {
      setIsSpeaking(false);
      console.error('Error playing audio');
    };
    
    audio.play();
  };

  const speakEnglishText = (text) => {
    if (isSpeaking || !text) return;

    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
    };
    
    speechSynthesis.speak(utterance);
  };

  const showCompletionCelebration = () => {
    const celebrationMessage = {
      id: Date.now() + Math.random(),
      arabicText: 'تهانينا! لقد أكملت 30 ترجمة صوتية! 🎉',
      englishText: 'Congratulations! You have completed 30 voice translations! 🎉',
      timestamp: new Date(),
      completed: true,
      isCelebration: true
    };

    setTranslationHistory(prev => [celebrationMessage, ...prev]);
    setCurrentTranslation(celebrationMessage);
    
    // Speak celebration in English
    setTimeout(() => {
      speakEnglishText('Congratulations! You have successfully completed thirty voice translations! Well done!');
    }, 1000);
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = Math.min((completedTranslations / TARGET_TRANSLATIONS) * 100, 100);
  const isCompleted = completedTranslations >= TARGET_TRANSLATIONS;

  return (
    <div className="h-full flex flex-col">
      {/* Voice Translator Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-gradient-to-br from-green-500 to-blue-500">
                <Languages className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold" dir="rtl">مترجم الصوت</h3>
                <p className="text-sm text-muted-foreground">Voice Translator - Arabic to English</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-mono">
                {formatTime(totalTime)}
              </span>
              {isCompleted && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Progress Section */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold" dir="rtl">التقدم / Progress</h4>
              <Badge variant={isCompleted ? "default" : "secondary"}>
                {completedTranslations} / {TARGET_TRANSLATIONS}
              </Badge>
            </div>
            <Progress 
              value={progressPercentage} 
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span dir="rtl">الهدف: 30 ترجمة صوتية</span>
              <span>{Math.round(progressPercentage)}% مكتمل</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recording Section */}
      <Card className="mb-4">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <h4 className="text-lg font-semibold" dir="rtl">
                {isRecording 
                  ? 'جاري التسجيل... تحدث بالعربية' 
                  : isProcessing 
                  ? 'جاري المعالجة والترجمة...' 
                  : 'اضغط للتسجيل بالعربية'
                }
              </h4>
              <p className="text-sm text-muted-foreground">
                {isRecording 
                  ? 'Recording... Speak in Arabic' 
                  : isProcessing 
                  ? 'Processing and translating...' 
                  : 'Press to record in Arabic'
                }
              </p>
            </div>

            <Button
              onClick={handleVoiceInput}
              disabled={isProcessing}
              size="lg"
              className={`w-32 h-32 rounded-full ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-gradient-to-br from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600'
              }`}
            >
              {isProcessing ? (
                <Loader2 className="h-12 w-12 animate-spin" />
              ) : isRecording ? (
                <MicOff className="h-12 w-12" />
              ) : (
                <Mic className="h-12 w-12" />
              )}
            </Button>

            {isRecording && (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-red-500 font-medium">
                  Recording in progress (max 10 seconds)
                </span>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Translation Display */}
      {currentTranslation && !currentTranslation.isError && (
        <Card className={`mb-4 ${currentTranslation.isCelebration ? 'bg-green-50 border-green-200' : ''}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-center">
              {currentTranslation.isCelebration ? (
                <span className="text-green-600">🎉 تهانينا! 🎉</span>
              ) : (
                <span dir="rtl">آخر ترجمة</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h5 className="font-semibold text-sm mb-1" dir="rtl">النص العربي:</h5>
              <p className="text-sm bg-muted/50 p-2 rounded" dir="rtl">
                {currentTranslation.arabicText}
              </p>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <h5 className="font-semibold text-sm">English Translation:</h5>
                {currentTranslation.englishAudioUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => playEnglishTranslation(currentTranslation.englishAudioUrl)}
                    disabled={isSpeaking}
                  >
                    {isSpeaking ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    <span className="ml-1">Play</span>
                  </Button>
                )}
              </div>
              <p className="text-sm bg-blue-50 p-2 rounded">
                {currentTranslation.englishText}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Translation History */}
      <ScrollArea ref={scrollAreaRef} className="flex-1">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-center" dir="rtl">
            سجل الترجمات / Translation History
          </h4>
          
          {translationHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Languages className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p dir="rtl">لا توجد ترجمات بعد</p>
              <p className="text-sm">No translations yet</p>
            </div>
          ) : (
            translationHistory.map((translation) => (
              <div
                key={translation.id}
                className={`p-3 rounded-lg border ${
                  translation.isError 
                    ? 'bg-red-50 border-red-200' 
                    : translation.isCelebration 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-muted/30 border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    {translation.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  {translation.completed && !translation.isError && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm" dir="rtl">
                    <span className="font-medium">عربي:</span> {translation.arabicText}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">English:</span> {translation.englishText}
                  </p>
                </div>
                
                {translation.englishAudioUrl && !translation.isError && (
                  <div className="mt-2 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => playEnglishTranslation(translation.englishAudioUrl)}
                      disabled={isSpeaking}
                    >
                      <Volume2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Completion Status */}
      {isCompleted && (
        <div className="mt-4 text-center">
          <Badge variant="default" className="bg-green-500">
            🎉 مهمة مكتملة / Task Completed! 🎉
          </Badge>
        </div>
      )}
    </div>
  );
};

export default VoiceTranslatorAI;
