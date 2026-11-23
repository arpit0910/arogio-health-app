import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../authentication/context/AuthContext';
import { recordStore } from './storage';
import type { HealthRecord } from './model';
export function useHealthRecords() {
  const { user } = useAuth(), client = useQueryClient(), owner = user?.id, queryKey = ['health-records', owner];
  const query = useQuery({ queryKey, enabled: !!owner, queryFn: () => recordStore.list(owner!), staleTime: Infinity });
  async function add(record: HealthRecord, uri: string) {
    if (!owner) throw new Error('Sign in to save health records.');
    await recordStore.add(owner, record, uri); await client.invalidateQueries({ queryKey });
  }
  async function remove(id: string) {
    if (!owner) throw new Error('Sign in to manage health records.');
    await recordStore.remove(owner, id); await client.invalidateQueries({ queryKey });
  }
  return { ...query, owner, add, remove };
}
