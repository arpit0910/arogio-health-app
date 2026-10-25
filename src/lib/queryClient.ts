import { QueryClient } from '@tanstack/react-query';

import { ApiError } from '../services/api/httpClient';

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) return false;
  if (error instanceof ApiError) return error.status === 429 || error.status >= 500;
  return true;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: shouldRetry, staleTime: 30_000, gcTime: 5 * 60_000, refetchOnWindowFocus: false },
    mutations: { retry: false },
  },
});
