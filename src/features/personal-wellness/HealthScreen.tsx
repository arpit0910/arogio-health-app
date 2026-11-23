import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppScreen } from '../../components/app/AppScreen';
import { AppIcon } from '../../components/app/AppIcon';
import { DAction, DCard, DHeading, DPill, DTabs, DText, design, ds } from '../../components/app/DesignUI';
import { FigmaAsset } from '../../components/app/FigmaAsset';
import { AppSearchBar, ResourceState } from '../care-directory/CarePrimitives';
import { carePageSchema, publicApi, careRoute } from '../care-directory/api';
import { useWellness } from './WellnessContext';
import { medicineSchedule } from './doseSchedule';
import { useTrackingClock } from './useTrackingClock';
import { formatClock } from '../../shared/date-time';

export function HealthScreen() {
  const router = useRouter(), { data, save, busy, error, refresh, loading } = useWellness(), now = useTrackingClock();
  const [search, setSearch] = useState(''), [tab, setTab] = useState('All Health');
  const schedule = medicineSchedule(data, now);
  const medicines = useQuery({ queryKey: ['health-medicine-library'], queryFn: async ({ signal }) => carePageSchema.parse(await publicApi.request({ path: '/care?kind=medicine&limit=6', signal })), staleTime: 60000 });
  const items = medicines.data?.items.filter(item => item.name.toLowerCase().includes(search.toLowerCase())) ?? [];
  const openLibrary = () => router.push({ pathname: '/medicine-library', params: { search } });
  const show = (group: string) => tab === 'All Health' || tab === group;
  return <AppScreen refreshing={loading} onRefresh={() => void refresh()}>
    <AppSearchBar value={search} onChange={setSearch} label="Search medicines, salt composition, guides..." />
    <View style={{ marginTop: 12 }}><DTabs scroll options={['All Health', 'Medicines A-Z', 'Doctor Guides', 'Nani Dadi Ke Nuskhe', 'Nutrition', 'Seasonal Alerts']} value={tab} onChange={setTab} /></View>
    <View style={{ gap: 24, marginTop: 18 }}>
      {show('Medicines A-Z') && <>
        <DCard><DHeading title="My Medicine Schedule" subtitle={`Today \u00b7 ${schedule.filter(row => !row.complete).length} doses remaining`} icon="pill" action="+ Add Reminder" onPress={() => router.push('/medicine-reminder')} />
          {!schedule.length && <DText>No medicines scheduled</DText>}
          {schedule.slice(0, 3).map(({ medicine, dose, complete, day }) => <View key={`${medicine.id}:${dose.time}`} style={{ padding: 12, borderRadius: 12, backgroundColor: complete ? design.pale : '#F8FAF8', gap: 8 }}><View style={ds.row}><AppIcon name={complete ? 'check' : 'pill'} color={design.green} size={20} /><View style={{ flex: 1 }}><DText kind="label">{medicine.name}</DText><DText kind="small">{`${formatClock(dose.time)} \u00b7 ${dose.amount}`}</DText></View><DPill>{complete ? 'Completed' : 'Scheduled'}</DPill></View>{!complete && <View style={{ alignItems: 'flex-end' }}><DAction filled label="Log Dose" disabled={busy} onPress={() => void save(`medicines/${medicine.id}/doses/${day}/${dose.time}`, { status: 'taken' })} /></View>}</View>)}
          {!!error && <DText color="#BD3038">{error}</DText>}
        </DCard>
        <DCard style={{ backgroundColor: '#E0F4E8', padding: 20 }}><DPill>PMBJP JAN AUSHADHI</DPill><DText kind="title" style={{ fontSize: 24, lineHeight: 31 }}>Save with Verified Generic Salts</DText><DText>Understand your prescription, find Jan Aushadhi alternatives, and learn safe dosage precautions.</DText><DAction filled label="Search Generic Medicines" onPress={openLibrary} /></DCard>
        <View style={{ gap: 12 }}><DHeading title="Popular Medicines" action="View all >" onPress={openLibrary} />
          {medicines.isPending || medicines.isError ? <ResourceState loading={medicines.isPending} error={medicines.isError} onRetry={() => void medicines.refetch()} /> : items.length === 0 ? <DText>No matching medicines</DText> : items.slice(0, 3).map(item => <DCard key={item.id}><View style={ds.row}><View style={{ flex: 1 }}><DText kind="title">{item.name}</DText><DText>{item.details.specialties.join(' ? ')}</DText></View><DPill>Salt Guide</DPill></View><View style={[ds.row, { borderTopWidth: 1, borderColor: design.border, paddingTop: 10 }]}><AppIcon name="shield" size={16} color={design.green} /><DText style={{ flex: 1 }}>Medicine information</DText><DAction label="Guide >" onPress={() => router.push(careRoute(item))} /></View></DCard>)}
        </View>
      </>}
      {(tab === 'Nutrition' || tab === 'Seasonal Alerts') && <DCard><DHeading title={tab} /><DText>Browse health articles for this topic.</DText><DAction label="Browse articles >" onPress={() => router.push({ pathname: '/articles', params: { search: tab === 'Nutrition' ? 'nutrition' : 'seasonal' } })} /></DCard>}
      {show('Doctor Guides') && <View style={{ gap: 12 }}><DHeading title="Medical Guides" subtitle="Health education and wellness guides" action="Browse >" onPress={() => router.push('/articles')} />
        <DCard style={{ padding: 0, overflow: 'hidden' }}><View style={{ height: 160, overflow: 'hidden' }}><FigmaAsset screen="1:570" name="@0" width={358} height={160} /></View><View style={{ padding: 16, gap: 8 }}><DPill>3 MIN READ \u00b7 CLINICAL GUIDE</DPill><DText kind="title">Heat Wave Advisory</DText><DText>Learn the difference between heat exhaustion and heatstroke.</DText><DAction label="Read guide >" onPress={() => router.push({ pathname: '/articles', params: { search: 'heat' } })} /></View></DCard>
        <DCard><View style={ds.row}><FigmaAsset screen="1:570" name="@1" width={80} height={80} /><View style={{ flex: 1, gap: 4 }}><DPill>Respiratory Health</DPill><DText kind="title">Seasonal respiratory care</DText><DAction label="Read guide >" onPress={() => router.push({ pathname: '/articles', params: { search: 'respiratory' } })} /></View></View></DCard>
      </View>}
      {show('Nani Dadi Ke Nuskhe') && <View style={{ gap: 12 }}><DHeading title="Nani Dadi Ke Nuskhe" subtitle="Time-tested Indian home remedies" />
        {[{ name: 'Adrak-Tulsi-Kaali Mirch Kadha', tag: 'Ayurveda', text: 'Traditional comfort for the winter season.' }, { name: 'Saunf & Mishri Infusion', tag: 'Summer Care', text: 'A traditional cooling drink for warm days.' }].map(item => <DCard key={item.name} style={{ backgroundColor: '#F8F4E9', padding: 20 }}><DPill>{item.tag}</DPill><DText kind="title">{item.name}</DText><DText>{item.text}</DText><DAction label="Explore remedy >" onPress={() => router.push({ pathname: '/articles', params: { search: item.name } })} /></DCard>)}
        <DAction label="Explore Traditional Remedies >" onPress={() => router.push({ pathname: '/articles', params: { search: 'traditional' } })} />
      </View>}
      <DCard style={{ backgroundColor: design.green }}><AppIcon name="medicalCase" size={28} color="#FFFFFF" /><DText kind="title" color="#FFFFFF">Jan Aushadhi Stores Nearby</DText><DText color="#D3EEE5">Find generic medicine centres</DText><DAction label="Find a Kendra >" onPress={() => router.push({ pathname: '/find-care', params: { kind: 'pharmacy' } })} /></DCard>
    </View>
  </AppScreen>;
}
