
"use client";

import React, { useState, useEffect } from 'react';

// Adjusted alphabet data with Emojis and Arabic words/context
const alphabetData = [
  { letter: "A", lowerLetter: "a", word: "Apple", arabicWord: "تفاحة", emoji: "🍎", color: "#FF6B6B" },
  { letter: "B", lowerLetter: "b", word: "Banana", arabicWord: "موزة", emoji: "🍌", color: "#FFA500" },
  { letter: "C", lowerLetter: "c", word: "Cat", arabicWord: "قطة", emoji: "🐱", color: "#FFD700" },
  { letter: "D", lowerLetter: "d", word: "Dog", arabicWord: "كلب", emoji: "🐶", color: "#90EE90" },
  { letter: "E", lowerLetter: "e", word: "Elephant", arabicWord: "فيل", emoji: "🐘", color: "#34C759" },
  { letter: "F", lowerLetter: "f", word: "Frog", arabicWord: "ضفدع", emoji: "🐸", color: "#00CED1" },
  { letter: "G", lowerLetter: "g", word: "Guitar", arabicWord: "جيتار", emoji: "🎸", color: "#1E90FF" },
  { letter: "H", lowerLetter: "h", word: "House", arabicWord: "منزل", emoji: "🏠", color: "#8A2BE2" },
  { letter: "I", lowerLetter: "i", word: "Ice Cream", arabicWord: "آيس كريم", emoji: "🍦", color: "#BA55D3" },
  { letter: "J", lowerLetter: "j", word: "Juice", arabicWord: "عصير", emoji: "🥤", color: "#FF69B4" },
  { letter: "K", lowerLetter: "k", word: "Kangaroo", arabicWord: "كنغر", emoji: "🦘", color: "#FFB6C1" },
  { letter: "L", lowerLetter: "l", word: "Lion", arabicWord: "أسد", emoji: "🦁", color: "#FFA07A" },
  { letter: "M", lowerLetter: "m", word: "Monkey", arabicWord: "قرد", emoji: "🐵", color: "#CD853F" },
  { letter: "N", lowerLetter: "n", word: "Nest", arabicWord: "عش", emoji: "🪺", color: "#8B4513" },
  { letter: "O", lowerLetter: "o", word: "Octopus", arabicWord: "أخطبوط", emoji: "🐙", color: "#2F4F4F" },
  { letter: "P", lowerLetter: "p", word: "Penguin", arabicWord: "بطريق", emoji: "🐧", color: "#008080" },
  { letter: "Q", lowerLetter: "q", word: "Queen", arabicWord: "ملكة", emoji: "👑", color: "#4682B4" },
  { letter: "R", lowerLetter: "r", word: "Robot", arabicWord: "روبوت", emoji: "🤖", color: "#6495ED" },
  { letter: "S", lowerLetter: "s", word: "Sun", arabicWord: "شمس", emoji: "☀️", color: "#008000" },
  { letter: "T", lowerLetter: "t", word: "Tiger", arabicWord: "نمر", emoji: "🐅", color: "#ADFF2F" },
  { letter: "U", lowerLetter: "u", word: "Umbrella", arabicWord: "مظلة", emoji: "☂️", color: "#FFFF00" },
  { letter: "V", lowerLetter: "v", word: "Van", arabicWord: "شاحنة صغيرة", emoji: "🚐", color: "#DC143C" },
  { letter: "W", lowerLetter: "w", word: "Whale", arabicWord: "حوت", emoji: "🐳", color: "#8B0000" },
  { letter: "X", lowerLetter: "x", word: "Xylophone", arabicWord: "إكسيليفون", emoji: "🎶", color: "#000080" }, // Emoji might need adjustment
  { letter: "Y", lowerLetter: "y", word: "Yacht", arabicWord: "يخت", emoji: "🛥️", color: "#0000CD" },
  { letter: "Z", lowerLetter: "z", word: "Zebra", arabicWord: "حمار وحشي", emoji: "🦓", color: "#0000FF" }
];


