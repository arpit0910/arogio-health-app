import { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppScreen } from '../../components/app/AppScreen';
import { DAction, DCard, DText, DTabs } from '../../components/app/DesignUI';
import { useCarePreferences } from './carePreferences';
import { loadProviderDetail } from './providerCatalog';
import { careRoute } from './api';
import { ResourceState } from './CarePrimitives';
import { CareGroup, CareRow } from '../../components/app/CareUI';
import { usePalette } from '../../theme/AppearanceProvider';
import { useTranslation } from '../../localization/LanguageProvider';

export function SavedCareScreen() {
  const { kind, history } = useLocalSearchParams<{ kind?: string; history?: string }>(), router = useRouter(), prefs = useCarePreferences();
  const colors = usePalette(), { t } = useTranslation();
  const [error, setError] = useState('');
  const saved = prefs.data.saved.filter(item => !kind || item.kind === kind);
  const providers = useQuery({ queryKey: ['saved-care-details', saved], enabled: !history && prefs.isSuccess && saved.length > 0,
    queryFn: async ({ signal }) => Promise.all(saved.map(async item => {
      try { return { item, entry: await loadProviderDetail(item.id, item.kind, signal) }; }
      catch { return { item, entry: null }; }
    })) });
  return <AppScreen back title={t('Saved care')}><View style={{ gap: 14 }}>
    <View style={{ padding: 20, borderRadius: 24, backgroundColor: colors.mintSurface, gap: 8 }}>
      <DText kind="title">{history ? 'Recent searches' : 'Your saved providers'}</DText>
      <DText>Your saved care and recent searches stay on this device, separately for each account.</DText>
    </View>
    <DTabs grid options={['Saved providers', 'Recent searches']} value={history ? 'Recent searches' : 'Saved providers'} onChange={value => {
      setError('');
      router.setParams({ history: value === 'Recent searches' ? '1' : '' });
    }} />
    {prefs.isPending || prefs.isError ? <ResourceState loading={prefs.isPending} error={prefs.isError} onRetry={() => void prefs.refetch()} /> : history ? <>
      {!prefs.data.recent.length && <DText>No recent searches yet. Search Find Care to start.</DText>}
      {prefs.data.recent.length > 0 && <CareGroup>
        {prefs.data.recent.map(term => <CareRow key={term} title={term} icon="clock" onPress={() => router.push({ pathname: '/find-care', params: { search: term } })} />)}
      </CareGroup>}
      {!!prefs.data.recent.length && <DAction label="Clear history" onPress={() => void prefs.clearRecent().catch(() => setError('History could not be cleared. Try again.'))} />}
    </> : <>
      {!saved.length && <DText>No providers saved yet. Use Save on a provider card or details page.</DText>}
      {providers.isPending && saved.length > 0 && <ResourceState loading />}
      {providers.data?.map(({ item, entry }) => <DCard key={`${item.kind}:${item.id}`}>
        {entry ? <><DText kind="title">{entry.name}</DText><DText>{entry.address}</DText><DAction label="View details" onPress={() => router.push(careRoute(entry))} /></> : <><DText>Provider details could not be loaded.</DText><DAction label="Retry" onPress={() => void providers.refetch()} /></>}
        <DAction label="Remove from saved" onPress={() => void prefs.toggle(item.id, item.kind).catch(e => setError(e.message))} />
      </DCard>)}
    </>}
    {!!error && <DText color={colors.error}>{error}</DText>}<DAction label="Browse care" onPress={() => router.navigate('/find-care')} />
  </View></AppScreen>;
}
