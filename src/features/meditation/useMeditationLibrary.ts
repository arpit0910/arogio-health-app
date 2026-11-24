import { useInfiniteQuery } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { loadMeditationPage } from './catalog';

export function useMeditationLibrary() {
  const query = useInfiniteQuery({
    queryKey: ['meditation-library'], initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => loadMeditationPage(pageParam, signal),
    getNextPageParam: last => last.hasNext && last.items.length ? last.page + 1 : undefined,
    staleTime: 0,
  });
  const refresh = query.refetch;
  useFocusEffect(useCallback(() => { void refresh({ cancelRefetch: false }); }, [refresh]));
  const items = useMemo(() => Array.from(new Map(query.data?.pages.flatMap(page => page.items)
    .map(item => [item.id, item]) ?? []).values()), [query.data]);
  return { query, items };
}