const AlphabetExplorer: React.FC = () => {
  const [selectedLetterData, setSelectedLetterData] = useState<typeof alphabetData[0] | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    // This effect runs only on the client after hydration
    setCurrentYear(new Date().getFullYear());
  }, []);


  const speakText = (text: string, lang: string = 'en-US', callback?: () => void) => {
    if (!('speechSynthesis' in window)) {
      alert("خاصية تحويل النص إلى كلام غير مدعومة في هذا المتصفح.");
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    setIsSpeaking(true);
    
    utterance.onend = () => {
      setIsSpeaking(false);
      if (callback) callback();
    };
    utterance.onerror = (event) => {
      console.error("SpeechSynthesisUtterance.onerror", event);
      setIsSpeaking(false);
      alert(`حدث خطأ أثناء محاولة نطق النص: ${event.error}`);
    };
    speechSynthesis.speak(utterance);
  };

  const handleLetterClick = (letterObj: typeof alphabetData[0]) => {
    if (isSpeaking) return;
    speakText(letterObj.letter, 'en-US', () => {
      setSelectedLetterData(letterObj);
    });
  };

  const handleWordSpeak = () => {
    if (selectedLetterData && !isSpeaking) {
      speakText(selectedLetterData.word, 'en-US');
    }
  };

  const closeModal = () => {
    speechSynthesis.cancel(); // Stop any speech when closing modal
    setSelectedLetterData(null);
    setIsSpeaking(false); // Ensure speaking state is reset
  };

  return (
    <div className="min-h-[70vh] bg-background text-foreground p-4 md:p-6 font-body flex flex-col">
      <header className="text-center mb-6 md:mb-10">
        <h1 className="text-3xl md:text-5xl font-headline text-primary-foreground">مستكشف الأبجدية</h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          انقر على حرف لاستكشافه!
        </p>
      </header>

      <main className="flex flex-col items-center w-full max-w-4xl mx-auto flex-grow">
        <div className="grid grid-cols-7 gap-2 sm:gap-3 md:grid-cols-9 lg:grid-cols-13 mb-8">
          {alphabetData.map((data) => (
            <button
              key={data.letter}
              style={{ backgroundColor: data.color }}
              onClick={() => handleLetterClick(data)}
              disabled={isSpeaking}
              className={`text-white font-bold py-2 px-2 sm:py-3 sm:px-4 rounded-full shadow-lg transform transition duration-300 hover:scale-110 active:scale-95 ${
                isSpeaking ? 'opacity-70 cursor-not-allowed' : ''
              } text-sm sm:text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent`}
              aria-label={`استكشف الحرف ${data.letter}`}
            >
              {data.letter}
            </button>
          ))}
        </div>

        {selectedLetterData && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4 backdrop-blur-sm"> {/* Increased z-index, added backdrop-blur */}
            <div className="bg-card text-card-foreground rounded-xl shadow-2xl w-full max-w-xs sm:max-w-md p-4 sm:p-6 transform transition-all duration-300 animate-fadeInExplorer">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl sm:text-4xl font-headline text-primary">
                  {selectedLetterData.letter}
                  <span className="ms-2 text-xl sm:text-2xl text-muted-foreground">
                    ({selectedLetterData.lowerLetter})
                  </span>
                </h2>
                <button
                  onClick={closeModal}
                  className="text-muted-foreground hover:text-foreground text-2xl"
                  aria-label="إغلاق النافذة"
                >
                  ✕
                </button>
              </div>

              <div className="text-center">
                <div className="text-6xl sm:text-7xl mb-4" aria-label={selectedLetterData.arabicWord}>
                  {selectedLetterData.emoji}
                </div>
                <p className="text-lg sm:text-xl font-semibold text-card-foreground mb-1">
                  {selectedLetterData.word}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  ({selectedLetterData.arabicWord})
                </p>
                <button
                  onClick={handleWordSpeak}
                  disabled={isSpeaking}
                  className={`flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-body py-2 px-4 rounded-lg transition w-full ${
                    isSpeaking ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  <span>🔊</span>
                  <span>{isSpeaking ? 'يتحدث...' : `استمع إلى "${selectedLetterData.word}"`}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="w-full mt-auto pt-8">
            <h3 className="text-2xl font-headline text-primary-foreground mb-4 text-center">كتاب الأبجدية التفاعلي</h3>
            <iframe 
                allowFullScreen={true} 
                scrolling="no" 
                className="fp-iframe" 
                src="https://heyzine.com/flip-book/0fe946d98d.html" 
                style={{ border: "1px solid hsl(var(--border))", width: "100%", height: "450px", borderRadius: "var(--radius)"}}
                title="كتاب الأبجدية التفاعلي"
            ></iframe>
        </div>
      </main>

      <footer className="mt-8 text-center text-sm text-muted-foreground font-body">
        <p>© {currentYear} مستكشف الأبجدية | تعلم بمتعة!</p>
      </footer>

      <style jsx>{`
        @keyframes fadeInExplorer {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeInExplorer {
          animation: fadeInExplorer 0.3s ease-out forwards;
        }
        .md\\:grid-cols-13 {
           grid-template-columns: repeat(13, minmax(0, 1fr));
        }
        .lg\\:grid-cols-13 {
           grid-template-columns: repeat(13, minmax(0, 1fr));
        }
         @media (min-width: 768px) { /* md breakpoint */
          .md\\:grid-cols-9 {
            grid-template-columns: repeat(9, minmax(0, 1fr));
          }
        }
        @media (min-width: 1024px) { /* lg breakpoint */
          .lg\\:grid-cols-13 {
             grid-template-columns: repeat(13, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
};

export default AlphabetExplorer;

