
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Volume2, SpellCheck, Loader2 } from 'lucide-react';

const colorsData = [
  { name: "Red", arabicName: "أحمر", hex: "#FF0000" },
  { name: "Blue", arabicName: "أزرق", hex: "#0000FF" },
  { name: "Green", arabicName: "أخضر", hex: "#008000" },
  { name: "Yellow", arabicName: "أصفر", hex: "#FFFF00", textDark: true },
  { name: "Black", arabicName: "أسود", hex: "#000000" },
  { name: "White", arabicName: "أبيض", hex: "#FFFFFF", textDark: true },
  { name: "Purple", arabicName: "بنفسجي", hex: "#800080" },
  { name: "Orange", arabicName: "برتقالي", hex: "#FFA500" },
  { name: "Pink", arabicName: "وردي", hex: "#FFC0CB", textDark: true },
  { name: "Brown", arabicName: "بني", hex: "#A52A2A" },
  { name: "Grey", arabicName: "رمادي", hex: "#808080" },
  { name: "Turquoise", arabicName: "فيروزي", hex: "#40E0D0", textDark: true },
];

interface ColorData {
  name: string;
  arabicName: string;
  hex: string;
  textDark?: boolean;
}

const units: string[] = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const teens: string[] = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const tensMultiples: string[] = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function numberToEnglishWords(num: number): string {
  if (num === 0) return "zero";
  if (num < 0 || num >= 1000 || !Number.isInteger(num)) {
    return "Please enter a whole number between 0 and 999.";
  }

  let words = "";

  if (num >= 100) {
    words += units[Math.floor(num / 100)] + " hundred";
    num %= 100;
    if (num > 0) words += " and ";
  }

  if (num >= 20) {
    words += tensMultiples[Math.floor(num / 10)];
    num %= 10;
    if (num > 0) words += "-";
  } else if (num >= 10) {
    words += teens[num - 10];
    num = 0; 
  }

  if (num > 0) {
    words += units[num];
  }
  
  return words.trim().replace(/-$/, '');
}


const NumbersAndColorsExplorer: React.FC = () => {
  const [numberInput, setNumberInput] = useState<string>('');
  const [numberSpelling, setNumberSpelling] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<ColorData | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const handlePronounce = (textToSpeak: string) => {
    if (!textToSpeak || isSpeaking || typeof window === 'undefined' || !window.speechSynthesis) return;

    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'en-US';
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
        console.error("Browser TTS error.");
        setIsSpeaking(false);
    }
    window.speechSynthesis.speak(utterance);
  };

  const handlePronounceNumber = () => {
    if (numberInput.trim() === '' || isSpeaking) return;
    
    const num = parseInt(numberInput.trim(), 10);

    if (isNaN(num)) {
      setNumberSpelling("الرجاء إدخال رقم صحيح.");
      return;
    }
    
    const spelling = numberToEnglishWords(num);
    setNumberSpelling(spelling);
    handlePronounce(spelling);
  };

  const handleColorButtonClick = (color: ColorData) => {
    if (isSpeaking) return;
    setSelectedColor(color);
    handlePronounce(color.name);
  };

  return (
    <div className="min-h-[70vh] bg-background text-foreground p-4 md:p-6 font-body flex flex-col">
      <header className="text-center mb-6 md:mb-10">
        <h1 className="text-3xl md:text-5xl font-headline text-primary-foreground">مستكشف الأرقام والألوان</h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          اكتب رقمًا أو اختر لونًا لتعلم نطقه باللغة الإنجليزية.
        </p>
      </header>

      <main className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-8 flex-grow">
        <Card className="w-full bg-card/80 backdrop-blur-sm border-border shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary flex items-center">
              <SpellCheck className="ms-2 h-6 w-6" />
              تعلم نطق الأرقام وتهجئتها
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="numberInput" className="block text-sm font-medium text-card-foreground mb-1">
                أدخل رقمًا (0-999، بالأرقام الإنجليزية):
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="numberInput"
                  type="text" 
                  value={numberInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow only numbers and limit length for 0-999 practical range
                    if (/^\d*$/.test(value) && value.length <= 3) {
                       setNumberInput(value);
                    }
                    if (value.trim() === '') setNumberSpelling('');
                  }}
                  placeholder="مثال: 1, 23, 100, 999"
                  className="bg-input text-foreground flex-grow w-full"
                  inputMode="numeric" 
                  pattern="[0-9]*"
                />
                <Button 
                  onClick={handlePronounceNumber} 
                  disabled={isSpeaking || numberInput.trim() === ''}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto"
                >
                  {isSpeaking ? <Loader2 className="ms-2 h-5 w-5 animate-spin"/> : <Volume2 className="ms-2 h-5 w-5" />}
                  انطق واظهر التهجئة
                </Button>
              </div>
            </div>
            {numberSpelling && (
              <div className="mt-3 p-3 bg-muted/50 rounded-md border border-border">
                <p className="text-sm text-card-foreground">
                  <span className="font-semibold">التهجئة بالإنجليزية:</span> {numberSpelling}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full bg-card/80 backdrop-blur-sm border-border shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary flex items-center">
              <SpellCheck className="ms-2 h-6 w-6" /> 
              تعلم نطق الألوان
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
              {colorsData.map((color) => (
                <Button
                  key={color.name}
                  onClick={() => handleColorButtonClick(color)}
                  style={{ backgroundColor: color.hex }}
                  className={`font-headline p-4 h-auto text-lg rounded-md shadow-md hover:opacity-90 transition-opacity ${
                    color.textDark ? 'text-black' : 'text-white'
                  } border-2 ${selectedColor?.name === color.name ? 'border-accent ring-2 ring-accent' : 'border-transparent'}`}
                  disabled={isSpeaking}
                >
                  {isSpeaking && selectedColor?.name === color.name ? <Loader2 className="animate-spin" /> : color.arabicName}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="mt-auto pt-8 text-center text-sm text-muted-foreground font-body">
        <p>© {currentYear} مستكشف الأرقام والألوان | تعلم بمتعة!</p>
      </footer>
    </div>
  );
};

export default NumbersAndColorsExplorer;
