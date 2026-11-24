import { useCarePreferences } from './carePreferences';
import {loadProviderPage,loadDepartments, type ProviderFilters} from './providerCatalog';
import * as Location from 'expo-location';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Linking, Platform, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useInfiniteQuery,useQuery } from '@tanstack/react-query';
import { AppScreen } from '../../components/app/AppScreen';
import { DAction, DCard, DField, DHeading, DTabs, DText, design, ds } from '../../components/app/DesignUI';
import { AppIcon } from '../../components/app/AppIcon';
import { ProviderArtwork } from '../../components/app/ProviderArtwork';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { Button } from '../../components/ui/Button';
import { usePalette } from '../../theme/AppearanceProvider';
import { useTranslation } from '../../localization/LanguageProvider';
import { careKinds, careLabels, carePhone, careDirections, careRoute, type CareKind, type CareEntry } from './api';
import { AppSearchBar, ResourceState } from './CarePrimitives';

function ProviderCard({ entry }: { entry: CareEntry }) {
  const prefs = useCarePreferences(), router = useRouter(), colors = usePalette();
  const { language, t } = useTranslation();
  const [error, setError] = useState('');
  const name = (language === 'hi' && entry.nameHi) || entry.name;
  const address = (language === 'hi' && entry.addressHi) || entry.address;
  const contactable = entry.kind !== 'medicine';
  const phone = contactable ? carePhone(entry.phone) ?? carePhone(entry.alternatePhone ?? null) : null;
  const directions = contactable ? careDirections(entry) : null;
  const specialty = entry.details.specialties.slice(0, 3).join(' · ');
  const featured = entry.kind === 'hospital'
    ? [...(entry.details.open24Hours ? [t('Listed as 24 hours')] : []), ...(entry.details.benefits ?? []).map(t)].slice(0, 3)
    : [];
  const saved = prefs.data.saved.some((item) => item.id === entry.id && item.kind === entry.kind);

  async function open(url: string) {
    setError('');
    try { await Linking.openURL(url); }
    catch { setError('Could not open this action. View details for contact information.'); }
  }

  return (
    <DCard style={{ marginTop: 12, gap: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
      <TouchTarget
        accessibilityRole="button"
        accessibilityLabel={`${t('View details')}: ${name}`}
        onPress={() => router.push(careRoute(entry))}
        style={[ds.row, { gap: 12 }]}
      >
        <ProviderArtwork entry={entry} style={{ width: 64, height: 64, borderRadius: entry.kind === 'doctor' ? 32 : 12 }} />
        <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
          <DText kind="title" color={colors.ink}>{name}</DText>
          <DText kind="label" color={colors.primary}>{entry.details.providerType || specialty || careLabels[entry.kind]}</DText>
        </View>
        <AppIcon name="right" size={18} color={colors.muted} />
      </TouchTarget>
      {contactable && !!(address || entry.city) && (
        <View style={[ds.row, { alignItems: 'flex-start' }]}>
          <AppIcon name="location" size={18} color={colors.primary} />
          <DText style={{ flex: 1 }} color={colors.muted}>{address || entry.city}</DText>
        </View>
      )}
      {phone && <DText color={colors.muted}>{t('Phone: ')}{phone.slice(4)}</DText>}
      {entry.details.providerType && specialty ? <DText color={colors.muted}>{specialty}</DText> : null}
      {!!featured.length && <DText color={colors.muted}>{featured.join(' · ')}</DText>}
      {entry.details.consultationFee != null && (
        <DText color={colors.muted}>{`${t('Consultation fee')}: INR ${entry.details.consultationFee}`}</DText>
      )}
      {(phone || directions) && <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {phone && <View style={{ flexGrow: 1, flexBasis: 110 }}><Button title="Call" onPress={() => void open(phone)} /></View>}
        {directions && <View style={{ flexGrow: 1, flexBasis: 110 }}><Button title="Directions" variant="secondary" onPress={() => void open(directions)} /></View>}
      </View>}
      <TouchTarget
        accessibilityRole="button"
        disabled={prefs.isPending || prefs.isError}
        onPress={() => void prefs.toggle(entry.id, entry.kind).catch((issue) => setError(issue.message))}
        style={{ alignItems: 'center', justifyContent: 'center' }}
      >
        <DText kind="label" color={prefs.isPending || prefs.isError ? colors.muted : colors.primary}>{saved ? 'Remove from saved' : 'Save provider'}</DText>
      </TouchTarget>
      {!!error && <DText color={colors.error}>{error}</DText>}
    </DCard>
  );
}
export function CareSearchScreen({ fixedKind }: { fixedKind?: CareKind } = {}) {
  const prefs = useCarePreferences();
  const router = useRouter(), params = useLocalSearchParams<{ kind?: string; search?: string; nearby?: string }>();
  const kind = fixedKind ?? (careKinds.includes(params.kind as CareKind) ? params.kind as CareKind : 'hospital');
  const [search, setSearch] = useState(params.search ?? ''), [term, setTerm] = useState(params.search ?? ''), [filter, setFilter] = useState('All Care');
  const [filtersOpen, setFiltersOpen] = useState(params.nearby === '1'), [city, setCity] = useState(''), [doctorLanguage, setDoctorLanguage] = useState('All languages');
  useEffect(() => { const timer = setTimeout(() => setSearch(params.search ?? ''), 0); return () => clearTimeout(timer); }, [params.search]);
  useEffect(() => { const timer = setTimeout(() => setTerm(search.trim().normalize('NFC')), 350); return () => clearTimeout(timer); }, [search]);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const locationLock = useRef(false);
  async function locateCity() {
    if (locationLock.current) return;
    setFiltersOpen(true);
    setLocationError('');
    if (Platform.OS === 'web') { setLocationError('Enter your city to find local providers.'); return; }
    locationLock.current = true;
    setLocating(true);
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) { setLocationError('Location access is off. Enter your city below.'); return; }
      const cityName = await Promise.race([
        (async () => {
          const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          const [address] = await Location.reverseGeocodeAsync(position.coords);
          return address?.city || address?.subregion;
        })(),
        new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('Location timeout')), 12000); }),
      ]);
      if (!cityName) throw new Error('City unavailable');
      setCity(cityName);
    } catch {
      setLocationError('Could not find your city. Enter it below.');
    } finally {
      clearTimeout(timer);
      setLocating(false);
      locationLock.current = false;
    }
  }
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
      <AppSearchBar value={search} onChange={setSearch} onSubmit={() => { setTerm(search.trim().normalize('NFC')); if (search.trim()) void prefs.remember(search).catch(() => {}); }} label={`Search ${careLabels[kind].toLowerCase()}, area or specialty`} />
      {(kind === 'hospital' || kind === 'doctor') && <DAction label={filtersOpen ? 'Close filters' : 'Filters'} onPress={() => setFiltersOpen(value => !value)} />}
      {(kind === 'hospital' || kind === 'doctor') && <DAction filled label={locating ? 'Finding your city…' : 'Use my location'} disabled={locating} onPress={() => void locateCity()} />}
      {!!locationError && <DText>{locationError}</DText>}
      {filtersOpen && <DCard><DField label="City" placeholder="All available cities" value={city} onChangeText={setCity} maxLength={80} />{kind === 'doctor' && <><DText kind="label">Consultation language</DText><DTabs options={['All languages', 'English', 'Hindi']} value={doctorLanguage} onChange={setDoctorLanguage} /></>}<DText>Filters apply to recorded provider information. Call to confirm current availability.</DText><DAction label="Clear filters" onPress={() => { setCity(''); setDoctorLanguage('All languages'); setFilter('All Care'); }} /></DCard>}
      {(kind === 'doctor' || kind === 'hospital') && <DTabs scroll options={kind==='doctor'?['All Care',...(departments.data??[]).map(item=>item.name_en)]:['All Care', 'Government', 'Private', 'NABH']} value={filter} onChange={setFilter} />}
      {kind==='doctor'&&departments.isError&&<DAction label="Retry departments" onPress={()=>void departments.refetch()}/>}
      {kind === 'hospital' && <DCard style={{ backgroundColor: '#D5EBE4' }}><View style={ds.row}><View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F5D7D9', alignItems: 'center', justifyContent: 'center' }}><AppIcon name="emergency" size={20} color="#BD3038" /></View><View style={{ flex: 1 }}><DText kind="title">Emergency Care</DText><DText kind="small">Get urgent help and ambulance contacts</DText></View></View><DAction filled label="Emergency Contacts" onPress={() => router.push('/emergency')} /></DCard>}
      <View style={ds.row}><DAction label="Saved care" onPress={() => router.push('/saved-care')} /><DAction label="Recent searches" onPress={() => router.push({ pathname: '/saved-care', params: { history: '1' } })} /></View><DHeading title={careLabels[kind]} subtitle={city.trim() ? city.trim() : 'Directory information - call to confirm details'} action="Open Maps" onPress={() => { void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(city.trim() ? `${careLabels[kind]} in ${city.trim()}` : `${careLabels[kind]} near me`)}`).catch(() => {}); }} />
    </View>}
    renderItem={({ item }) => <ProviderCard entry={item} />}
    ListEmptyComponent={<ResourceState loading={query.isPending} error={query.isError} empty={term || filter !== 'All Care' || city ? 'No matching providers. Clear your search and filters to see all listed providers.' : 'No providers are currently listed. Pull to refresh after the directory is updated.'} onRetry={() => void query.refetch()} />}
    ListFooterComponent={<View style={{ gap: 20, marginTop: 20 }}>{query.hasNextPage && <DAction label={query.isFetchingNextPage ? 'Loading?' : 'Load More'} disabled={query.isFetchingNextPage} onPress={() => void query.fetchNextPage()} />}<DCard style={{ backgroundColor: design.pale }}><DHeading title="Healthcare directory" icon="shield" /><DText>Review provider details, services and contact information before your visit.</DText></DCard></View>} />
  </AppScreen>;
}
