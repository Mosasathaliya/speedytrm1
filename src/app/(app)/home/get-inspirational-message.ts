// src/types/get-inspirational-message.ts
import { z } from 'zod';

export const GetInspirationalMessageOutputSchema = z.object({
  title: z.string().describe("A short, catchy title for the message in Arabic."),
  message: z.string().describe("The inspirational message in Arabic."),
});
export type GetInspirationalMessageOutput = z.infer<typeof GetInspirationalMessageOutputSchema>;
