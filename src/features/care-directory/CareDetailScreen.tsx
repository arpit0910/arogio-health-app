import { AccessibleText as Text, AccessibleTextInput as TextInput } from '../../components/ui/AccessibleText';
import { useCarePreferences } from './carePreferences';
import {loadProviderDetail} from './providerCatalog';
import { useState } from 'react';
import { Linking, Share, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppScreen } from '../../components/app/AppScreen';
import { CareDisclosure, CareGroup, CareRow, useCareStyles } from '../../components/app/CareUI';
import { PageIntro } from '../../components/app/PageIntro';
import { Button } from '../../components/ui/Button';
import { usePalette } from '../../theme/AppearanceProvider';
import { useTranslation } from '../../localization/LanguageProvider';
import { careRoute, type CareKind, careDirections, careLabels, carePhone, publicApi } from './api';
import { ResourceState } from './CarePrimitives';
import { AppIcon } from '../../components/app/AppIcon';
import { ProviderArtwork } from '../../components/app/ProviderArtwork';

export function CareDetailScreen({ fixedKind }: { fixedKind?: CareKind } = {}) {
  const prefs = useCarePreferences();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>(), c = useCareStyles(), colors = usePalette(), { t, language } = useTranslation();
  const [error, setError] = useState(''), [report, setReport] = useState(''), [busy, setBusy] = useState(false), [sent, setSent] = useState(false);
  const query = useQuery({ queryKey: ['care-detail', id,fixedKind], queryFn: ({ signal }) => loadProviderDetail(id??'',fixedKind,signal) });
  const entry = query.data && (!fixedKind || query.data.kind === fixedKind) ? query.data : undefined;
  const name = (language === 'hi' && entry?.nameHi) || entry?.name;
  const address = (language === 'hi' && entry?.addressHi) || entry?.address;
  const contactNumbers = [...new Map(
    [entry?.phone, entry?.alternatePhone].flatMap((number) => {
      if (!number) return [];
      const url = carePhone(number);
      return url ? [[url, number] as const] : [];
    }),
  )];
  const directions = entry && careDirections(entry);
  const about = (language === 'hi' && entry?.details.summaryHi) || entry?.details.summary;
  const website = entry?.website && /^https:\/\/[^\s]+$/i.test(entry.website) ? entry.website : null;
  const hospitalFeatures = [...new Set([
    ...(entry?.details.open24Hours ? ['Listed as 24 hours'] : []),
    ...(entry?.details.benefits ?? []),
    ...(entry?.details.cashlessSchemes ?? []),
  ].filter((label) => label.trim()))];

  async function open(url: string) { try { setError(''); await Linking.openURL(url); } catch { setError('This action could not open. Please try again.'); } }
  async function correction() { if (busy || !entry) return; setBusy(true); setError(''); try { await publicApi.request({ path: `/care/${entry.id}/corrections`, method: 'POST', body: { message: report.trim() } }); setSent(true); setReport(''); } catch { setError('Your report could not be sent. Please try again.'); } finally { setBusy(false); } }
  return <AppScreen back title={entry ? t(careLabels[entry.kind]) : t('Care details')} onRefresh={() => void query.refetch()} refreshing={query.isRefetching}>
    {!entry ? <ResourceState empty={query.data ? "This entry is not available in this directory. Open Find Care to choose the correct listing." : undefined} loading={query.isPending} error={query.isError} onRetry={() => void query.refetch()} /> : <View style={{ gap: 20 }}>
      <ProviderArtwork entry={entry} style={entry.kind === 'doctor'
        ? { width: 144, height: 144, borderRadius: 72, alignSelf: 'center' }
        : { width: '100%', height: 180, borderRadius: 20 }} />
      <PageIntro
        title={name || entry.name}
        description={entry.details.providerType || (entry.kind === 'doctor' ? entry.details.specialties.join(' · ') : entry.city)}
        icon={entry.kind === 'medicine' ? 'pill' : entry.kind === 'hospital' ? 'medicalCase' : 'heart'}
      />
      {entry.kind !== 'medicine' && (
        <CareGroup title="Location & contact">
          <View style={{ paddingVertical: 16, gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <AppIcon name="location" size={20} color={colors.primary} />
              <Text selectable style={[c.text, { flex: 1 }]}>{address || entry.city || t('Address not listed')}</Text>
            </View>
            {contactNumbers.map(([url, number]) => (
              <View key={url} style={{ gap: 6 }}>
                <Text selectable style={c.text}>{t('Phone: ')}{number}</Text>
                <Button title={url === contactNumbers[0]?.[0] ? 'Call provider' : 'Call alternate number'} onPress={() => void open(url)} />
              </View>
            ))}
            {!contactNumbers.length && <Text style={c.text}>{t('No telephone number listed.')}</Text>}
            {directions && <Button title="Directions" variant="secondary" onPress={() => void open(directions)} />}
            {!!entry.email && <Text selectable style={c.text}>{t('Email address')}: {entry.email}</Text>}
            {website && <Button title="Open website" variant="secondary" onPress={() => void open(website)} />}
            {!!contactNumbers.length && <Text style={c.text}>{t('Call to confirm services and availability.')}</Text>}
          </View>
        </CareGroup>
      )}
      {entry.kind === 'hospital' && (entry.details.specialties.length > 0 || hospitalFeatures.length > 0) && (
        <CareGroup title="Services & facilities">
          <View style={{ paddingVertical: 16, gap: 12 }}>
            {!!entry.details.specialties.length && <View style={{ gap: 6 }}>
              <Text style={c.title}>{t('Specialties')}</Text>
              <Text style={c.text}>{entry.details.specialties.join(' · ')}</Text>
            </View>}
            {!!hospitalFeatures.length && <View style={{ gap: 6 }}>
              <Text style={c.title}>{t('Facilities & coverage')}</Text>
              {hospitalFeatures.map((feature) => <Text key={feature} style={c.text}>{t(feature)}</Text>)}
            </View>}
          </View>
        </CareGroup>
      )}
      {entry.kind === 'doctor' && (entry.details.qualifications || entry.details.registration || entry.details.medicalCouncil || entry.details.experienceYears != null || entry.details.consultationFee != null || entry.details.languages.length > 0) ? (
        <CareGroup title="Professional details">
          <View style={{ paddingVertical: 16, gap: 8 }}>
            {!!entry.details.qualifications && <Text style={c.text}>{t('Qualifications')}: {entry.details.qualifications}</Text>}
            {!!entry.details.registration && <Text style={c.text}>{t('Registration')}: {entry.details.registration}</Text>}
            {!!entry.details.medicalCouncil && <Text style={c.text}>{t('Medical council')}: {entry.details.medicalCouncil}</Text>}
            {entry.details.experienceYears != null && <Text style={c.text}>{t('Experience')}: {entry.details.experienceYears} {t('years')}</Text>}
            {entry.details.consultationFee != null && <Text style={c.text}>{t('Consultation fee')}: INR {entry.details.consultationFee}</Text>}
            {!!entry.details.languages.length && <Text style={c.text}>{t('Languages')}: {entry.details.languages.join(', ')}</Text>}
          </View>
        </CareGroup>
      ) : null}
      {!!about && <CareGroup title="About"><Text selectable style={[c.text, { paddingVertical: 16 }]}>{about}</Text></CareGroup>}
      {!!entry.details.precautions && <><Text style={c.title}>{t('Precautions & limitations')}</Text><Text selectable style={c.text}>{entry.details.precautions}</Text></>}
      {entry.kind === 'medicine' && <Text style={c.text}>{t('Medicine information is educational. Ask a qualified clinician or pharmacist about your treatment. This is separate from your personal reminders.')}</Text>}
      <Button title={prefs.data.saved.some(x => x.id === entry.id && x.kind === entry.kind) ? 'Remove from saved' : 'Save provider'} variant="secondary" disabled={prefs.isPending || prefs.isError} onPress={() => void prefs.toggle(entry.id, entry.kind).catch(e => setError(e.message))} />
      <Button title="Share details" variant="secondary" onPress={() => {
        const message = [name, address, ...contactNumbers.map(([, number]) => number)].filter(Boolean).join('\n');
        void Share.share({ message }).catch(() => setError('Sharing could not open. Please try again.'));
      }} />
      {!!entry.recordedSchedules?.length&&<CareGroup title={t('Recorded practice hours')}><View style={{padding:16,gap:8}}><Text style={c.text}>{t('Contact the hospital to confirm these hours and appointment availability.')}</Text>{entry.recordedSchedules.map(schedule=><View key={schedule.hospitalId} style={{gap:6,paddingVertical:12}}><Text style={c.title}>{schedule.hospitalName}</Text><Text style={c.text}>{schedule.days.map(day=>t(['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][day])).join(', ')}{schedule.start&&schedule.end?` / ${schedule.start} - ${schedule.end}`:''}</Text><Text style={c.text}>{t(schedule.mode==='in_person'?'In person':schedule.mode==='online'?'Online':'Hybrid')}</Text>{!!schedule.availability&&<Text style={c.text}>{schedule.availability}</Text>}{schedule.fee!=null&&<Text style={c.text}>{t('Consultation fee')}: INR {schedule.fee}</Text>}</View>)}</View></CareGroup>}
      {entry.affiliationsUnavailable&&<View style={{gap:8}}><Text style={c.text}>{t('Affiliated providers could not all load.')}</Text><Button title={t('Retry')} variant="secondary" onPress={()=>void query.refetch()}/></View>}
      {entry.affiliations.length > 0 && <CareGroup title={entry.kind === 'doctor' ? 'Affiliated hospitals' : 'Affiliated doctors'}>{entry.affiliations.map(item => <CareRow key={item.id} icon="user" title={language === 'hi' && item.nameHi ? item.nameHi : item.name} detail={item.address} onPress={() => router.push(careRoute(item))} />)}</CareGroup>}
      <CareDisclosure title={t('Report incorrect information')}><Text style={c.text}>{t('Describe a directory correction only. Do not include medical records or personal health information.')}</Text>{sent ? <Text accessibilityLiveRegion="polite" style={c.text}>{t('Report received for review. It does not change the listing automatically.')}</Text> : <><TextInput accessibilityLabel={t('Directory correction')} multiline maxLength={1000} value={report} onChangeText={setReport} style={{ minHeight: 100, padding: 12, borderColor: colors.border, borderWidth: 1, color: colors.ink, borderRadius: 12 }} /><Button title={t('Send correction')} loading={busy} disabled={report.trim().length < 10} onPress={() => void correction()} /></>}</CareDisclosure>
      {!!error && <Text accessibilityRole="alert" style={[c.text, { color: colors.error }]}>{t(error)}</Text>}
    </View>}
  </AppScreen>;
}
