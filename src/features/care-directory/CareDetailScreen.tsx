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
import { ProviderArtwork } from '../../components/app/ProviderArtwork';

export function CareDetailScreen({ fixedKind }: { fixedKind?: CareKind } = {}) {
  const prefs = useCarePreferences();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>(), c = useCareStyles(), colors = usePalette(), { t, language } = useTranslation();
  const [error, setError] = useState(''), [report, setReport] = useState(''), [busy, setBusy] = useState(false), [sent, setSent] = useState(false);
  const query = useQuery({ queryKey: ['care-detail', id,fixedKind], queryFn: ({ signal }) => loadProviderDetail(id??'',fixedKind,signal) });
  const entry = query.data && (!fixedKind || query.data.kind === fixedKind) ? query.data : undefined;
  async function open(url: string) { try { setError(''); await Linking.openURL(url); } catch { setError('This action could not open. Please try again.'); } }
  async function correction() { if (busy || !entry) return; setBusy(true); setError(''); try { await publicApi.request({ path: `/care/${entry.id}/corrections`, method: 'POST', body: { message: report.trim() } }); setSent(true); setReport(''); } catch { setError('Your report could not be sent. Please try again.'); } finally { setBusy(false); } }
  return <AppScreen back title={entry ? t(careLabels[entry.kind]) : t('Care details')} onRefresh={() => void query.refetch()} refreshing={query.isRefetching}>
    {!entry ? <ResourceState empty={query.data ? "This entry is not available in this directory. Open Find Care to choose the correct listing." : undefined} loading={query.isPending} error={query.isError} onRetry={() => void query.refetch()} /> : <View style={{ gap: 20 }}>
      <Button title={prefs.data.saved.some(x => x.id === entry.id && x.kind === entry.kind) ? 'Remove from saved' : 'Save provider'} variant="secondary" disabled={prefs.isPending || prefs.isError} onPress={() => void prefs.toggle(entry.id, entry.kind).catch(e => setError(e.message))} />
      <ProviderArtwork entry={entry} style={entry.kind==='doctor'?{width:160,height:160,borderRadius:80,alignSelf:'center'}:{width:'100%',height:180,borderRadius:20}} />
      <PageIntro title={language === 'hi' && entry.nameHi ? entry.nameHi : entry.name} description={entry.details.specialties.join(' · ') || entry.city} icon={entry.kind === 'medicine' ? 'pill' : 'heart'} />
      <Text style={c.text}>{language === 'hi' && entry.addressHi ? entry.addressHi : entry.address}</Text>
      {!!entry.details.qualifications && <Text style={c.text}>{t('Qualifications')}: {entry.details.qualifications}</Text>}
      {!!entry.details.registration && <Text style={c.text}>{t('Registration')}: {entry.details.registration}</Text>}
      {!!entry.details.medicalCouncil&&<Text style={c.text}>{t('Medical council')}: {entry.details.medicalCouncil}</Text>}
      {entry.details.experienceYears!=null&&<Text style={c.text}>{t('Experience')}: {entry.details.experienceYears} {t('years')}</Text>}
      {entry.details.consultationFee!=null&&<Text style={c.text}>{t('Consultation fee')}: INR {entry.details.consultationFee}</Text>}
      {!!entry.details.benefits?.length&&<Text style={c.text}>{entry.details.benefits.join(' / ')}</Text>}
      {!!entry.details.languages.length && <Text style={c.text}>{t('Languages')}: {entry.details.languages.join(', ')}</Text>}
      {!!entry.details.summary && <Text selectable style={c.text}>{language==='hi'&&entry.details.summaryHi?entry.details.summaryHi:entry.details.summary}</Text>}
      {!!entry.details.precautions && <><Text style={c.title}>{t('Precautions & limitations')}</Text><Text selectable style={c.text}>{entry.details.precautions}</Text></>}
      {entry.kind === 'medicine' ? <Text style={c.text}>{t('Medicine information is educational. Ask a qualified clinician or pharmacist about your treatment. This is separate from your personal reminders.')}</Text> : <>
        <Text style={c.text}>{t('Call to confirm services. This listing does not guarantee appointments, emergency availability or live bed status.')}</Text>
        {carePhone(entry.phone) ? <Button title={`${t('Call provider')} · ${entry.phone}`} onPress={() => void open(carePhone(entry.phone)!)} /> : <Text style={c.text}>{t('No telephone number listed.')}</Text>}
        {!!entry.address && <Button title={t('Open directions')} variant="secondary" onPress={() => void open(careDirections(entry))} />}
      </>}
      <View style={{ gap: 10, paddingVertical: 16, borderTopWidth: 1, borderColor: colors.border }}><Text style={c.title}>{t('Source & review')}</Text><Text style={c.text}>{entry.verification === 'source-reviewed' && entry.reviewedAt ? `${t('Source reviewed')}: ${new Date(entry.reviewedAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN')}` : t('Directory listing. Contact the provider to confirm details.')}</Text><Text selectable style={c.text}>{entry.sourceUrl}</Text>{!!entry.sourceUrl && <Button title={t('Open source')} variant="secondary" onPress={() => void open(entry.sourceUrl)} />}</View>
      <Button title={t('Share details')} variant="secondary" onPress={() => { void Share.share({ message: `${entry.name}\n${entry.address}\n${entry.phone ?? ''}\n${entry.sourceUrl}` }).catch(() => setError('Sharing could not open. Please try again.')); }} />
      {!!entry.recordedSchedules?.length&&<CareGroup title={t('Recorded practice hours')}><View style={{padding:16,gap:8}}><Text style={c.text}>{t('Contact the hospital to confirm these hours and appointment availability.')}</Text>{entry.recordedSchedules.map(schedule=><View key={schedule.hospitalId} style={{gap:6,paddingVertical:12}}><Text style={c.title}>{schedule.hospitalName}</Text><Text style={c.text}>{schedule.days.map(day=>t(['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][day])).join(', ')}{schedule.start&&schedule.end?` / ${schedule.start} - ${schedule.end}`:''}</Text><Text style={c.text}>{t(schedule.mode==='in_person'?'In person':schedule.mode==='online'?'Online':'Hybrid')}</Text>{!!schedule.availability&&<Text style={c.text}>{schedule.availability}</Text>}{schedule.fee!=null&&<Text style={c.text}>{t('Consultation fee')}: INR {schedule.fee}</Text>}</View>)}</View></CareGroup>}
      {entry.affiliationsUnavailable&&<View style={{gap:8}}><Text style={c.text}>{t('Affiliated providers could not all load.')}</Text><Button title={t('Retry')} variant="secondary" onPress={()=>void query.refetch()}/></View>}
      {entry.affiliations.length > 0 && <CareGroup title={entry.kind === 'doctor' ? 'Affiliated hospitals' : 'Affiliated doctors'}>{entry.affiliations.map(item => <CareRow key={item.id} icon="user" title={language === 'hi' && item.nameHi ? item.nameHi : item.name} detail={item.address} onPress={() => router.push(careRoute(item))} />)}</CareGroup>}
      <CareDisclosure title={t('Report incorrect information')}><Text style={c.text}>{t('Describe a directory correction only. Do not include medical records or personal health information.')}</Text>{sent ? <Text accessibilityLiveRegion="polite" style={c.text}>{t('Report received for review. It does not change the listing automatically.')}</Text> : <><TextInput accessibilityLabel={t('Directory correction')} multiline maxLength={1000} value={report} onChangeText={setReport} style={{ minHeight: 100, padding: 12, borderColor: colors.border, borderWidth: 1, color: colors.ink, borderRadius: 12 }} /><Button title={t('Send correction')} loading={busy} disabled={report.trim().length < 10} onPress={() => void correction()} /></>}</CareDisclosure>
      {!!error && <Text accessibilityRole="alert" style={[c.text, { color: colors.error }]}>{t(error)}</Text>}
    </View>}
  </AppScreen>;
}
