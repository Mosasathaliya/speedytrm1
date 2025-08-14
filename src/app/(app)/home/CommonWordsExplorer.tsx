
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react"; 
import { cn } from "@/lib/utils";

interface WordData {
  id: string;
  english: string;
  arabic: string;
  emoji: string;
}

const commonWordsList: WordData[] = [
  // People
  { id: "word1", english: "Man", arabic: "رجل", emoji: "👨" },
  { id: "word2", english: "Woman", arabic: "امرأة", emoji: "👩" },
  { id: "word3", english: "Boy", arabic: "ولد", emoji: "👦" },
  { id: "word4", english: "Girl", arabic: "فتاة", emoji: "👧" },
  { id: "word5", english: "Child", arabic: "طفل", emoji: "👶" },
  { id: "word6", english: "Father", arabic: "أب", emoji: "👨‍👧‍👦" },
  { id: "word7", english: "Mother", arabic: "أم", emoji: "👩‍👧‍👦" },
  { id: "word8", english: "Brother", arabic: "أخ", emoji: "👨‍👦" },
  { id: "word9", english: "Sister", arabic: "أخت", emoji: "👩‍👧" },
  { id: "word10", english: "Friend", arabic: "صديق", emoji: "🧑‍🤝‍🧑" },
  // Places
  { id: "word11", english: "House", arabic: "منزل", emoji: "🏠" },
  { id: "word12", english: "School", arabic: "مدرسة", emoji: "🏫" },
  { id: "word13", english: "Office", arabic: "مكتب", emoji: "🏢" },
  { id: "word14", english: "City", arabic: "مدينة", emoji: "🏙️" },
  { id: "word15", english: "Village", arabic: "قرية", emoji: "🏘️" },
  { id: "word16", english: "Country", arabic: "دولة", emoji: "🌍" },
  { id: "word17", english: "Park", arabic: "حديقة", emoji: "🏞️" },
  { id: "word18", english: "Hospital", arabic: "مستشفى", emoji: "🏥" },
  { id: "word19", english: "Market", arabic: "سوق", emoji: "🛒" },
  { id: "word20", english: "Restaurant", arabic: "مطعم", emoji: "🍽️" },
  // Things
  { id: "word21", english: "Book", arabic: "كتاب", emoji: "📖" },
  { id: "word22", english: "Pen", arabic: "قلم", emoji: "✒️" },
  { id: "word23", english: "Phone", arabic: "هاتف", emoji: "📱" },
  { id: "word24", english: "Table", arabic: "طاولة", emoji: "🪵" },
  { id: "word25", english: "Chair", arabic: "كرسي", emoji: "🪑" },
  { id: "word26", english: "Bag", arabic: "حقيبة", emoji: "👜" },
  { id: "word27", english: "Door", arabic: "باب", emoji: "🚪" },
  { id: "word28", english: "Window", arabic: "نافذة", emoji: "🖼️" },
  { id: "word29", english: "Clock", arabic: "ساعة", emoji: "⏰" },
  { id: "word30", english: "Key", arabic: "مفتاح", emoji: "🔑" },
  // Animals
  { id: "word31", english: "Dog", arabic: "كلب", emoji: "🐕" },
  { id: "word32", english: "Cat", arabic: "قطة", emoji: "🐈" },
  { id: "word33", english: "Bird", arabic: "طائر", emoji: "🐦" },
  { id: "word34", english: "Fish", arabic: "سمكة", emoji: "🐠" },
  { id: "word35", english: "Cow", arabic: "بقرة", emoji: "🐄" },
  { id: "word36", english: "Horse", arabic: "حصان", emoji: "🐎" },
  { id: "word37", english: "Goat", arabic: "ماعز", emoji: "🐐" },
  { id: "word38", english: "Sheep", arabic: "خروف", emoji: "🐑" },
  { id: "word39", english: "Lion", arabic: "أسد", emoji: "🦁" },
  { id: "word40", english: "Tiger", arabic: "نمر", emoji: "🐅" },
  // Nature
  { id: "word41", english: "Sun", arabic: "شمس", emoji: "☀️" },
  { id: "word42", english: "Moon", arabic: "قمر", emoji: "🌙" },
  { id: "word43", english: "Star", arabic: "نجمة", emoji: "⭐" },
  { id: "word44", english: "Tree", arabic: "شجرة", emoji: "🌳" },
  { id: "word45", english: "Flower", arabic: "زهرة", emoji: "🌸" },
  { id: "word46", english: "River", arabic: "نهر", emoji: "🌊" },
  { id: "word47", english: "Mountain", arabic: "جبل", emoji: "⛰️" },
  { id: "word48", english: "Sky", arabic: "سماء", emoji: "☁️" },
  { id: "word49", english: "Rain", arabic: "مطر", emoji: "🌧️" },
  { id: "word50", english: "Wind", arabic: "رياح", emoji: "🌬️" },
  // Body Parts
  { id: "word51", english: "Head", arabic: "رأس", emoji: "👨" },
  { id: "word52", english: "Eye", arabic: "عين", emoji: "👀" },
  { id: "word53", english: "Ear", arabic: "أذن", emoji: "👂" },
  { id: "word54", english: "Nose", arabic: "أنف", emoji: "👃" },
  { id: "word55", english: "Mouth", arabic: "فم", emoji: "👄" },
  { id: "word56", english: "Hand", arabic: "يد", emoji: "👋" },
  { id: "word57", english: "Leg", arabic: "ساق", emoji: "🦵" },
  { id: "word58", english: "Foot", arabic: "قدم", emoji: "🦶" },
  { id: "word59", english: "Arm", arabic: "ذراع", emoji: "💪" },
  { id: "word60", english: "Finger", arabic: "إصبع", emoji: "👉" },
  // Clothing
  { id: "word61", english: "Shirt", arabic: "قميص", emoji: "👕" },
  { id: "word62", english: "Pants", arabic: "بنطلون", emoji: "👖" },
  { id: "word63", english: "Dress", arabic: "فستان", emoji: "👗" },
  { id: "word64", english: "Skirt", arabic: "تنورة", emoji: "👚" },
  { id: "word65", english: "Jacket", arabic: "سترة", emoji: "🧥" },
  { id: "word66", english: "Shoes", arabic: "حذاء", emoji: "👟" },
  { id: "word67", english: "Hat", arabic: "قبعة", emoji: "🧢" },
  { id: "word68", english: "Socks", arabic: "جوارب", emoji: "🧦" },
  { id: "word69", english: "Tie", arabic: "ربطة عنق", emoji: "👔" },
  { id: "word70", english: "Coat", arabic: "معطف", emoji: "🧥" },
  // Food & Drink
  { id: "word71", english: "Water", arabic: "ماء", emoji: "💧" },
  { id: "word72", english: "Bread", arabic: "خبز", emoji: "🍞" },
  { id: "word73", english: "Rice", arabic: "أرز", emoji: "🍚" },
  { id: "word74", english: "Meat", arabic: "لحم", emoji: "🍖" },
  { id: "word75", english: "Fruit", arabic: "فاكهة", emoji: "🍓" },
  { id: "word76", english: "Apple", arabic: "تفاحة", emoji: "🍎" },
  { id: "word77", english: "Banana", arabic: "موز", emoji: "🍌" },
  { id: "word78", english: "Milk", arabic: "حليب", emoji: "🥛" },
  { id: "word79", english: "Juice", arabic: "عصير", emoji: "🧃" },
  { id: "word80", english: "Egg", arabic: "بيضة", emoji: "🥚" },
  // Time & Weather
  { id: "word81", english: "Day", arabic: "يوم", emoji: "☀️" },
  { id: "word82", english: "Night", arabic: "ليل", emoji: "🌙" },
  { id: "word83", english: "Morning", arabic: "صباح", emoji: "🌅" },
  { id: "word84", english: "Evening", arabic: "مساء", emoji: "🌆" },
  { id: "word85", english: "Week", arabic: "أسبوع", emoji: "📅" },
  { id: "word86", english: "Month", arabic: "شهر", emoji: "🗓️" },
  { id: "word87", english: "Year", arabic: "سنة", emoji: "⏳" },
  { id: "word88", english: "Time", arabic: "وقت", emoji: "⏰" },
  { id: "word89", english: "Hour", arabic: "ساعة", emoji: "⏳" },
  { id: "word90", english: "Minute", arabic: "دقيقة", emoji: "⏱️" },
  // Other Common Nouns
  { id: "word91", english: "Money", arabic: "مال", emoji: "💰" },
  { id: "word92", english: "Name", arabic: "اسم", emoji: "📛" },
  { id: "word93", english: "Game", arabic: "لعبة", emoji: "🎮" },
  { id: "word94", english: "Work", arabic: "عمل", emoji: "💼" },
  { id: "word95", english: "Job", arabic: "وظيفة", emoji: "🧑‍💼" },
  { id: "word96", english: "Language", arabic: "لغة", emoji: "🗣️" },
  { id: "word97", english: "Family", arabic: "عائلة", emoji: "👨‍👩‍👧‍👦" },
  { id: "word98", english: "Picture", arabic: "صورة", emoji: "🖼️" },
  { id: "word99", english: "Story", arabic: "قصة", emoji: "📜" },
  { id: "word100", english: "Song", arabic: "أغنية", emoji: "🎶" },
];

