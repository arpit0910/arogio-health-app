import { z } from 'zod';

import { apiClient } from '../../../services/api/client';

const healthResponseSchema = z.object({ status: z.string(), timestamp: z.string().optional() });
export type HealthResponse = z.infer<typeof healthResponseSchema>;

export async function getApiHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const response = await apiClient.request<unknown>({ path: '/health', signal });
  return healthResponseSchema.parse(response);
}
