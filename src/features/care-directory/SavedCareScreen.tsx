import { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppScreen } from '../../components/app/AppScreen';
import { DAction, DCard, DText } from '../../components/app/DesignUI';
import { useCarePreferences } from './carePreferences';
import { loadProviderDetail } from './providerCatalog';
import { careRoute } from './api';
import { ResourceState } from './CarePrimitives';

export function SavedCareScreen() {
  const { kind, history } = useLocalSearchParams<{ kind?: string; history?: string }>(), router = useRouter(), prefs = useCarePreferences();
  const [error, setError] = useState('');
  const saved = prefs.data.saved.filter(item => !kind || item.kind === kind);
  const providers = useQuery({ queryKey: ['saved-care-details', saved], enabled: !history && prefs.isSuccess && saved.length > 0,
    queryFn: async ({ signal }) => Promise.all(saved.map(async item => {
      try { return { item, entry: await loadProviderDetail(item.id, item.kind, signal) }; }
      catch { return { item, entry: null }; }
    })) });
  return <AppScreen back title={history ? 'Recent searches' : 'Saved care'}><View style={{ gap: 14 }}>
    <DText>Your saved care and recent searches stay on this device, separately for each account.</DText>
    {prefs.isPending || prefs.isError ? <ResourceState loading={prefs.isPending} error={prefs.isError} onRetry={() => void prefs.refetch()} /> : history ? <>
      {!prefs.data.recent.length && <DText>No recent searches yet. Search Find Care to start.</DText>}
      {prefs.data.recent.map(term => <DCard key={term}><DAction label={term} onPress={() => router.push({ pathname: '/find-care', params: { search: term } })} /></DCard>)}
      {!!prefs.data.recent.length && <DAction label="Clear history" onPress={() => void prefs.clearRecent().catch(() => setError('History could not be cleared. Try again.'))} />}
    </> : <>
      {!saved.length && <DText>No providers saved yet. Use Save on a provider card or details page.</DText>}
      {providers.isPending && saved.length > 0 && <ResourceState loading />}
      {providers.data?.map(({ item, entry }) => <DCard key={`${item.kind}:${item.id}`}>
        {entry ? <><DText kind="title">{entry.name}</DText><DText>{entry.address}</DText><DAction label="View details" onPress={() => router.push(careRoute(entry))} /></> : <><DText>Provider details could not be loaded.</DText><DAction label="Retry" onPress={() => void providers.refetch()} /></>}
        <DAction label="Remove from saved" onPress={() => void prefs.toggle(item.id, item.kind).catch(e => setError(e.message))} />
      </DCard>)}
    </>}
    {!!error && <DText color="#BD3038">{error}</DText>}<DAction label="Browse care" onPress={() => router.navigate('/find-care')} />
  </View></AppScreen>;
}
