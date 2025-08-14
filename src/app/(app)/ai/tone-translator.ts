
'use server';
/**
 * @fileOverview An AI agent that translates text into happy or angry tones, considering conversation history.
 *
 * - translateTone - A function that handles the tone translation process.
 * - ToneTranslatorInput - The input type for the translateTone function.
 * - ToneTranslatorOutput - The return type for the translateTone function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export type Tone = 'happy' | 'angry' | 'sad' | 'excited' | 'motivated';

const ConversationTurnSchema = z.object({
  speaker: z.enum(['user', 'ai']).describe('Who said the message (user or ai).'),
  text: z.string().describe('The content of the message.'),
});

const ToneTranslatorInputSchema = z.object({
  message: z.string().describe('The current message from the user to translate. It can be in English or Arabic.'),
  tone: z.enum(['happy', 'angry', 'sad', 'excited', 'motivated']).describe('The desired tone of the translated message.'),
  username: z.string().optional().describe("The user's name."),
  conversationHistory: z.array(ConversationTurnSchema).optional().describe('The history of the conversation so far, up to the last 30 turns (60 messages). Each turn includes a user message and an AI response.'),
});
export type ToneTranslatorInput = z.infer<typeof ToneTranslatorInputSchema>;

const ToneTranslatorOutputSchema = z.object({
  translatedText: z.string().describe('The translated message in the specified tone, in English.'),
  emoji: z.string().describe('An emoji representing the specified tone.'),
});
export type ToneTranslatorOutput = z.infer<typeof ToneTranslatorOutputSchema>;

export async function translateTone(input: ToneTranslatorInput): Promise<ToneTranslatorOutput> {
  return toneTranslatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'toneTranslatorPrompt',
  input: {schema: ToneTranslatorInputSchema},
  output: {schema: ToneTranslatorOutputSchema},
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are a helpful and charismatic assistant that translates the user's intent into a specified tone.
Your primary task is to generate a conversational response that incorporates the user's message, translated into the requested tone.
Do not just translate the message literally; craft a natural-sounding reply that makes sense in the context of the conversation.

Your response MUST be in English, even if the user's message is in Arabic.

The tone should be one of: happy, angry, sad, excited, motivated.

{{#if username}}
The user's name is {{username}}. Address them by name if it feels natural, but don't overdo it.
{{/if}}

{{#if conversationHistory}}
Use this conversation history for context. Refer to past points to make your response more relevant and logical.
Conversation History (recent turns):
{{#each conversationHistory}}
{{#if this.text}}
{{this.speaker}}: {{this.text}}
{{/if}}
{{/each}}
---
{{/if}}

The user's latest message, which you need to weave into your response, is: "{{{message}}}"
The desired tone for your response is: {{tone}}.

Generate a response that embodies the {{tone}} tone and logically follows the conversation. Also provide an emoji that corresponds to the tone.

Your output must be a valid JSON object that conforms to this schema:
{
  "translatedText": "Your full, conversational response in the specified tone, in English.",
  "emoji": "An emoji representing the specified tone."
}
`,
});

const toneTranslatorFlow = ai.defineFlow(
  {
    name: 'toneTranslatorFlow',
    inputSchema: ToneTranslatorInputSchema,
    outputSchema: ToneTranslatorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
