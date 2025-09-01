'use server';
/**
 * @fileOverview Suggests optimal task completion times based on task details.
 *
 * - suggestOptimalTaskCompletionTimes - A function that handles the task scheduling process.
 * - SuggestOptimalTaskCompletionTimesInput - The input type for the suggestOptimalTaskCompletionTimes function.
 * - SuggestOptimalTaskCompletionTimesOutput - The return type for the suggestOptimalTaskCompletionTimes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalTaskCompletionTimesInputSchema = z.object({
  taskTitle: z.string().describe('The title of the task.'),
  taskDescription: z.string().describe('A detailed description of the task.'),
  currentTime: z.string().describe('The current time, formatted as a string.'),
});
export type SuggestOptimalTaskCompletionTimesInput = z.infer<typeof SuggestOptimalTaskCompletionTimesInputSchema>;

const SuggestOptimalTaskCompletionTimesOutputSchema = z.object({
  suggestedCompletionTime: z.string().describe('The suggested completion time for the task, formatted as a string.'),
  reasoning: z.string().describe('The reasoning behind the suggested completion time.'),
});
export type SuggestOptimalTaskCompletionTimesOutput = z.infer<typeof SuggestOptimalTaskCompletionTimesOutputSchema>;

export async function suggestOptimalTaskCompletionTimes(input: SuggestOptimalTaskCompletionTimesInput): Promise<SuggestOptimalTaskCompletionTimesOutput> {
  return suggestOptimalTaskCompletionTimesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalTaskCompletionTimesPrompt',
  input: {schema: SuggestOptimalTaskCompletionTimesInputSchema},
  output: {schema: SuggestOptimalTaskCompletionTimesOutputSchema},
  prompt: `You are a scheduling assistant. Given the task details and the current time, suggest an optimal completion time for the task.

Task Title: {{{taskTitle}}}
Task Description: {{{taskDescription}}}
Current Time: {{{currentTime}}}

Consider the task details and provide a suggested completion time, along with a brief explanation of your reasoning.

Format the suggested completion time as a string.
`,
});

const suggestOptimalTaskCompletionTimesFlow = ai.defineFlow(
  {
    name: 'suggestOptimalTaskCompletionTimesFlow',
    inputSchema: SuggestOptimalTaskCompletionTimesInputSchema,
    outputSchema: SuggestOptimalTaskCompletionTimesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
