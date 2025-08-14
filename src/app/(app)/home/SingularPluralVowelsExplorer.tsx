"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Volume2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface SingularPluralExample {
  id: string;
  singular: string;
  plural: string;
  arabic: string;
  emoji: string;
}

interface VowelExample {
  id: string;
  vowel: string; // e.g., 'a'
  exampleWord: string; // e.g., 'cat'
  arabicWord: string; // e.g., 'قطة'
  soundTypeArabic: string; // e.g., 'صوت A القصير'
  arabicExplanation: string; // e.g., 'كما في كلمة "cat" حيث يُنطق حرف A بشكل قصير ومفتوح.'
  emoji: string;
}

const singularPluralData: SingularPluralExample[] = [
  { id: "sp1", singular: "Book", plural: "Books", arabic: "كتاب / كتب", emoji: "📚" },
  { id: "sp2", singular: "Cat", plural: "Cats", arabic: "قطة / قطط", emoji: "🐱" },
  { id: "sp3", singular: "Box", plural: "Boxes", arabic: "صندوق / صناديق", emoji: "📦" },
  { id: "sp4", singular: "Watch", plural: "Watches", arabic: "ساعة يد / ساعات يد", emoji: "⌚" },
  { id: "sp5", singular: "City", plural: "Cities", arabic: "مدينة / مدن", emoji: "🏙️" },
  { id: "sp6", singular: "Boy", plural: "Boys", arabic: "ولد / أولاد", emoji: "👦" },
  { id: "sp7", singular: "Leaf", plural: "Leaves", arabic: "ورقة شجر / أوراق شجر", emoji: "🍃" },
  { id: "sp8", singular: "Man", plural: "Men", arabic: "رجل / رجال", emoji: "👨" },
  { id: "sp9", singular: "Child", plural: "Children", arabic: "طفل / أطفال", emoji: "👶" },
  { id: "sp10", singular: "Sheep", plural: "Sheep", arabic: "خروف / خراف", emoji: "🐑" },
  { id: "sp11", singular: "Mouse", plural: "Mice", arabic: "فأر / فئران", emoji: "🐭" },
  { id: "sp12", singular: "Key", plural: "Keys", arabic: "مفتاح / مفاتيح", emoji: "🔑" },
  { id: "sp13", singular: "Potato", plural: "Potatoes", arabic: "بطاطس / بطاطس", emoji: "🥔" },
  { id: "sp14", singular: "Wife", plural: "Wives", arabic: "زوجة / زوجات", emoji: "👩‍❤️‍👨" },
  { id: "sp15", singular: "Foot", plural: "Feet", arabic: "قدم / أقدام", emoji: "🦶" },
];

const vowelsData: VowelExample[] = [
  { id: "v1", vowel: "A", exampleWord: "Apple", arabicWord: "تفاحة", soundTypeArabic: "صوت A القصير", arabicExplanation: "يُنطق حرف 'A' هنا كصوت قصير ومفتوح، كما في كلمة 'cat' أو 'map'.", emoji: "🍎" },
  { id: "v2", vowel: "A", exampleWord: "Cake", arabicWord: "كيكة", soundTypeArabic: "صوت A الطويل", arabicExplanation: "يُنطق حرف 'A' هنا كصوت طويل، مشابه لاسمه 'ay'، كما في كلمة 'name' أو 'gate'. وجود حرف 'e' صامت في نهاية الكلمة غالبًا ما يشير إلى ذلك.", emoji: "🍰" },
  { id: "v3", vowel: "E", exampleWord: "Elephant", arabicWord: "فيل", soundTypeArabic: "صوت E القصير", arabicExplanation: "يُنطق حرف 'E' هنا كصوت قصير، كما في كلمة 'bed' أو 'pen'.", emoji: "🐘" },
  { id: "v4", vowel: "E", exampleWord: "Tree", arabicWord: "شجرة", soundTypeArabic: "صوت E الطويل", arabicExplanation: "عندما يأتي حرفا 'e' معًا (ee)، فإنهما عادةً ما ينتجان صوت 'E' الطويل، كما في كلمة 'see' أو 'feet'.", emoji: "🌳" },
  { id: "v5", vowel: "I", exampleWord: "Igloo", arabicWord: "كوخ جليدي", soundTypeArabic: "صوت I القصير", arabicExplanation: "يُنطق حرف 'I' هنا كصوت قصير، كما في كلمة 'sit' أو 'pin'.", emoji: "🧊" },
  { id: "v6", vowel: "I", exampleWord: "Bike", arabicWord: "دراجة", soundTypeArabic: "صوت I الطويل", arabicExplanation: "يُنطق حرف 'I' هنا كصوت طويل، مشابه لاسمه 'eye'، كما في كلمة 'like' أو 'time'. وجود حرف 'e' صامت في نهاية الكلمة غالبًا ما يشير إلى ذلك.", emoji: "🚲" },
  { id: "v7", vowel: "O", exampleWord: "Octopus", arabicWord: "أخطبوط", soundTypeArabic: "صوت O القصير", arabicExplanation: "يُنطق حرف 'O' هنا كصوت قصير، كما في كلمة 'hot' أو 'dog'.", emoji: "🐙" },
  { id: "v8", vowel: "O", exampleWord: "Home", arabicWord: "منزل", soundTypeArabic: "صوت O الطويل", arabicExplanation: "يُنطق حرف 'O' هنا كصوت طويل، مشابه لاسمه 'owe'، كما في كلمة 'go' أو 'bone'. وجود حرف 'e' صامت في نهاية الكلمة غالبًا ما يشير إلى ذلك.", emoji: "🏠" },
  { id: "v9", vowel: "U", exampleWord: "Umbrella", arabicWord: "مظلة", soundTypeArabic: "صوت U القصير", arabicExplanation: "يُنطق حرف 'U' هنا كصوت قصير، كما في كلمة 'cup' أو 'sun'.", emoji: "☂️" },
  { id: "v10", vowel: "U", exampleWord: "Cute", arabicWord: "لطيف", soundTypeArabic: "صوت U الطويل", arabicExplanation: "يُنطق حرف 'U' هنا كصوت طويل، مشابه لاسمه 'you'، كما في كلمة 'flute' أو 'use'. وجود حرف 'e' صامت في نهاية الكلمة غالبًا ما يشير إلى ذلك.", emoji: "🧸" },
];


