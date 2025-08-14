// src/lib/lessons/term-1/flows/get-translation.ts
'use server';

import { generateRawText } from '@/lib/cloudflare-ai';
import { GetTranslationOutputSchema } from '@/types/get-translation';
import type { GetTranslationInput, GetTranslationOutput } from '@/types/get-translation';

const cleanJsonString = (str: string): string => {
    // Remove markdown fences
    let cleaned = str.replace(/```json\n|```/g, '').trim();
    // Remove trailing commas from objects and arrays
    cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
    return cleaned;
};


export async function getTranslation(input: GetTranslationInput): Promise<GetTranslationOutput> {
    const systemPrompt = `You are an expert English-Arabic translator for beginner students. Your response must be a valid JSON object.`;
    const userPrompt = `Translate the following English word/phrase into Arabic and provide a very simple explanation of its meaning in Arabic. Word/Phrase: "${input.text_to_translate}"`;
    
    const responseText = await generateRawText('@cf/mistralai/mistral-small-3.1-24b-instruct', systemPrompt, userPrompt);
    const cleanedTextResponse = cleanJsonString(responseText);
    const translationData = JSON.parse(cleanedTextResponse);

    return GetTranslationOutputSchema.parse(translationData);
}
