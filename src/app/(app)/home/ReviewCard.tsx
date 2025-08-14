// src/components/home/ReviewCard.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { summarizeLessonForReview, SummarizeLessonForReviewOutput } from '@/lib/lessons/term-1/flows/summarize-lesson-for-review';
import { getInspirationalMessage, GetInspirationalMessageOutput } from '@/lib/lessons/term-1/flows/get-inspirational-message';
import { termsData } from '@/lib/lessons-data';

const allLessons = termsData.flatMap(term => term.lessons);
const allLessonsMap = new Map(allLessons.map(lesson => [lesson.id, lesson]));

const RETRY_DELAY_MS = 2000; // 2 seconds

type DisplayContent = SummarizeLessonForReviewOutput | GetInspirationalMessageOutput | { reviewTitle: string; keyPoints: string[] };

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function ReviewCard() {
    const [content, setContent] = useState<DisplayContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [displayTime, setDisplayTime] = useState('');
    const [typedSummary, setTypedSummary] = useState('');
    const isTypingRef = useRef(false);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Initialize AudioContext on the client side
    useEffect(() => {
        if (typeof window !== 'undefined') {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            const resumeAudio = () => {
                if (audioContextRef.current?.state === 'suspended') {
                    audioContextRef.current.resume();
                }
                document.removeEventListener('click', resumeAudio);
            };
            
            document.addEventListener('click', resumeAudio);

            return () => {
                document.removeEventListener('click', resumeAudio);
            }
        }
    }, []);

    const playTypingSound = useCallback(() => {
        if (!audioContextRef.current || audioContextRef.current.state !== 'running') return;

        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, audioContextRef.current.currentTime);
        gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.02, audioContextRef.current.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContextRef.current.currentTime + 0.1);

        oscillator.start(audioContextRef.current.currentTime);
        oscillator.stop(audioContextRef.current.currentTime + 0.1);
    }, []);

    const getLessonContentAsString = (lessonId: string): { title: string, content: string } | null => {
        const lesson = allLessonsMap.get(lessonId);
        if (!lesson) return null;

        const contentParts = [
            lesson.articleTitle,
            lesson.articleContent,
            lesson.introduction,
            lesson.story_segment,
            lesson.grammarExplanation?.content,
            lesson.grammarExamples?.items.map(ex => `${ex.english} (${ex.arabic})`).join(', '),
            lesson.additionalNotes?.content,
            lesson.commonMistakes?.content,
            lesson.readingPassage,
            lesson.conclusion
        ];
        
        return {
            title: lesson.title,
            content: contentParts.filter(Boolean).join('\n\n')
        };
    };
    
    const typeContent = useCallback(async (fullText: string) => {
        isTypingRef.current = true;
        setTypedSummary('');
        for (let i = 0; i < fullText.length; i++) {
            if (!isTypingRef.current) break; // Stop typing if a new fetch starts
            setTypedSummary(prev => prev + fullText[i]);
            if (fullText[i] !== ' ' && fullText[i] !== '\n') {
                playTypingSound();
            }
            await new Promise(resolve => setTimeout(resolve, 20));
        }
        if (isTypingRef.current) {
            setTypedSummary(fullText);
            isTypingRef.current = false;
        }
    }, [playTypingSound]);

    const fetchReview = useCallback(async () => {
        isTypingRef.current = false; // Stop any ongoing typing
        await sleep(50); // give it a moment to stop
        setIsLoading(true);

        const viewedLessonIds: string[] = JSON.parse(localStorage.getItem('viewedLessons') || '[]');
        
        if (viewedLessonIds.length === 0) {
            try {
                const result = await getInspirationalMessage();
                setContent(result);
                 if (result) {
                    const fullText = `${result.title}\n\n${result.message}`;
                    await typeContent(fullText);
                }
            } catch (error) {
                console.error("Error fetching inspirational message:", error);
                 setContent({
                    title: "أهلاً بك!",
                    message: "تعلم اللغة الإنجليزية يفتح لك عالمًا من الإمكانيات مع الذكاء الاصطناعي الحديث."
                });
            } finally {
                setIsLoading(false);
            }
            return;
        }

        if (viewedLessonIds.length < 3) {
            const staticContent = {
                reviewTitle: "لنبدأ رحلتنا!",
                keyPoints: ["افتح بعض الدروس لبدء دورة المراجعة المخصصة لك."]
            };
            setContent(staticContent);
            const fullText = `${staticContent.reviewTitle}\n\n• ${staticContent.keyPoints[0]}`;
            await typeContent(fullText);
            setIsLoading(false);
            return;
        }
        
        let lessonToReviewId: string | null = null;
        let lessonContent: { title: string; content: string; } | null = null;
        let attempts = 0;
        const maxAttempts = viewedLessonIds.length;

        while (attempts < maxAttempts) {
            const randomIndex = Math.floor(Math.random() * viewedLessonIds.length);
            const potentialId = viewedLessonIds[randomIndex];
            const content = getLessonContentAsString(potentialId);
            
            if (content && content.content.trim()) { 
                lessonToReviewId = potentialId;
                lessonContent = content;
                break;
            } else {
                if (allLessonsMap.has(potentialId)) {
                    console.warn(`Could not find content for lesson ID: ${potentialId}. It may be from a previous curriculum version. Removing it.`);
                    const updatedViewedIds = viewedLessonIds.filter(id => id !== potentialId);
                    localStorage.setItem('viewedLessons', JSON.stringify(updatedViewedIds));
                }
            }
            attempts++;
        }

        if (!lessonToReviewId || !lessonContent) {
             console.error("No valid viewed lessons found to review after checking all stored IDs.");
             const staticContent = {
                reviewTitle: "تقدم رائع!",
                keyPoints: ["أنت تتقدم بشكل جيد. المعلم الذكي يجهز مراجعتك التالية."]
            };
            setContent(staticContent);
            const fullText = `${staticContent.reviewTitle}\n\n• ${staticContent.keyPoints[0]}`;
            await typeContent(fullText);
            setIsLoading(false);
            return;
        }

        try {
            const result = await summarizeLessonForReview({
                lessonTitle: lessonContent.title,
                lessonContent: lessonContent.content,
            });
            setContent(result);
            if(result) {
                const fullText = `${result.reviewTitle}\n\n${result.keyPoints.map(p => `• ${p}`).join('\n')}`;
                await typeContent(fullText);
            }
        } catch (error: any) {
             console.error("Error fetching review summary:", error);
             const errorContent = {
                reviewTitle: "استراحة سريعة!",
                keyPoints: ["تقدم رائع حتى الآن. المعلم الذكي يجهز مراجعتك التالية."]
            };
            setContent(errorContent);
            const fullText = `${errorContent.reviewTitle}\n\n• ${errorContent.keyPoints[0]}`;
            await typeContent(fullText);
        } finally {
            setIsLoading(false);
        }
    }, [typeContent]);

    useEffect(() => {
        fetchReview();
        
        const timeInterval = setInterval(() => {
            setDisplayTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
        }, 1000);

        return () => {
            clearInterval(timeInterval);
            isTypingRef.current = false;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    const renderContent = () => {
        if (isLoading && !content) {
            return <div className="text-primary opacity-50">جاري تحميل المراجعة...</div>;
        }
        if (!content) {
            return <div className="text-primary opacity-50">ابدأ رحلتك التعليمية!</div>;
        }
        
        const displayText = isTypingRef.current ? typedSummary + '<span class="typing-effect"></span>' : typedSummary;

        return <div id="summary-display" dir="rtl" dangerouslySetInnerHTML={{ __html: displayText.replace(/\n/g, '<br />') }} />;
    };

    return (
        <div className="clock-container font-code">
            <div className="display-frame">
                <div className="power-light"></div>
                <div className="display-screen">
                    <div id="poem-display" className="text-base sm:text-lg" dir="rtl">
                        {renderContent()}
                    </div>
                    <div className="time-indicator" id="time-indicator">{displayTime}</div>
                </div>
            </div>
        </div>
    );
}

// Re-creating the necessary styles from the user's provided HTML inside this component
const styles = `
.clock-container {
    width: 600px;
    max-width: 95vw;
    height: 320px;
    background: #1a1a1a;
    border-radius: 20px;
    padding: 20px;
    border: 1px solid #194E8A; /* Subtle blue border */
    box-shadow: 
        0 10px 30px rgba(0,0,0,0.2),
        inset 0 1px 0 rgba(255,255,255,0.1),
        inset 0 -1px 0 rgba(0,0,0,0.3);
    position: relative;
    overflow: hidden;
}

@media (max-width: 640px) {
  .clock-container {
    height: 280px;
    padding: 15px;
  }
}

.clock-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
}

.display-frame {
    width: 100%;
    height: 100%;
    background: #0a0a0a;
    border-radius: 10px;
    padding: 15px;
    box-shadow: 
        inset 0 2px 10px rgba(0,0,0,0.5),
        inset 0 -1px 0 rgba(255,255,255,0.05);
    position: relative;
}

@media (max-width: 640px) {
  .display-frame {
    padding: 10px;
  }
}

.display-screen {
    width: 100%;
    height: 100%;
    background: #000;
    border-radius: 5px;
    padding: 15px;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    position: relative;
    overflow-y: auto;
}

@media (max-width: 640px) {
  .display-screen {
    padding: 10px;
  }
}

.display-screen::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(rgba(255,255,255,0.02) 50%, transparent 50%);
    background-size: 100% 4px;
    pointer-events: none;
    opacity: 0.4;
}

#poem-display {
    color: #00ff88;
    line-height: 1.6;
    font-weight: 400;
    text-align: right;
    text-shadow: 0 0 10px rgba(0,255,136,0.3);
    white-space: pre-wrap;
    width: 100%;
    z-index: 1;
}

.time-indicator {
    position: absolute;
    bottom: 10px;
    right: 15px;
    color: #00ff88;
    font-size: 14px;
    opacity: 0.5;
    font-weight: 400;
}

@media (max-width: 640px) {
  .time-indicator {
    font-size: 12px;
    bottom: 5px;
    right: 10px;
  }
}


.power-light {
    position: absolute;
    top: 15px;
    right: 15px;
    width: 8px;
    height: 8px;
    background: #00ff88;
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(0,255,136,0.5);
    animation: review-pulse 2s infinite;
}

@media (max-width: 640px) {
    .power-light {
        top: 10px;
        right: 10px;
    }
}

.typing-effect {
    display: inline;
    border-left: 2px solid #00ff88;
    animation: review-blink-caret 0.75s step-end infinite;
}
`;

// Inject styles into the document head
if (typeof window !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}
