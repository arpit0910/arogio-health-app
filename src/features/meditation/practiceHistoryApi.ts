import { z } from 'zod';
import { apiClient } from '../../services/api/client';

const progressSchema = z.object({
  totalSessions: z.number().int().nonnegative(),
  totalSeconds: z.number().int().nonnegative(),
  items: z.array(z.object({
    id: z.string(),
    version: z.number().int().positive(),
    title_en: z.string(),
    title_hi: z.string(),
    elapsedSeconds: z.number().int().positive(),
    completedAt: z.string().datetime(),
  })),
});

export async function loadPracticeHistory(signal?: AbortSignal) {
  return progressSchema.parse(await apiClient.request({ path: '/meditation/progress', signal }));
}

export async function savePracticeCompletion(input: {
  attemptId: string; itemId: string; version: number; elapsedSeconds: number;
}) {
  const response = await apiClient.request({ path: '/meditation/progress', method: 'POST', body: input });
  const receipt = z.object({ attemptId: z.string() }).parse(response);
  if (receipt.attemptId !== input.attemptId) throw new Error('Practice completion could not be confirmed.');
}
