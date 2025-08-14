// src/lib/lessons/term-1/flows/generate-story-lesson.ts
'use server';

import { generateRawText, generateImage } from '@/lib/cloudflare-ai';
import { GenerateStoryLessonInputSchema, GenerateStoryLessonOutputSchema } from '@/types/generate-story-lesson';
import type { GenerateStoryLessonInput, GenerateStoryLessonOutput } from '@/types/generate-story-lesson';

const cleanJsonString = (str: string): string => {
    // Remove markdown fences
    let cleaned = str.replace(/```json\n|```/g, '').trim();
    // Remove trailing commas from objects and arrays
    cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
    return cleaned;
};


// Main Flow Function
export async function generateStoryLesson(input: GenerateStoryLessonInput): Promise<GenerateStoryLessonOutput> {
    const systemPrompt = `You are an expert curriculum designer for beginner English learners who speak Arabic. 
Create a complete, engaging story-based lesson about the topic: "${input.topic}".
Your entire response must be a valid JSON object.`;
    
    const userPrompt = `
**Instructions:**
1.  **Title**: Create a simple, clear title for the story in English.
2.  **Story**: Write a short, simple story (3-5 paragraphs) in English. The language must be very easy for a beginner to understand.
3.  **Vocabulary**: Extract 5 important vocabulary words from the story and provide their Arabic translations.
4.  **Grammar Analysis**: Identify 2 simple grammar concepts present in the story. For each, provide the concept name, the example sentence from the story, and a simple explanation in Arabic.
5.  **Comprehension MCQs**: Create 3 multiple-choice questions in English (with Arabic translation) to check if the student understood the story. Provide 3 options and the correct answer for each.
`;
    
    const textResponse = await generateRawText('@cf/mistralai/mistral-small-3.1-24b-instruct', systemPrompt, userPrompt);
    const cleanedTextResponse = cleanJsonString(textResponse);
    const lessonTextData = JSON.parse(cleanedTextResponse);

    if (!lessonTextData || !lessonTextData.story_english) {
      throw new Error("AI failed to generate the lesson's text content.");
    }
    
    const imagePrompt = `A simple, friendly, cartoon, children's book illustration of: ${lessonTextData.story_english}`;
    const imageBuffer = await generateImage(imagePrompt);
    const imageDataUri = `data:image/png;base64,${imageBuffer.toString('base64')}`;

    return {
      ...lessonTextData,
      image_data_uri: imageDataUri,
    };
}
