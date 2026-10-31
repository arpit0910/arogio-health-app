import { z } from 'zod';
import { env } from '../../config/env';
import { tokenStore } from '../../services/auth/tokenStore';
import { HttpClient } from '../../services/api/httpClient';
import type { ChatMessage } from './model';
const client = new HttpClient(env.apiUrl, async () => (await tokenStore.get())?.accessToken ?? null, 45000);
const schema = z.object({ message: z.object({ role: z.literal('assistant'), content: z.string().trim().min(1).max(8000) }) });
export async function askJeeva(messages: ChatMessage[], signal: AbortSignal, useSavedHealth = false) {
  const response = await client.request<unknown>({ path: '/chat/messages', method: 'POST', body: { messages, useSavedHealth }, signal });
  const parsed = schema.safeParse(response);
  if (!parsed.success) throw new Error('Jeeva returned an unreadable reply. Please retry your question.');
  return parsed.data.message;
}
