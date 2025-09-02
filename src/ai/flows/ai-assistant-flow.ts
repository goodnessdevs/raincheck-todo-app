'use server';
/**
 * @fileOverview An AI assistant chatbot flow.
 *
 * - aiAssistant - A function that handles the chatbot conversation.
 * - AiAssistantInput - The input type for the aiAssistant function.
 * - AiAssistantOutput - The return type for the aiAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiAssistantInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.array(z.object({ text: z.string() })),
  })).describe('The chat history between the user and the model.'),
  message: z.string().describe('The user\'s latest message.'),
});
export type AiAssistantInput = z.infer<typeof AiAssistantInputSchema>;

export type AiAssistantOutput = string;

export async function aiAssistant(input: AiAssistantInput): Promise<AiAssistantOutput> {
  return aiAssistantFlow(input);
}

const prompt = `You are a helpful AI assistant named "RainCheck AI". Your goal is to help users with their tasks, productivity, and brainstorming.

Keep your responses concise and helpful. Use Markdown for formatting where appropriate.`;


const aiAssistantFlow = ai.defineFlow(
  {
    name: 'aiAssistantFlow',
    inputSchema: AiAssistantInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt,
      history: input.history,
      input: input.message,
    });
    return output.text!;
  }
);
