import { z } from 'zod';
import { publicApi as apiClient } from '../care-directory/api';
import type { Exercise } from './exercises';

const stepSchema = z.object({
  title_en: z.string(),
  title_hi: z.string(),
  instruction_en: z.string(),
  instruction_hi: z.string(),
  seconds: z.number().int().positive(),
  sanskritName: z.string().optional(),
  imageUrl: z.string().optional(),
  impact_en: z.string().optional(),
  impact_hi: z.string().optional(),
  videoId: z.string().regex(/^[A-Za-z0-9_-]{11}$/).nullable().optional(),
  phase: z.enum(['warmup', 'main', 'cooldown']).optional(),
});
export const meditationItemSchema = z.object({
  id: z.string(), kind: z.enum(['video', 'practice']), section: z.enum(['affirmations', 'meditation', 'breathing', 'grounding', 'yoga', 'focus', 'rest']),
  title_en: z.string(), title_hi: z.string(), description_en: z.string(), description_hi: z.string(),
  preparation_en: z.string(), preparation_hi: z.string(),
  impact_en: z.string().optional().default(''),
  impact_hi: z.string().optional().default(''),
  sanskritName: z.string().optional().default(''),
  difficulty: z.enum(['gentle', 'beginner', 'intermediate']).optional().default('gentle'),
  imageUrl: z.string().optional().default(''),
  audioUrl: z.string().optional().default(''),
  author: z.string(),
  videoId: z.string().regex(/^[A-Za-z0-9_-]{11}$/).nullable(), durationSeconds: z.number().nullable(),
  steps: z.array(stepSchema), repeat: z.number().int().positive(),
  publishedVersion: z.number().int().positive().optional(),
});
export type MeditationItem = z.infer<typeof meditationItemSchema>;
const catalogPage = z.object({ items: z.array(meditationItemSchema), page: z.number().int().positive(), hasNext: z.boolean() });
export async function loadMeditationPage(page: number, signal?: AbortSignal, section?: MeditationItem['section']) {
  const params = new URLSearchParams({ page: String(page), limit: '24' });
  if (section) params.set('section', section);
  return catalogPage.parse(await apiClient.request({ path: `/public/meditation/content?${params}`, signal }));
}
export async function loadMeditationItem(id: string, signal?: AbortSignal) {
  return meditationItemSchema.parse(await apiClient.request({ path: `/public/meditation/content/${encodeURIComponent(id)}`, signal }));
}
export function catalogExercise(item: MeditationItem, hindi: boolean): Exercise {
  const copy = (english: string, translated: string) => hindi && translated ? translated : english;
  const thumbnailVariant = item.section === 'yoga' && /evening/i.test(item.title_en) ? 'evening-yoga'
    : item.section === 'meditation' && /body scan/i.test(item.title_en) ? 'body-scan' : undefined;
  return {
    id: item.id,
    section: item.section,
    title: copy(item.title_en, item.title_hi),
    description: copy(item.description_en, item.description_hi),
    preparation: copy(item.preparation_en, item.preparation_hi),
    impact: copy(item.impact_en ?? '', item.impact_hi ?? '') || undefined,
    sanskritName: item.sanskritName || undefined,
    difficulty: item.difficulty,
    imageUrl: item.imageUrl || undefined,
    audioUrl: item.audioUrl || undefined,
    videoId: item.videoId ?? item.steps.find(step => step.videoId)?.videoId ?? null,
    repeat: item.repeat,
    publishedVersion: item.publishedVersion,
    thumbnailVariant,
    steps: item.steps.map(step => ({
      title: copy(step.title_en, step.title_hi),
      instruction: copy(step.instruction_en, step.instruction_hi),
      seconds: step.seconds,
      sanskritName: step.sanskritName,
      imageUrl: step.imageUrl,
      impact: copy(step.impact_en ?? '', step.impact_hi ?? '') || undefined,
      videoId: step.videoId,
      phase: step.phase,
    })),
  };
}

export function availablePractices(items: MeditationItem[], hindi: boolean): Exercise[] {
  return items.filter(item => item.kind === 'practice').map(item => catalogExercise(item, hindi));
}