const CommonWordsExplorer: React.FC = () => {
  const [wordForPopup, setWordForPopup] = useState<WordData | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [blinkingLetters, setBlinkingLetters] = useState<{ char: string; isBlinking: boolean }[] | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const isPopupOpenRef = useRef(isPopupOpen);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    // ComponentWillUnmount cleanup
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    isPopupOpenRef.current = isPopupOpen;
  }, [isPopupOpen]);

  const speakTextPromise = useCallback((text: string, lang: string = 'en-US'): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        console.warn("Speech synthesis not supported in this browser.");
        reject(new Error("Speech synthesis not supported."));
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.onend = () => resolve();
      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        // Just reject with the error type. The calling function will handle logging.
        reject(event.error); 
      };
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleWordButtonClick = (wordData: WordData) => {
    if (isSpeaking) return; 
    setWordForPopup(wordData);
    setIsPopupOpen(true); 
  };

  const closePopup = useCallback(() => {
    setIsPopupOpen(false); 
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    setIsSpeaking(false); 
    setWordForPopup(null);
    setBlinkingLetters(null);
  }, []);


  useEffect(() => {
    if (isPopupOpen && wordForPopup) {
      const performSpeechSequence = async () => {
        setIsSpeaking(true);
        setBlinkingLetters(wordForPopup.english.split('').map(char => ({ char, isBlinking: false })));

        try {
          const lettersArray = wordForPopup.english.split('');
          for (let i = 0; i < lettersArray.length; i++) {
            if (!isPopupOpenRef.current) throw new Error("Popup closed during letter speech");
            
            const letter = lettersArray[i];
            setBlinkingLetters(prev => prev!.map((lObj, index) => ({ ...lObj, isBlinking: index === i })));
            await speakTextPromise(letter, 'en-US');
            await delay(150); 
            
            if (!isPopupOpenRef.current) throw new Error("Popup closed during letter unblink");
            setBlinkingLetters(prev => prev!.map((lObj) => ({ ...lObj, isBlinking: false })));
            
            if (i < lettersArray.length - 1) {
              await delay(100); 
            }
          }

          if (!isPopupOpenRef.current) throw new Error("Popup closed before word speech");
          await delay(300); 
          await speakTextPromise(wordForPopup.english, 'en-US');

        } catch (caughtError) {
          let errorIdentifier: string | undefined;

          if (caughtError instanceof Error) {
            errorIdentifier = caughtError.message;
          } else if (typeof caughtError === 'string') {
            errorIdentifier = caughtError;
          }

          const expectedInterruptions = [
            "Popup closed during letter speech",
            "Popup closed during letter unblink",
            "Popup closed before word speech",
            "interrupted", // Speech was cancelled, e.g., by closing the popup.
            "canceled"     // Some browsers might use this term.
          ];

          // If the error is not one of our expected, benign interruptions, log it.
          if (!errorIdentifier || !expectedInterruptions.includes(errorIdentifier)) {
            console.error("Unexpected error during speech sequence:", caughtError);
          }
        } finally {
          if (isPopupOpenRef.current) { 
             setBlinkingLetters(prev => prev ? prev.map(l => ({ ...l, isBlinking: false })) : null);
          }
          setIsSpeaking(false);
        }
      };
      
      performSpeechSequence();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPopupOpen, wordForPopup]); 

  return (
    <div className="min-h-[70vh] bg-background text-foreground p-4 md:p-6 font-body flex flex-col items-center">
      <header className="text-center mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-headline text-primary-foreground">
          الكلمات الإنجليزية شائعة الاستخدام
        </h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          انقر على كلمة لتعلم نطقها في نافذة منبثقة.
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 w-full max-w-4xl mb-8">
        {commonWordsList.map((word) => (
          <Button
            key={word.id}
            variant="outline"
            onClick={() => handleWordButtonClick(word)}
            disabled={isSpeaking && (wordForPopup ? wordForPopup.id !== word.id : true)}
            className="h-auto p-3 text-base flex flex-col items-center justify-center gap-1 bg-card hover:bg-muted focus:ring-accent"
          >
            <span className="text-2xl">{word.emoji}</span>
            <span className="font-semibold text-primary-foreground">{word.english}</span>
            <span className="text-xs text-muted-foreground">{word.arabic}</span>
          </Button>
        ))}
      </div>

      {wordForPopup && (
        <Dialog open={isPopupOpen} onOpenChange={(open) => {
          if (!open) {
            closePopup(); 
          }
        }}>
          <DialogContent className="sm:max-w-md bg-card border-border text-card-foreground">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-center text-primary font-headline text-2xl">{wordForPopup.english}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="text-6xl" aria-label={wordForPopup.arabic}>{wordForPopup.emoji}</div>
              
              {blinkingLetters && (
                <div className="mb-2 flex justify-center items-center space-x-1 rtl:space-x-reverse" style={{direction: 'ltr'}}>
                  {blinkingLetters.map((letterObj, index) => (
                    <span
                      key={`${wordForPopup.id}-letter-${index}`}
                      className={cn(
                        "text-3xl sm:text-4xl font-bold text-accent-foreground transition-all duration-150",
                        letterObj.isBlinking ? "opacity-100 scale-125 text-accent" : "opacity-70 scale-100"
                      )}
                    >
                      {letterObj.char}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-lg text-muted-foreground">{wordForPopup.arabic}</p>
            </div>
          </DialogContent>
        </Dialog>
      )}

       <footer className="mt-auto pt-8 text-center text-sm text-muted-foreground font-body">
        <p>© {currentYear} مستكشف الكلمات الشائعة | تعلم بمتعة!</p>
      </footer>
    </div>
  );
};

export default CommonWordsExplorer;
    
