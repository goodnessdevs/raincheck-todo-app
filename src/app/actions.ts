'use server';

import { suggestOptimalTaskCompletionTimes } from '@/ai/flows/suggest-optimal-task-completion-times';
import type { SuggestOptimalTaskCompletionTimesOutput } from '@/ai/flows/suggest-optimal-task-completion-times';

export async function getSuggestion(
  taskTitle: string,
  taskDescription: string
): Promise<SuggestOptimalTaskCompletionTimesOutput> {
  const currentTime = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  try {
    const result = await suggestOptimalTaskCompletionTimes({
      taskTitle,
      taskDescription,
      currentTime,
    });
    return result;
  } catch (error) {
    console.error("Error getting suggestion:", error);
    // Return a structured error to the client
    throw new Error("Failed to get a suggestion from the AI. Please try again.");
  }
}
