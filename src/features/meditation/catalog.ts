import { z } from 'zod';
import { publicApi as apiClient } from '../care-directory/api';
import { exercises, type Exercise } from './exercises';

const stepSchema = z.object({ title_en: z.string(), title_hi: z.string(), instruction_en: z.string(), instruction_hi: z.string(), seconds: z.number().int().positive() });
export const meditationItemSchema = z.object({
  id: z.string(), kind: z.enum(['video', 'practice']), section: z.enum(['affirmations', 'meditation', 'breathing', 'grounding']),
  title_en: z.string(), title_hi: z.string(), description_en: z.string(), description_hi: z.string(),
  preparation_en: z.string(), preparation_hi: z.string(), author: z.string(),
  videoId: z.string().regex(/^[A-Za-z0-9_-]{11}$/).nullable(), durationSeconds: z.number().nullable(),
  steps: z.array(stepSchema), repeat: z.number().int().positive(),
});
export type MeditationItem = z.infer<typeof meditationItemSchema>;
const catalogPage = z.object({ items: z.array(meditationItemSchema), page: z.number().int().positive(), hasNext: z.boolean() });
export async function loadMeditationPage(page: number, signal?: AbortSignal) {
  return catalogPage.parse(await apiClient.request({ path: `/public/meditation/content?page=${page}&limit=24`, signal }));
}
export function catalogExercise(item: MeditationItem, hindi: boolean): Exercise {
  const copy = (english: string, translated: string) => hindi && translated ? translated : english;
  return { id: item.id, section: item.section, title: copy(item.title_en, item.title_hi),
    description: copy(item.description_en, item.description_hi), preparation: copy(item.preparation_en, item.preparation_hi), repeat: item.repeat,
    steps: item.steps.map(step => ({ title: copy(step.title_en, step.title_hi), instruction: copy(step.instruction_en, step.instruction_hi), seconds: step.seconds })) };
}

export function availablePractices(items: MeditationItem[], hindi: boolean): Exercise[] {
  const published = items.filter(item => item.kind === 'practice');
  const titles = new Set(published.map(item => item.title_en.trim().toLowerCase()));
  const ids = new Set(published.map(item => item.id));
  return [...exercises.filter(item => !ids.has(item.id) && !titles.has(item.title.toLowerCase())), ...published.map(item => catalogExercise(item, hindi))];
}
