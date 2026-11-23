import { useRef, useState } from 'react';
import { Alert, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Crypto from 'expo-crypto';
import { AppScreen } from '../../components/app/AppScreen';
import { DAction, DCard, DField, DHeading, DTabs, DText } from '../../components/app/DesignUI';
import { useTranslation } from '../../localization/LanguageProvider';
import { CalendarField } from '../personal-wellness/CalendarField';
import { localDay } from '../personal-wellness/domain';
import { ResourceState } from '../care-directory/CarePrimitives';
import { recordKinds, type HealthRecord } from './model';
import { openRecord, readPickedRecord, recordsAvailable } from './storage';
import { useHealthRecords } from './useHealthRecords';

export function HealthRecordsScreen() {
  const records = useHealthRecords(), { t, language } = useTranslation();
  const [draft, setDraft] = useState<{ record: HealthRecord; uri: string } | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const lock = useRef(false), [removeId, setRemoveId] = useState<string | null>(null);
  async function action(work: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try { await work(); } catch (e) { setError(e instanceof Error ? e.message : 'This change could not be saved. Try again.'); }
    finally { lock.current = false; setBusy(false); }
  }
  async function choose() {
    await action(async () => {
      const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'], copyToCacheDirectory: true, multiple: false });
      if (result.canceled) return;
      const picked = result.assets[0], metadata = await readPickedRecord(picked.uri);
      setDraft({ uri: picked.uri, record: { id: Crypto.randomUUID(), title: picked.name.replace(/\.[^.]+$/, '').slice(0, 100), name: picked.name.slice(0, 150), kind: 'Lab report', day: localDay(), notes: '', ...metadata, createdAt: new Date().toISOString() } });
    });
  }
  const update = (patch: Partial<HealthRecord>) => setDraft(value => value ? { ...value, record: { ...value.record, ...patch } } : null);
  function confirmRemove(record: HealthRecord) { setRemoveId(record.id); }
  return <AppScreen back title="EHR records" refreshing={records.isRefetching} onRefresh={() => void records.refetch()}><View style={{ gap: 18 }}>
    <DHeading title="Your health records" />
    <DText>Keep reports, prescriptions and discharge documents together. These records stay on this phone for your account. They are not uploaded, sent to Jeeva or linked to ABHA. Uninstalling the app removes them.</DText>
    {!recordsAvailable ? <DText>Document records are available in the Android and iPhone app.</DText> : <>
      {!draft && <DAction filled label="Add PDF or photo" disabled={busy || records.isPending || records.isError || (records.data?.length ?? 0) >= 25} onPress={() => void choose()} />}
      <DText kind="small">PDF, JPG, PNG or WebP · Up to 20 MB each · 25 records per account</DText>
    </>}
    {!!error && <DText color="#BD3038">{error}</DText>}
    {draft && <DCard>
      <DHeading title="Save this document" /><DText>{draft.record.name}</DText>
      <DField label="Record title" value={draft.record.title} maxLength={100} onChangeText={title => update({ title })} />
      <DTabs scroll options={[...recordKinds]} value={draft.record.kind} onChange={kind => update({ kind: kind as HealthRecord['kind'] })} />
      <CalendarField label="Document date" mode="date" value={draft.record.day} onChange={day => update({ day })} />
      <DField label="Notes (optional)" value={draft.record.notes} maxLength={300} multiline onChangeText={notes => update({ notes })} />
      <DAction filled label={busy ? 'Saving...' : 'Save record'} disabled={busy || !draft.record.title.trim()} onPress={() => void action(async () => { await records.add(draft.record, draft.uri); setDraft(null); })} />
      <DAction label="Cancel" disabled={busy} onPress={() => { setDraft(null); setError(''); }} />
    </DCard>}
    <ResourceState loading={records.isPending} error={records.isError} onRetry={() => void records.refetch()} empty={!records.isPending && !records.isError && !records.data?.length ? 'No health records yet. Add a report or prescription to get started.' : undefined} />
    {records.data?.map(record => <DCard key={record.id}>
      <DHeading title={record.title} subtitle={`${t(record.kind)} · ${new Date(`${record.day}T12:00:00Z`).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { dateStyle: 'medium', timeZone: 'UTC' })}`} />
      {!!record.notes && <DText>{record.notes}</DText>}
      <DText kind="small">{`${record.name} · ${(record.size / 1024 / 1024).toFixed(1)} MB`}</DText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <DAction label="Open document" disabled={busy} onPress={() => void action(() => openRecord(records.owner!, record))} />
        <DAction label="Share document" disabled={busy} onPress={() => Alert.alert(t('Share health document?'), t('Only share with a person or service you trust.'), [{ text: t('Cancel'), style: 'cancel' }, { text: t('Share'), onPress: () => void action(() => openRecord(records.owner!, record, true)) }])} />
        <DAction label="Delete record" disabled={busy} onPress={() => confirmRemove(record)} />
      </View>
      {removeId === record.id && <View style={{ gap: 12 }}><DText>Delete this record and its saved file from this phone? Copies you already shared are not removed.</DText><DAction filled label="Confirm delete" disabled={busy} onPress={() => void action(async () => { await records.remove(record.id); setRemoveId(null); })} /><DAction label="Keep record" disabled={busy} onPress={() => setRemoveId(null)} /></View>}
    </DCard>)}
  </View></AppScreen>;
}
