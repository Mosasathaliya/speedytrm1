// src/types/mood-translator.ts
import { z } from 'zod';

export type Tone = 'happy' | 'angry' | 'sad' | 'excited' | 'motivated';

const ConversationTurnSchema = z.object({
  speaker: z.enum(['user', 'ai']).describe('Who said the message (user or ai).'),
  text: z.string().describe('The content of the message.'),
});

export interface ConversationTurn {
  speaker: 'user' | 'ai';
  text: string; // User input for user, Arabic response for AI
  englishResponse?: string; // English response for AI
  emoji?: string;
  timestamp: number;
}


export const ToneTranslatorInputSchema = z.object({
  message: z.string().describe('The current message from the user to translate. It can be in English or Arabic.'),
  tone: z.enum(['happy', 'angry', 'sad', 'excited', 'motivated']).describe('The desired tone of the translated message.'),
  username: z.string().optional().describe("The user's name."),
  conversationHistory: z.array(ConversationTurnSchema).optional().describe('The history of the conversation so far, up to the last 30 turns (60 messages). Each turn includes a user message and an AI response.'),
});
export type ToneTranslatorInput = z.infer<typeof ToneTranslatorInputSchema>;

export const ToneTranslatorOutputSchema = z.object({
  arabicResponse: z.string().describe("The AI tutor's response in Arabic."),
  englishResponse: z.string().describe("A relevant example sentence in English based on the conversation."),
  emoji: z.string().emoji().describe("A single emoji to reflect the tone of the response."),
});
export type ToneTranslatorOutput = z.infer<typeof ToneTranslatorOutputSchema>;
