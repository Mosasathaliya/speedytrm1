// src/lib/lessons/term-1/flows/generate-grammar-adventure-scene.ts
'use server';

import { generateImage, generateRawText } from '@/lib/cloudflare-ai';
import type { GenerateGrammarAdventureSceneInput, GenerateGrammarAdventureSceneOutput } from '@/types/generate-grammar-adventure-scene';

const cleanJsonString = (str: string): string => {
    // Remove markdown fences
    let cleaned = str.replace(/```json\n|```/g, '').trim();
    // Remove trailing commas from objects and arrays
    cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
    return cleaned;
};


export async function generateGrammarAdventureScene(input: GenerateGrammarAdventureSceneInput): Promise<GenerateGrammarAdventureSceneOutput> {
    const systemPrompt = `You are a creative game master crafting a "Grammar Adventure" for a beginner English learner. Your response MUST be a valid JSON object.`;
    
    let userPrompt = `
**Instructions:**
1.  **Story Context**:
    *   ${input.previousStory ? `Continue the story from this point: "${input.previousStory}"` : `Start a new fantasy adventure. The first scene should be intriguing, like finding a mysterious map or entering a glowing cave.`}
2.  **Scene Generation**:
    *   Write a short, new paragraph (3-4 sentences) that continues the story. The tone should be epic and adventurous.
3.  **Grammar Question**:
    *   Based on the provided list of learned topics, create a multiple-choice question that tests one of these topics.
    *   Topics to test from: ${input.learnedTopics ? input.learnedTopics.join(', ') : "Basic Nouns, Verbs, Adjectives"}.
4.  **Options & Explanation**:
    *   Provide three plausible options for the question. Exactly one must be correct.
    *   Write a simple explanation in English for why the correct answer is right.
    *   Provide Arabic translations for the question, options, and explanation.
`;

    const textResponse = await generateRawText('@cf/mistralai/mistral-small-3.1-24b-instruct', systemPrompt, userPrompt);
    const cleanedTextResponse = cleanJsonString(textResponse);
    const sceneData = JSON.parse(cleanedTextResponse);
    
    if (!sceneData || !sceneData.story) {
        throw new Error("AI failed to generate a valid adventure scene.");
    }
    
    const imagePrompt = `cinematic, epic fantasy art, digital painting style of: ${sceneData.story}`;
    const imageBuffer = await generateImage(imagePrompt);
    const imageDataUri = `data:image/png;base64,${imageBuffer.toString('base64')}`;

    return { ...sceneData, imageDataUri };
}
