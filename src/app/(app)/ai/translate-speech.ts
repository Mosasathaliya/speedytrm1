// src/types/translate-speech.ts
import {z} from 'zod';

export const TranslateSpeechInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "An audio clip as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  sourceLanguageName: z.string().describe('The name of the language spoken in the audio (e.g., "Arabic").'),
  targetLanguageName: z.string().describe('The name of the language to translate the text to (e.g., "English").'),
});
export type TranslateSpeechInput = z.infer<typeof TranslateSpeechInputSchema>;

export const TranslateSpeechOutputSchema = z.object({
  originalTranscription: z.string().describe('The transcribed text in the source language.'),
  translatedText: z.string().describe('The translated text in the target language.'),
});
export type TranslateSpeechOutput = z.infer<typeof TranslateSpeechOutputSchema>;
