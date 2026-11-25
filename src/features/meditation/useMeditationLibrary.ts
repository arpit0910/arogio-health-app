import { useInfiniteQuery } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { loadMeditationPage, type MeditationItem } from './catalog';

export function useMeditationLibrary(section?: MeditationItem['section'], enabled = true) {
  const query = useInfiniteQuery({
    queryKey: ['meditation-library', section], initialPageParam: 1, enabled,
    queryFn: ({ pageParam, signal }) => loadMeditationPage(pageParam, signal, section),
    getNextPageParam: last => last.hasNext && last.items.length ? last.page + 1 : undefined,
    staleTime: 0,
  });
  const refresh = query.refetch;
  useFocusEffect(useCallback(() => { if (enabled) void refresh({ cancelRefetch: false }); }, [enabled, refresh]));
  const items = useMemo(() => Array.from(new Map(query.data?.pages.flatMap(page => page.items)
    .map(item => [item.id, item]) ?? []).values()), [query.data]);
  return { query, items };
}
