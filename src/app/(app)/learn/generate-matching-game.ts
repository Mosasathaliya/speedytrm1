// src/lib/lessons/term-1/flows/generate-matching-game.ts
'use server';

import { generateRawText } from '@/lib/cloudflare-ai';
import { GenerateMatchingGameInputSchema, GenerateMatchingGameOutputSchema } from '@/types/generate-matching-game';
import type { GenerateMatchingGameInput, GenerateMatchingGameOutput } from '@/types/generate-matching-game';

const cleanJsonString = (str: string): string => {
    // Remove markdown fences
    let cleaned = str.replace(/```json\n|```/g, '').trim();
    // Remove trailing commas from objects and arrays
    cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
    return cleaned;
};


export async function generateMatchingGame(input: GenerateMatchingGameInput): Promise<GenerateMatchingGameOutput> {
    const systemPrompt = `You are an English teacher creating a matching game for Arabic-speaking beginners. Your response must be a valid JSON object.`;
    const userPrompt = `Generate a theme and exactly 8 English-Arabic word pairs with emojis based on these topics:
"{{#if learnedTopics}}{{#each learnedTopics}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Beginner English Topics{{/if}}".`;
    
    const responseText = await generateRawText('@cf/mistralai/mistral-small-3.1-24b-instruct', systemPrompt, userPrompt);
    const cleanedTextResponse = cleanJsonString(responseText);
    const gameData = JSON.parse(cleanedTextResponse);

    return GenerateMatchingGameOutputSchema.parse(gameData);
}
