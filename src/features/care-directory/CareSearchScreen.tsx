import { useCarePreferences } from './carePreferences';
import {loadProviderPage,loadDepartments, type ProviderFilters} from './providerCatalog';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Linking, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useInfiniteQuery,useQuery } from '@tanstack/react-query';
import { AppScreen } from '../../components/app/AppScreen';
import { DAction, DCard, DField, DHeading, DPill, DTabs, DText, design, ds } from '../../components/app/DesignUI';
import { AppIcon } from '../../components/app/AppIcon';
import { ProviderArtwork } from '../../components/app/ProviderArtwork';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { careKinds, careLabels, carePhone, careDirections, careRoute, type CareKind, type CareEntry } from './api';
import { AppSearchBar, ResourceState } from './CarePrimitives';

function ProviderCard({ entry }: { entry: CareEntry }) {
  const prefs = useCarePreferences();
  const router = useRouter(), [error, setError] = useState(''), phone = carePhone(entry.phone);
  async function open(url: string) { try { await Linking.openURL(url); } catch { setError('Could not open this action. View details for contact information.'); } }
  return <DCard style={{ marginTop: 12, gap: 12 }}><TouchTarget accessibilityRole="button" onPress={() => router.push(careRoute(entry))} style={[ds.row, { alignItems: 'flex-start' }]}><ProviderArtwork entry={entry} style={{ width: 80, height: 80,borderRadius:entry.kind==='doctor'?40:12 }} /><View style={{ flex: 1, gap: 4 }}><DText kind="title">{entry.name}</DText><DPill>{entry.details.providerType || careLabels[entry.kind]}</DPill><DText kind="small">{entry.address}</DText></View></TouchTarget>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>{entry.details.specialties.slice(0, 3).map(text => <DPill key={text}>{text}</DPill>)}</View>
    <View style={[ds.row, { backgroundColor: design.pale, padding: 12, borderRadius: 10 }]}><AppIcon name="shield" size={21} color={design.green} /><View style={{ flex: 1 }}><DText kind="label">{entry.verification === 'source-reviewed' ? 'Source Reviewed' : 'Directory listing'}</DText><DText kind="small">Call to confirm services & availability</DText></View></View>
    {entry.details.consultationFee!=null&&<DText kind="small">{`Consultation fee: INR ${entry.details.consultationFee}`}</DText>}
    <View style={ds.row}>{phone && <View style={{ flex: 1 }}><DAction filled label={entry.kind === 'hospital' ? 'Call Hospital' : 'Call'} onPress={() => void open(phone)} /></View>}<View style={{ flex: 1, backgroundColor: design.pale, borderRadius: 10 }}><DAction label={entry.kind === 'medicine' ? 'View Details' : 'Directions'} onPress={() => entry.kind === 'medicine' ? router.push(careRoute(entry)) : void open(careDirections(entry))} /></View><TouchTarget accessibilityRole="button" accessibilityLabel="View details" onPress={() => router.push(careRoute(entry))} style={{ paddingHorizontal: 10, backgroundColor: design.pale, borderRadius: 10 }}><AppIcon name="right" size={18} color={design.green} /></TouchTarget></View>
    <DAction label={prefs.data.saved.some(x => x.id === entry.id && x.kind === entry.kind) ? 'Remove from saved' : 'Save provider'} disabled={prefs.isPending || prefs.isError} onPress={() => void prefs.toggle(entry.id, entry.kind).catch(e => setError(e.message))} />
    {!!error && <DText color="#BD3038">{error}</DText>}
  </DCard>;
}
export function CareSearchScreen({ fixedKind }: { fixedKind?: CareKind } = {}) {
  const prefs = useCarePreferences();
  const router = useRouter(), params = useLocalSearchParams<{ kind?: string; search?: string }>();
  const kind = fixedKind ?? (careKinds.includes(params.kind as CareKind) ? params.kind as CareKind : 'hospital');
  const [search, setSearch] = useState(params.search ?? ''), [term, setTerm] = useState(params.search ?? ''), [filter, setFilter] = useState('All Care');
  const [filtersOpen, setFiltersOpen] = useState(false), [city, setCity] = useState(''), [doctorLanguage, setDoctorLanguage] = useState('All languages');
  useEffect(() => { const timer = setTimeout(() => setSearch(params.search ?? ''), 0); return () => clearTimeout(timer); }, [params.search]);
  useEffect(() => { const timer = setTimeout(() => setTerm(search.trim().normalize('NFC')), 350); return () => clearTimeout(timer); }, [search]);
  const departments=useQuery({queryKey:['medical-departments'],queryFn:({signal})=>loadDepartments(signal),enabled:kind==='doctor',staleTime:300000});
  const department=departments.data?.find(item=>item.name_en===filter);
  const filters: ProviderFilters = { ...(kind === 'doctor' ? { department_id: department?.id, language: doctorLanguage === 'Hindi' ? 'hi' : doctorLanguage === 'English' ? 'en' : undefined } : kind === 'hospital' ? filter === 'NABH' ? { benefit: 'nabh' as const } : filter === 'All Care' ? {} : { type: filter } : {}), ...(city.trim() ? { city: city.trim() } : {}) };
  const query = useInfiniteQuery({ queryKey: ['care-directory', kind, term,filters], initialPageParam: 1, queryFn: ({ pageParam, signal }) => loadProviderPage(kind,term,pageParam,signal,filters), getNextPageParam: last => last.hasNext ? last.page + 1 : undefined, staleTime: 60000 });
  const items = useMemo(() => Array.from(new Map(query.data?.pages.flatMap(page => page.items).map(item => [item.id, item]) ?? []).values()).filter(item => kind==='doctor'||kind==='hospital'||filter === 'All Care' || `${item.details.providerType} ${item.details.specialties.join(' ')}`.toLowerCase().includes(filter.toLowerCase())), [query.data, filter,kind]);
  return <AppScreen scrollable={false} back={!!fixedKind}><FlatList data={items} keyExtractor={item => item.id} contentContainerStyle={{ padding: 16, paddingBottom: 32, width: '100%', maxWidth: 440, alignSelf: 'center' }} refreshing={query.isRefetching && !query.isFetchingNextPage} onRefresh={() => void query.refetch()} keyboardShouldPersistTaps="handled"
    ListHeaderComponent={<View style={{ gap: 14 }}>
      {!fixedKind && <View style={{ backgroundColor: design.mint, borderRadius: 24, padding: 20 }}>
        <DHeading title="Find Care" subtitle="Browse by provider type, or search for a name, area, or specialty." />
      </View>}
      {!fixedKind && <DTabs options={['Hospitals', 'Doctors', 'Blood']} value={kind === 'doctor' ? 'Doctors' : kind === 'hospital' ? 'Hospitals' : ''} onChange={value => { setFilter('All Care'); if (value === 'Blood') router.push('/blood-banks'); else router.setParams({ kind: value === 'Doctors' ? 'doctor' : 'hospital' }); }} />}
      <AppSearchBar value={search} onChange={setSearch} onSubmit={() => { if (search.trim()) void prefs.remember(search).catch(() => {}); }} label={`Search ${careLabels[kind].toLowerCase()}, area or specialty`} />
      {(kind === 'hospital' || kind === 'doctor') && <DAction label={filtersOpen ? 'Close filters' : 'Filters'} onPress={() => setFiltersOpen(value => !value)} />}
      {filtersOpen && <DCard><DField label="City" placeholder="All available cities" value={city} onChangeText={setCity} maxLength={80} />{kind === 'doctor' && <><DText kind="label">Consultation language</DText><DTabs options={['All languages', 'English', 'Hindi']} value={doctorLanguage} onChange={setDoctorLanguage} /></>}<DText>Filters apply to recorded provider information. Call to confirm current availability.</DText><DAction label="Clear filters" onPress={() => { setCity(''); setDoctorLanguage('All languages'); setFilter('All Care'); }} /></DCard>}
      {(kind === 'doctor' || kind === 'hospital') && <DTabs scroll options={kind==='doctor'?['All Care',...(departments.data??[]).map(item=>item.name_en)]:['All Care', 'Government', 'Private', 'NABH']} value={filter} onChange={setFilter} />}
      {kind==='doctor'&&departments.isError&&<DAction label="Retry departments" onPress={()=>void departments.refetch()}/>}
      {kind === 'hospital' && <DCard style={{ backgroundColor: '#D5EBE4' }}><View style={ds.row}><View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F5D7D9', alignItems: 'center', justifyContent: 'center' }}><AppIcon name="emergency" size={20} color="#BD3038" /></View><View style={{ flex: 1 }}><DText kind="title">Emergency Care</DText><DText kind="small">Get urgent help and ambulance contacts</DText></View></View><DAction filled label="Emergency Contacts" onPress={() => router.push('/emergency')} /></DCard>}
      <View style={ds.row}><DAction label="Saved care" onPress={() => router.push('/saved-care')} /><DAction label="Recent searches" onPress={() => router.push({ pathname: '/saved-care', params: { history: '1' } })} /></View><DHeading title={careLabels[kind]} subtitle="Directory information - call to confirm details" action="Open Maps" onPress={() => { void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${careLabels[kind]} near me`)}`).catch(() => {}); }} />
    </View>}
    renderItem={({ item }) => <ProviderCard entry={item} />}
    ListEmptyComponent={<ResourceState loading={query.isPending} error={query.isError} empty={term || filter !== 'All Care' || city ? 'No matching providers. Clear your search and filters to see all listed providers.' : 'No providers are currently listed. Pull to refresh after the directory is updated.'} onRetry={() => void query.refetch()} />}
    ListFooterComponent={<View style={{ gap: 20, marginTop: 20 }}>{query.hasNextPage && <DAction label={query.isFetchingNextPage ? 'Loading?' : 'Load More'} disabled={query.isFetchingNextPage} onPress={() => void query.fetchNextPage()} />}<DCard style={{ backgroundColor: design.pale }}><DHeading title="Healthcare directory" icon="shield" /><DText>Review provider details, services and contact information before your visit.</DText></DCard></View>} />
  </AppScreen>;
}