const SingularPluralVowelsExplorer: React.FC = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    return () => { // Cleanup speech synthesis on component unmount
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakText = (text: string, lang: string = 'en-US') => {
    if (!('speechSynthesis' in window) || isSpeaking) {
      if (!('speechSynthesis' in window)) alert("خاصية تحويل النص إلى كلام غير مدعومة في هذا المتصفح.");
      return;
    }
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error("SpeechSynthesisUtterance.onerror - Error:", event.error, "Text:", text);
      setIsSpeaking(false);
      alert(`حدث خطأ أثناء محاولة نطق النص: ${event.error}`);
    };
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-8 p-4 md:p-6 font-body bg-background text-foreground">
      <header className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-headline text-primary-foreground">
          الفصل العاشر: المفرد والجمع والحروف المتحركة
        </h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          تعمق في فهم قواعد الأسماء والحروف المتحركة الأساسية في اللغة الإنجليزية.
        </p>
      </header>

      {/* Singular and Plural Section */}
      <Card className="bg-card/90 backdrop-blur-sm border-border shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">أولاً: المفرد والجمع (Singular and Plural)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-card-foreground text-base leading-relaxed">
          <p>الاسم المفرد (Singular Noun) يشير إلى شيء واحد فقط، شخص واحد، مكان واحد، أو فكرة واحدة. مثال: <span className="font-semibold text-accent">كتاب</span> (book)، <span className="font-semibold text-accent">قطة</span> (cat).</p>
          <p>الاسم الجمع (Plural Noun) يشير إلى أكثر من شيء واحد، أشخاص، أماكن، أو أفكار. مثال: <span className="font-semibold text-accent">كتب</span> (books)، <span className="font-semibold text-accent">قطط</span> (cats).</p>
          
          <h3 className="font-headline text-xl text-primary-foreground pt-4">قواعد تكوين الجمع الشائعة:</h3>
          <ul className="list-disc pr-5 space-y-2">
            <li><strong>إضافة "-s":</strong> القاعدة الأكثر شيوعًا. مثال: <span className="font-semibold text-accent">car → cars</span> (سيارة / سيارات).</li>
            <li><strong>إضافة "-es":</strong> للأسماء التي تنتهي بـ <span className="font-semibold text-accent">-s, -x, -z, -ch, -sh</span>. مثال: <span className="font-semibold text-accent">box → boxes</span> (صندوق / صناديق)، <span className="font-semibold text-accent">watch → watches</span> (ساعة / ساعات).</li>
            <li><strong>الأسماء المنتهية بـ "-y":</strong>
              <ul className="list-['-_'] pr-5 space-y-1 mt-1">
                <li>إذا كان الحرف قبل "-y" ساكنًا، نحذف "-y" ونضيف "-ies". مثال: <span className="font-semibold text-accent">city → cities</span> (مدينة / مدن).</li>
                <li>إذا كان الحرف قبل "-y" متحركًا (a, e, i, o, u)، نضيف "-s" فقط. مثال: <span className="font-semibold text-accent">boy → boys</span> (ولد / أولاد).</li>
              </ul>
            </li>
            <li><strong>الأسماء المنتهية بـ "-f" أو "-fe":</strong> غالبًا ما نحذف "-f" أو "-fe" ونضيف "-ves". مثال: <span className="font-semibold text-accent">leaf → leaves</span> (ورقة شجر / أوراق)، <span className="font-semibold text-accent">wife → wives</span> (زوجة / زوجات). (توجد استثناءات مثل: <span className="font-semibold text-accent">roof → roofs</span>).</li>
            <li><strong>الجمع غير المنتظم (Irregular Plurals):</strong> بعض الأسماء لها صيغ جمع خاصة لا تتبع القواعد. مثال: <span className="font-semibold text-accent">man → men</span> (رجل / رجال)، <span className="font-semibold text-accent">child → children</span> (طفل / أطفال)، <span className="font-semibold text-accent">foot → feet</span> (قدم / أقدام).</li>
            <li><strong>أسماء لا تتغير في الجمع:</strong> بعض الأسماء تبقى كما هي في المفرد والجمع. مثال: <span className="font-semibold text-accent">sheep</span> (خروف / خراف)، <span className="font-semibold text-accent">fish</span> (سمكة / سمك).</li>
          </ul>

          <h3 className="font-headline text-xl text-primary-foreground pt-6">أمثلة على المفرد والجمع:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {singularPluralData.map(item => (
              <Card key={item.id} className="bg-background/70 border-border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{item.emoji}</span>
                  <p className="text-sm text-muted-foreground dir-rtl text-right">{item.arabic}</p>
                </div>
                <div className="flex flex-col space-y-1">
                  <Button variant="outline" size="sm" onClick={() => speakText(item.singular)} disabled={isSpeaking} className="justify-start bg-accent/10 hover:bg-accent/20">
                     <Volume2 className="me-2 h-4 w-4 text-accent" /> <span className="font-semibold">Singular:</span> {item.singular}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => speakText(item.plural)} disabled={isSpeaking} className="justify-start bg-primary/10 hover:bg-primary/20">
                    <Volume2 className="me-2 h-4 w-4 text-primary" /> <span className="font-semibold">Plural:</span> {item.plural}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Vowels Section */}
      <Card className="bg-card/90 backdrop-blur-sm border-border shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">ثانياً: الحروف المتحركة (Vowels)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-card-foreground text-base leading-relaxed">
          <p>الحروف المتحركة في اللغة الإنجليزية هي <span className="font-semibold text-accent">A, E, I, O, U</span>. أحيانًا يُعتبر حرف <span className="font-semibold text-accent">Y</span> حرفًا متحركًا أيضًا.</p>
          <p>تلعب الحروف المتحركة دورًا أساسيًا في تكوين المقاطع الصوتية والكلمات. لكل حرف متحرك صوت قصير وصوت طويل على الأقل، بالإضافة إلى أصوات أخرى يمكن أن ينتجها في تراكيب مختلفة.</p>
          
          <h3 className="font-headline text-xl text-primary-foreground pt-4">الأصوات الأساسية للحروف المتحركة:</h3>
          <ul className="list-disc pr-5 space-y-2">
            <li><strong>الصوت القصير (Short Sound):</strong> هو الصوت الذي يصدره الحرف المتحرك عادةً عندما يكون متبوعًا بحرف ساكن واحد أو أكثر في مقطع لفظي مغلق. مثال: 'a' في <span className="font-semibold text-accent">cat</span>, 'e' في <span className="font-semibold text-accent">bed</span>, 'i' في <span className="font-semibold text-accent">sit</span>, 'o' في <span className="font-semibold text-accent">hot</span>, 'u' في <span className="font-semibold text-accent">cup</span>.</li>
            <li><strong>الصوت الطويل (Long Sound):</strong> هو الصوت الذي يصدره الحرف المتحرك وعادةً ما يكون مشابهًا لاسمه. يمكن أن يحدث هذا عندما ينتهي المقطع بحرف 'e' صامت (magic e)، أو عندما يجتمع حرفان متحركان معًا. مثال: 'a' في <span className="font-semibold text-accent">cake</span>, 'e' في <span className="font-semibold text-accent">see</span>, 'i' في <span className="font-semibold text-accent">bike</span>, 'o' في <span className="font-semibold text-accent">home</span>, 'u' في <span className="font-semibold text-accent">cute</span>.</li>
          </ul>

          <h3 className="font-headline text-xl text-primary-foreground pt-6">أمثلة على استخدام الحروف المتحركة:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {vowelsData.map(item => (
              <Card key={item.id} className="bg-background/70 border-border p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{item.emoji}</span>
                  <div>
                    <Button variant="outline" size="sm" onClick={() => speakText(item.exampleWord)} disabled={isSpeaking} className="bg-accent/10 hover:bg-accent/20">
                      <Volume2 className="me-2 h-4 w-4 text-accent" /> {item.exampleWord}
                    </Button>
                    <p className="text-sm text-muted-foreground mt-1">{item.arabicWord}</p>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-primary">{item.soundTypeArabic} (Vowel: {item.vowel})</p>
                  <p className="text-sm text-card-foreground mt-1">{item.arabicExplanation}</p>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <footer className="mt-auto pt-8 text-center text-sm text-muted-foreground font-body">
        <p>© {currentYear} مستكشف القواعد | تعلم بمتعة!</p>
      </footer>
    </div>
  );
};

export default SingularPluralVowelsExplorer;
