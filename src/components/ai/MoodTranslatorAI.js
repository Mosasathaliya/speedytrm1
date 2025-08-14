'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Send, Mic, MicOff, Volume2, Bot, User, Clock, Target, CheckCircle } from 'lucide-react';

const MoodTranslatorAI = () => {
  const [selectedMood, setSelectedMood] = useState('happy');
  const [messages, setMessages] = useState({});
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timeSpent, setTimeSpent] = useState({});
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [completedMoods, setCompletedMoods] = useState(new Set());
  const scrollAreaRef = useRef(null);
  const recognitionRef = useRef(null);
  const timeIntervalRef = useRef(null);

  // Mood configurations
  const moods = {
    happy: {
      name: 'Happy',
      arabicName: 'سعيد',
      emoji: '😊',
      color: 'from-yellow-400 to-orange-400',
      personality: 'cheerful, optimistic, enthusiastic',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    angry: {
      name: 'Angry',
      arabicName: 'غاضب',
      emoji: '😠',
      color: 'from-red-500 to-red-600',
      personality: 'irritated, frustrated, impatient',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    sad: {
      name: 'Sad',
      arabicName: 'حزين',
      emoji: '😢',
      color: 'from-blue-400 to-blue-600',
      personality: 'melancholic, downcast, sorrowful',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    excited: {
      name: 'Excited',
      arabicName: 'متحمس',
      emoji: '🤩',
      color: 'from-purple-500 to-pink-500',
      personality: 'energetic, thrilled, enthusiastic',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    motivated: {
      name: 'Motivated',
      arabicName: 'محفز',
      emoji: '💪',
      color: 'from-green-500 to-teal-500',
      personality: 'determined, inspiring, goal-oriented',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  };

  const TARGET_TIME = 20 * 60; // 20 minutes in seconds

  // Initialize mood states
  useEffect(() => {
    const initialMessages = {};
    const initialTimeSpent = {};
    
    Object.keys(moods).forEach(mood => {
      initialMessages[mood] = [{
        id: Date.now() + Math.random(),
        type: 'ai',
        content: getMoodGreeting(mood),
        timestamp: new Date(),
        emoji: moods[mood].emoji
      }];
      initialTimeSpent[mood] = 0;
    });
    
    setMessages(initialMessages);
    setTimeSpent(initialTimeSpent);
    initializeSpeechRecognition();
  }, []);

  // Time tracking
  useEffect(() => {
    if (sessionStartTime) {
      timeIntervalRef.current = setInterval(() => {
        setTimeSpent(prev => {
          const newTimeSpent = {
            ...prev,
            [selectedMood]: prev[selectedMood] + 1
          };
          
          // Check if mood is completed
          if (newTimeSpent[selectedMood] >= TARGET_TIME && !completedMoods.has(selectedMood)) {
            setCompletedMoods(prev => new Set([...prev, selectedMood]));
            // Show completion message
            setTimeout(() => {
              const completionMessage = {
                id: Date.now() + Math.random(),
                type: 'ai',
                content: `Congratulations! You've completed 20 minutes with me in ${moods[selectedMood].name} mood! 🎉 You can continue chatting or try other moods.`,
                timestamp: new Date(),
                emoji: '🎉',
                isCompletion: true
              };
              
              setMessages(prevMessages => ({
                ...prevMessages,
                [selectedMood]: [...prevMessages[selectedMood], completionMessage]
              }));
            }, 1000);
          }
          
          return newTimeSpent;
        });
      }, 1000);
    } else {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    }

    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    };
  }, [sessionStartTime, selectedMood, completedMoods]);

  const getMoodGreeting = (mood) => {
    const greetings = {
      happy: "Hello there! 😊 I'm feeling absolutely wonderful today! I'm here to chat with you in a happy, cheerful mood. Let's have some fun conversations in English! What would you like to talk about?",
      angry: "Ugh! 😠 I'm feeling quite irritated right now! Everything seems to annoy me today. But fine, I'll talk to you... in English only! What do you want to discuss?!",
      sad: "Hi... 😢 I'm feeling quite down today. Everything seems a bit gloomy. But maybe talking with you in English will help cheer me up a little. What's on your mind?",
      excited: "OMG HI THERE! 🤩 I am SO excited to talk with you! This is going to be AMAZING! I can't contain my enthusiasm! Let's chat in English and have the most exciting conversation ever!",
      motivated: "Hello! 💪 I'm feeling incredibly motivated and ready to achieve great things! I'm here to inspire you and have powerful conversations in English. Let's make this chat count! What goals are you working on?"
    };
    return greetings[mood];
  };

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US'; // English only

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
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text) ? 'ar' : 'en';
  };

  const generateMoodResponse = async (userMessage, mood) => {
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    const responses = {
      happy: [
        "That's wonderful! 😊 I'm so delighted to hear that! Life is just amazing when we focus on the positive things, don't you think?",
        "Oh how fantastic! 🌟 Your message just made my day even brighter! I love how optimistic and cheerful our conversation is!",
        "That sounds absolutely lovely! 😄 I'm feeling so joyful talking with you! Everything seems so much better when we're happy!",
        "Wonderful! 🎉 I'm practically bouncing with joy! Your positive energy is just infectious and I love it so much!"
      ],
      angry: [
        "UGH! 😠 That's exactly what I'm talking about! This whole situation is just SO frustrating! Why does everything have to be so annoying?!",
        "Are you KIDDING me?! 😡 This is making me even MORE angry! I can't believe how irritating everything is today!",
        "SERIOUSLY?! 🤬 That just makes me SO mad! I'm getting more and more frustrated with every passing second!",
        "Oh for crying out loud! 😤 This is absolutely infuriating! I'm getting angrier just thinking about it!"
      ],
      sad: [
        "Oh... that makes me feel even more down... 😢 Everything just seems so melancholic and gloomy today...",
        "Sigh... 😞 That's quite disheartening... I'm feeling more sorrowful now... Life can be so difficult sometimes...",
        "That's so sad... 😭 My heart feels heavy hearing that... Everything seems so bleak and depressing...",
        "Oh dear... 😔 That just adds to my melancholy... I'm feeling quite blue about everything lately..."
      ],
      excited: [
        "OMG YES! 🤩 That is SO EXCITING! I can barely contain my enthusiasm! This is absolutely THRILLING!",
        "WOW WOW WOW! ⚡ I am SO pumped up about this! My excitement levels are through the ROOF right now!",
        "AMAZING! 🎊 I'm practically vibrating with excitement! This is the most INCREDIBLE thing ever!",
        "OH MY GOODNESS! 🚀 I am SO THRILLED! My energy is just EXPLOSIVE right now! This is FANTASTIC!"
      ],
      motivated: [
        "YES! 💪 That's the spirit! We need to stay focused and determined! Success comes to those who never give up!",
        "Absolutely! 🔥 That's what I call real motivation! We must push forward and achieve our goals no matter what!",
        "Perfect! 🎯 That's the mindset of a winner! Let's channel this energy into something productive and powerful!",
        "Exactly! ⚡ That's how champions think! We need to stay driven and committed to our objectives!"
      ]
    };

    return responses[mood][Math.floor(Math.random() * responses[mood].length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Start session timer if not started
    if (!sessionStartTime) {
      setSessionStartTime(Date.now());
    }

    // Check if message is in Arabic
    if (detectLanguage(inputMessage) === 'ar') {
      const warningMessage = {
        id: Date.now(),
        type: 'ai',
        content: "Please communicate in English only! I can only respond to English messages. أرجو التحدث بالإنجليزية فقط!",
        timestamp: new Date(),
        emoji: '🚫',
        isWarning: true
      };

      setMessages(prev => ({
        ...prev,
        [selectedMood]: [...prev[selectedMood], warningMessage]
      }));
      setInputMessage('');
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => ({
      ...prev,
      [selectedMood]: [...prev[selectedMood], userMessage]
    }));
    setInputMessage('');
    setIsLoading(true);

    try {
      const aiResponse = await generateMoodResponse(inputMessage, selectedMood);

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        emoji: moods[selectedMood].emoji
      };

      setMessages(prev => ({
        ...prev,
        [selectedMood]: [...prev[selectedMood], aiMessage]
      }));

      // Use Cloudflare TTS for AI response
      speakMessage(aiResponse);
    } catch (error) {
      console.error('Error generating mood response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    if (isListening) {
      // Stop recording
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      // Try Cloudflare STT first if available
      const mediaRecorder = await startRecording();
      if (mediaRecorder) {
        setIsListening(true);
        return;
      }
    } catch (error) {
      console.log('Cloudflare STT not available, using browser STT:', error);
    }

    // Fallback to browser speech recognition
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    recognitionRef.current.start();
    setIsListening(true);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        
        try {
          // Send to Cloudflare STT
          const formData = new FormData();
          formData.append('audio', audioBlob);

          const response = await fetch('/api/cloudflare/stt', {
            method: 'POST',
            body: formData,
          });

          const result = await response.json();
          
          if (result.transcript) {
            setInputMessage(result.transcript);
          } else if (result.fallback) {
            // Use browser STT as fallback
            console.log('Using browser STT fallback');
            if (recognitionRef.current) {
              recognitionRef.current.start();
            }
          }
        } catch (error) {
          console.error('Error with Cloudflare STT:', error);
          // Fallback to browser STT
          if (recognitionRef.current) {
            recognitionRef.current.start();
          }
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        setIsListening(false);
      };

      mediaRecorder.start();
      
      // Stop recording after 5 seconds maximum
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 5000);

      return mediaRecorder;
    } catch (error) {
      console.error('Error starting recording:', error);
      return null;
    }
  };

  const speakMessage = async (text) => {
    setIsSpeaking(true);
    
    try {
      // Try to use Cloudflare TTS via API call
      const response = await fetch('/api/cloudflare/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice: 'en-US-Standard-A',
          mood: selectedMood
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.play();
      } else {
        throw new Error('Cloudflare TTS failed');
      }
    } catch (error) {
      console.log('Using fallback TTS:', error);
      // Fallback to browser TTS
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = selectedMood === 'excited' ? 1.2 : selectedMood === 'sad' ? 0.8 : 1.0;
        utterance.pitch = selectedMood === 'happy' || selectedMood === 'excited' ? 1.2 : selectedMood === 'sad' ? 0.8 : 1.0;
        
        utterance.onend = () => {
          setIsSpeaking(false);
        };
        
        speechSynthesis.speak(utterance);
      } else {
        setIsSpeaking(false);
      }
    }
  };

  const switchMood = (newMood) => {
    setSelectedMood(newMood);
    // Reset session timer when switching moods
    setSessionStartTime(Date.now());
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeProgress = (mood) => {
    return Math.min((timeSpent[mood] || 0) / TARGET_TIME * 100, 100);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, selectedMood]);

  const currentMood = moods[selectedMood];
  const currentMessages = messages[selectedMood] || [];

  return (
    <div className="h-full flex flex-col">
      {/* Mood Translator Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full bg-gradient-to-br ${currentMood.color}`}>
                <span className="text-2xl">{currentMood.emoji}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold" dir="rtl">مترجم المزاج</h3>
                <p className="text-sm text-muted-foreground">Mood Translator AI - English Only</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-mono">
                {formatTime(timeSpent[selectedMood] || 0)} / 20:00
              </span>
              {completedMoods.has(selectedMood) && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Mood Selection */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-center">Select Mood / اختر المزاج</h4>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(moods).map(([moodKey, mood]) => (
                <Button
                  key={moodKey}
                  variant={selectedMood === moodKey ? "default" : "outline"}
                  onClick={() => switchMood(moodKey)}
                  className={`flex flex-col items-center p-3 h-auto ${
                    selectedMood === moodKey ? `bg-gradient-to-br ${mood.color} text-white` : ''
                  }`}
                >
                  <span className="text-lg mb-1">{mood.emoji}</span>
                  <span className="text-xs">{mood.name}</span>
                  <span className="text-xs opacity-75" dir="rtl">{mood.arabicName}</span>
                  <Progress 
                    value={getTimeProgress(moodKey)} 
                    className="w-full h-1 mt-1"
                  />
                  {completedMoods.has(moodKey) && (
                    <CheckCircle className="h-3 w-3 text-green-500 mt-1" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Mood Info */}
      <Card className={`mb-4 ${currentMood.bgColor} ${currentMood.borderColor}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-semibold">
                Currently in {currentMood.name} mood {currentMood.emoji}
              </h5>
              <p className="text-sm text-muted-foreground">
                AI personality: {currentMood.personality}
              </p>
            </div>
            <Badge variant="secondary">
              {formatTime(timeSpent[selectedMood] || 0)} / 20:00
            </Badge>
          </div>
          <Progress 
            value={getTimeProgress(selectedMood)} 
            className="w-full mt-2"
          />
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
        <div className="space-y-4">
          {currentMessages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.type === 'ai' ? 'justify-start' : 'justify-end flex-row-reverse space-x-reverse'
              }`}
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className={`text-white ${
                  message.type === 'ai' 
                    ? `bg-gradient-to-br ${currentMood.color}` 
                    : 'bg-gradient-to-br from-blue-500 to-teal-500'
                }`}>
                  {message.type === 'ai' ? (
                    <span className="text-sm">{message.emoji || currentMood.emoji}</span>
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </AvatarFallback>
              </Avatar>
              
              <div className={`max-w-[80%] ${
                message.type === 'ai' ? 'mr-auto' : 'ml-auto'
              }`}>
                <div className={`p-3 rounded-lg ${
                  message.type === 'ai'
                    ? message.isWarning 
                      ? 'bg-red-100 border border-red-200 text-red-800'
                      : message.isCompletion
                      ? 'bg-green-100 border border-green-200 text-green-800'
                      : 'bg-muted/50 border border-border/50'
                    : 'bg-primary text-primary-foreground'
                }`}>
                  <p className="text-sm leading-relaxed">
                    {message.content}
                  </p>
                </div>
                
                <div className="flex items-center mt-1 space-x-2">
                  <span className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {message.type === 'ai' && !message.isWarning && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => speakMessage(message.content)}
                      disabled={isSpeaking}
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
                <AvatarFallback className={`bg-gradient-to-br ${currentMood.color} text-white`}>
                  <span className="text-sm">{currentMood.emoji}</span>
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted/50 border border-border/50 p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
            placeholder="Type in English only... (English فقط)"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
            disabled={isLoading}
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleVoiceInput}
            className={`p-2 ${isListening ? 'bg-red-500 text-white animate-pulse' : ''}`}
            disabled={isLoading}
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

      {/* Completion Status */}
      <div className="mt-2 text-center">
        <p className="text-xs text-muted-foreground">
          Completed moods: {completedMoods.size}/5 • Total progress: {Math.round(completedMoods.size / 5 * 100)}%
        </p>
      </div>
    </div>
  );
};

export default MoodTranslatorAI;
