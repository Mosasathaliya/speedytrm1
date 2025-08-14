'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Mic, MicOff, Volume2, Bot, User, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PersonalAIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userName, setUserName] = useState('');
  const [userProgress, setUserProgress] = useState({});
  const scrollAreaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize user data and welcome message
  useEffect(() => {
    initializeUserData();
    showWelcomeMessage();
    initializeSpeechRecognition();
  }, []);

  const initializeUserData = () => {
    // Get user data from localStorage or API
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserName(user.full_name || user.name || 'صديقي');
      } catch {
        setUserName('صديقي');
      }
    } else {
      setUserName('صديقي');
    }

    // Get user progress data
    const progressData = localStorage.getItem('user_progress');
    if (progressData) {
      try {
        setUserProgress(JSON.parse(progressData));
      } catch {
        setUserProgress({});
      }
    }
  };

  const showWelcomeMessage = () => {
    setTimeout(() => {
      const welcomeMessage = {
        id: Date.now(),
        type: 'ai',
        content: `أهلاً وسهلاً ${userName}! 🌟\n\nأنا مساعدك الشخصي من منصة سرعة الإتقان. أعرف مسارك التعليمي وتفاصيل دراستك، وأنا هنا لمساعدتك في تحسين مهاراتك في اللغة الإنجليزية.\n\nيمكنني:\n• تحليل نقاط القوة والضعف في دراستك\n• اقتراح مواضيع محددة للتركيز عليها\n• الإجابة على أسئلتك باللغة العربية أو الإنجليزية\n• مساعدتك في وضع خطة دراسية شخصية\n\nكيف يمكنني مساعدتك اليوم؟`,
        timestamp: new Date(),
        language: 'ar'
      };
      setMessages([welcomeMessage]);
    }, 1000);
  };

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'ar-SA'; // Default to Arabic

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  };

  const detectLanguage = (text) => {
    // Simple language detection
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text) ? 'ar' : 'en';
  };

  const generateAIResponse = async (userMessage, language) => {
    // Simulate AI processing with realistic delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    const responses = {
      ar: {
        greeting: [
          `أهلاً ${userName}! كيف يمكنني مساعدتك في تطوير مهاراتك اليوم؟`,
          `مرحباً ${userName}! أنا هنا لدعمك في رحلة تعلم الإنجليزية.`,
          `أهلاً وسهلاً ${userName}! ما الذي تود التركيز عليه اليوم؟`
        ],
        progress: [
          `بناءً على تحليل أدائك، أنت تتقدم بشكل ممتاز في قواعد اللغة الإنجليزية! 📈\n\nنقاط القوة:\n• الأزمنة البسيطة: ممتاز\n• المفردات الأساسية: جيد جداً\n• النطق: تحسن ملحوظ\n\nمجالات للتطوير:\n• الأزمنة المعقدة\n• استخدام حروف الجر\n• المحادثة الطبيعية`,
          `تحليل أدائك يظهر أنك بحاجة للتركيز على:\n\n🎯 النطق والاستماع\n🎯 قواعد الأزمنة المستقبلية\n🎯 المفردات المتقدمة\n\nأقترح عليك:\n• ممارسة 15 دقيقة يومياً من الاستماع\n• حل التمارين في قسم الأزمنة\n• لعب الألعاب التفاعلية لتعلم المفردات`
        ],
        suggestions: [
          `بناءً على أدائك الأخير، أقترح عليك:\n\n1️⃣ التركيز على Present Perfect Tense\n2️⃣ ممارسة المحادثة مع الذكاء الاصطناعي\n3️⃣ حل اختبارات قصيرة يومياً\n4️⃣ مراجعة الكلمات الصعبة كل يوم\n\nهل تريد أن أضع لك خطة أسبوعية مفصلة؟`,
          `لاحظت أنك تواجه صعوبة في:\n\n❌ استخدام المبني للمجهول\n❌ التمييز بين الأزمنة\n❌ ترتيب الكلمات في الجملة\n\nالحل:\n✅ دراسة أمثلة واقعية\n✅ ممارسة التمارين التفاعلية\n✅ التكرار والمراجعة المستمرة`
        ],
        encouragement: [
          `أحسنت ${userName}! تقدمك رائع ومستمر. 🌟\n\nإنجازاتك حتى الآن:\n• أكملت 67% من الدروس الأساسية\n• حصلت على معدل 85% في الاختبارات\n• تحسن نطقك بنسبة 40%\n\nاستمر على هذا المنوال الرائع!`,
          `فخور بك ${userName}! 👏\n\nأرى تحسناً كبيراً في:\n• سرعة الفهم\n• دقة الإجابات\n• الثقة في التحدث\n\nأنت على الطريق الصحيح لإتقان اللغة الإنجليزية!`
        ]
      },
      en: {
        greeting: [
          `Hello ${userName}! How can I help you improve your English skills today?`,
          `Hi ${userName}! I'm here to support you on your English learning journey.`,
          `Welcome ${userName}! What would you like to focus on today?`
        ],
        progress: [
          `Based on your performance analysis, you're making excellent progress! 📈\n\nStrengths:\n• Simple tenses: Excellent\n• Basic vocabulary: Very good\n• Pronunciation: Notable improvement\n\nAreas to develop:\n• Complex tenses\n• Preposition usage\n• Natural conversation`,
          `Your performance analysis shows you need to focus on:\n\n🎯 Pronunciation and listening\n🎯 Future tense grammar\n🎯 Advanced vocabulary\n\nI suggest:\n• 15 minutes daily listening practice\n• Solve exercises in the tenses section\n• Play interactive vocabulary games`
        ],
        suggestions: [
          `Based on your recent performance, I suggest:\n\n1️⃣ Focus on Present Perfect Tense\n2️⃣ Practice conversation with AI\n3️⃣ Take daily mini quizzes\n4️⃣ Review difficult words daily\n\nWould you like me to create a detailed weekly plan?`,
          `I noticed you're struggling with:\n\n❌ Using passive voice\n❌ Distinguishing between tenses\n❌ Word order in sentences\n\nSolution:\n✅ Study real examples\n✅ Practice interactive exercises\n✅ Consistent repetition and review`
        ],
        encouragement: [
          `Well done ${userName}! Your progress is amazing and consistent. 🌟\n\nYour achievements so far:\n• Completed 67% of basic lessons\n• Average score of 85% on tests\n• 40% improvement in pronunciation\n\nKeep up the fantastic work!`,
          `I'm proud of you ${userName}! 👏\n\nI see great improvement in:\n• Speed of comprehension\n• Answer accuracy\n• Speaking confidence\n\nYou're on the right path to mastering English!`
        ]
      }
    };

    // Determine response type based on message content
    let responseType = 'greeting';
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('تقدم') || lowerMessage.includes('progress') || lowerMessage.includes('أداء')) {
      responseType = 'progress';
    } else if (lowerMessage.includes('اقتراح') || lowerMessage.includes('suggest') || lowerMessage.includes('help')) {
      responseType = 'suggestions';
    } else if (lowerMessage.includes('شكر') || lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      responseType = 'encouragement';
    }

    const responseArray = responses[language][responseType];
    return responseArray[Math.floor(Math.random() * responseArray.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      language: detectLanguage(inputMessage)
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Detect language and generate appropriate response
      const language = detectLanguage(inputMessage);
      const aiResponse = await generateAIResponse(inputMessage, language);

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        language: language
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'عذراً، حدث خطأ في المعالجة. حاول مرة أخرى.',
        timestamp: new Date(),
        language: 'ar'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakMessage = (text, language) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'ar' ? 'ar-SA' : 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <div className="h-full flex flex-col">
      {/* AI Assistant Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold" dir="rtl">مساعدك الشخصي الذكي</h3>
              <p className="text-sm text-muted-foreground">Your Personal AI from Speed of Mastery</p>
            </div>
            <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Chat Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4 ai-chat-scroll">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.type === 'ai' ? 'justify-start' : 'justify-end flex-row-reverse space-x-reverse'
              }`}
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className={`text-white ${
                  message.type === 'ai' 
                    ? 'bg-gradient-to-br from-blue-500 to-purple-500' 
                    : 'bg-gradient-to-br from-green-500 to-teal-500'
                }`}>
                  {message.type === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
              
              <div className={`max-w-[80%] ${
                message.type === 'ai' ? 'mr-auto' : 'ml-auto'
              }`}>
                <div className={`p-3 rounded-lg ${
                  message.type === 'ai'
                    ? 'bg-muted/50 border border-border/50'
                    : 'bg-primary text-primary-foreground'
                }`}>
                  <p 
                    className={`text-sm leading-relaxed whitespace-pre-line ai-message-enter ${
                      message.language === 'ar' ? 'ai-message-rtl' : 'ai-message-ltr'
                    }`}
                  >
                    {message.content}
                  </p>
                </div>
                
                {/* Message Controls */}
                <div className="flex items-center mt-1 space-x-2">
                  <span className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {message.type === 'ai' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => speakMessage(message.content, message.language)}
                      className="h-6 w-6 p-0"
                    >
                      <Volume2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start space-x-3 justify-start">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted/50 border border-border/50 p-3 rounded-lg">
                <div className="ai-typing-indicator">
                  <div className="ai-typing-dot"></div>
                  <div className="ai-typing-dot"></div>
                  <div className="ai-typing-dot"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="mt-4 flex items-center space-x-2">
        <div className="flex-1 flex items-center space-x-2">
          <Input
            placeholder="اكتب رسالتك هنا... / Type your message here..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
            dir="auto"
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleVoiceInput}
            className={`p-2 ${isListening ? 'bg-red-500 text-white ai-voice-pulse' : ''}`}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="p-2"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PersonalAIAssistant;
