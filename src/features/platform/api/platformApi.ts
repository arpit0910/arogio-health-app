import { z } from 'zod';

import { apiClient } from '../../../services/api/client';

const healthResponseSchema = z.object({ status: z.string(), timestamp: z.string().optional() });
export type HealthResponse = z.infer<typeof healthResponseSchema>;
const readinessResponseSchema = healthResponseSchema.extend({ checks: z.record(z.string()).optional() });
export type ReadinessResponse = z.infer<typeof readinessResponseSchema>;

export async function getApiHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const response = await apiClient.request<unknown>({ path: '/health/liveness', signal });
  return healthResponseSchema.parse(response);
}

export async function getApiReadiness(signal?: AbortSignal): Promise<ReadinessResponse> {
  const response = await apiClient.request<unknown>({ path: '/health/readiness', signal });
  return readinessResponseSchema.parse(response);
}
