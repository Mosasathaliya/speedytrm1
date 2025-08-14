'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  X, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send,
  Bot,
  User,
  BookOpen,
  HelpCircle,
  CheckCircle,
  XCircle,
  Lightbulb,
  Languages
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'tutor';
  content: string;
  timestamp: Date;
  isQuestion?: boolean;
  isCorrection?: boolean;
  lessonContext?: string;
}

interface FloatingAITutorProps {
  lessonId: string;
  lessonTitle: string;
  lessonContent: string;
  isVisible?: boolean;
  onClose?: () => void;
}

const FloatingAITutor: React.FC<FloatingAITutorProps> = ({
  lessonId,
  lessonTitle,
  lessonContent,
  isVisible = false,
  onClose
}) => {
  const [isOpen, setIsOpen] = useState(isVisible);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tutorMode, setTutorMode] = useState<'explanation' | 'questioning' | 'correction'>('explanation');
  const [questionCount, setQuestionCount] = useState(0);
  const [userErrors, setUserErrors] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initialize with welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: 'tutor',
        content: `مرحباً! أنا مدرسك الذكي لدرس "${lessonTitle}". سأساعدك في فهم جميع جوانب هذا الدرس باللغة العربية. يمكنك التحدث معي صوتياً أو كتابياً. كيف يمكنني مساعدتك اليوم؟`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      speakMessage(welcomeMessage.content);
    }
  }, [isOpen, lessonTitle]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'ar-SA';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      synthRef.current.cancel();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const speakMessage = (text: string) => {
    if (!synthRef.current) return;

    synthRef.current.cancel();
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    synthRef.current.speak(utterance);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const stopSpeaking = () => {
    synthRef.current.cancel();
    setIsSpeaking(false);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          lessonTitle,
          lessonContent,
          userMessage: inputMessage,
          tutorMode,
          questionCount,
          messageHistory: messages.slice(-10), // Last 10 messages for context
          userErrors
        })
      });

      if (!response.ok) throw new Error('Failed to get tutor response');

      const data = await response.json();
      
      const tutorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'tutor',
        content: data.response,
        timestamp: new Date(),
        isQuestion: data.isQuestion,
        isCorrection: data.isCorrection,
        lessonContext: data.lessonContext
      };

      setMessages(prev => [...prev, tutorMessage]);
      
      // Update tutor mode based on response
      if (data.newMode) {
        setTutorMode(data.newMode);
      }
      
      if (data.isQuestion) {
        setQuestionCount(prev => prev + 1);
      }

      if (data.userError) {
        setUserErrors(prev => [...prev, data.userError]);
      }

      // Speak the response
      speakMessage(data.response);

    } catch (error) {
      console.error('Tutor chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'tutor',
        content: 'عذراً، حدث خطأ في النظام. يرجى المحاولة مرة أخرى.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const openTutor = () => {
    setIsOpen(true);
  };

  const closeTutor = () => {
    setIsOpen(false);
    synthRef.current.cancel();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (onClose) onClose();
  };

  const getTutorModeIcon = () => {
    switch (tutorMode) {
      case 'explanation': return <BookOpen className="h-4 w-4" />;
      case 'questioning': return <HelpCircle className="h-4 w-4" />;
      case 'correction': return <Lightbulb className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const getTutorModeText = () => {
    switch (tutorMode) {
      case 'explanation': return 'وضع الشرح';
      case 'questioning': return 'وضع الأسئلة';
      case 'correction': return 'وضع التصحيح';
      default: return 'المدرس الذكي';
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={openTutor}
        className="fixed bottom-20 right-4 z-50 rounded-full h-14 w-14 shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 animate-pulse"
        title="افتح المدرس الذكي"
      >
        <Bot className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[600px] max-h-[80vh]">
      <Card className="h-full flex flex-col shadow-2xl border-2 border-primary/20">
        <CardHeader className="flex-shrink-0 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bot className="h-6 w-6 text-primary" />
                {isSpeaking && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg font-arabic" dir="rtl">المدرس الذكي</CardTitle>
                <div className="flex items-center gap-1 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {getTutorModeIcon()}
                    <span className="mr-1 font-arabic">{getTutorModeText()}</span>
                  </Badge>
                  <Badge variant="outline" className="text-xs font-arabic">
                    {lessonTitle}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isSpeaking && (
                <Button size="sm" variant="ghost" onClick={stopSpeaking}>
                  <VolumeX className="h-4 w-4" />
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={closeTutor}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-4 gap-4 min-h-0">
          {/* Chat Messages */}
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : message.isQuestion
                        ? 'bg-orange-100 dark:bg-orange-950 border border-orange-200'
                        : message.isCorrection
                        ? 'bg-red-100 dark:bg-red-950 border border-red-200'
                        : 'bg-muted'
                    }`}
                    dir={message.type === 'tutor' ? 'rtl' : 'ltr'}
                  >
                    <div className="flex items-start gap-2">
                      {message.type === 'tutor' && (
                        <div className="flex-shrink-0 mt-0.5">
                          {message.isQuestion ? (
                            <HelpCircle className="h-4 w-4 text-orange-600" />
                          ) : message.isCorrection ? (
                            <XCircle className="h-4 w-4 text-red-600" />
                          ) : (
                            <Bot className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className={`text-sm ${message.type === 'tutor' ? 'font-arabic text-right' : ''}`}>
                          {message.content}
                        </p>
                        <span className="text-xs opacity-70 mt-1 block">
                          {message.timestamp.toLocaleTimeString('ar-SA', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      {message.type === 'tutor' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                          onClick={() => speakMessage(message.content)}
                          disabled={isSpeaking}
                        >
                          <Volume2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-blue-600" />
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" />
                        <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="flex-shrink-0 space-y-2">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="اكتب رسالتك أو استخدم الميكروفون..."
                  className="pr-10 font-arabic"
                  dir="rtl"
                  disabled={isLoading}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute left-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={isListening ? stopListening : startListening}
                  disabled={isLoading}
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4 text-red-500 animate-pulse" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Status indicators */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                {isListening && (
                  <Badge variant="secondary" className="animate-pulse">
                    <Mic className="h-3 w-3 mr-1" />
                    <span className="font-arabic">يستمع...</span>
                  </Badge>
                )}
                {isSpeaking && (
                  <Badge variant="secondary" className="animate-pulse">
                    <Volume2 className="h-3 w-3 mr-1" />
                    <span className="font-arabic">يتحدث...</span>
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 font-arabic" dir="rtl">
                <Languages className="h-3 w-3" />
                <span>الأسئلة: {questionCount}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FloatingAITutor;
