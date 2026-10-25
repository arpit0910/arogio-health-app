import { useQuery } from '@tanstack/react-query';

import { isApiConfigured } from '../../../config/env';
import { getApiHealth } from '../api/platformApi';

export function useApiHealth() {
  return useQuery({
    queryKey: ['platform', 'health'],
    queryFn: ({ signal }) => getApiHealth(signal),
    enabled: isApiConfigured,
  });
}
