import { useState } from 'react';
import { Text, View } from 'react-native';
import * as Crypto from 'expo-crypto';
import { AppScreen } from '../../components/app/AppScreen';
import { useCareStyles } from '../../components/app/CareUI';
import { Button } from '../../components/ui/Button';
import { TrackingIntro } from './TrackingVisuals';
import { TrackingFeedback, useTrackingFeedback } from './TrackingFeedback';
import { AppIcon } from '../../components/app/AppIcon';
import { useWellness } from './WellnessContext';
import { type Medicine } from './domain';
import { Check, Field, Group, TrackingStatus, confirmDelete, useTrackingStyles } from './TrackingUI';
import { TimeField } from './TimeField';
import { requestReminderPermission } from './notifications';
import { formatClock } from '../../lib/time';

export function MedicineScreen() {
  const c = useCareStyles();
  const s = useTrackingStyles();

  const { data, loading, busy, save, notice } = useWellness();
  const [draft, setDraft] = useState<Medicine | null>(null);
  const { feedback, setFeedback } = useTrackingFeedback();
  const [submitting, setSubmitting] = useState(false);
  const medicines = data.medicines ?? [];
  const change = (patch: Partial<Medicine>) => setDraft(current => current ? { ...current, ...patch } : null);
  async function submit() {
    if (!draft || submitting || busy) return;
    if (!draft.name.trim() || draft.doses.some(d => !d.amount.trim()) || new Set(draft.doses.map(d => d.time)).size !== draft.doses.length) {
      setFeedback('Enter a medicine name and an amount for every dose. Each dose needs a different time.'); return;
    }
    setSubmitting(true);
    try {
      const enabled = draft.enabled && await requestReminderPermission(false);
      const { id, ...body } = draft;
      if (await save(`medicines/${id}`, { ...body, enabled })) { setDraft(null); setFeedback(draft.enabled && !enabled ? 'Medicine saved. Notifications are off; dose times are still kept in Arogio.' : enabled ? 'Medicine saved. Daily reminders follow your dose times.' : 'Medicine saved. Reminders are off.', draft.enabled && !enabled ? 'info' : 'success'); }
    } catch {
      setFeedback('Unable to check notification permissions. Try again, or save with reminders turned off.');
    } finally { setSubmitting(false); }

  }
  return <AppScreen back title="Medicine reminders"><TrackingIntro name="medicine" title="Medicines" description="Keep each medicine and its daily doses together. All times use IST." /><TrackingStatus />
    <TrackingFeedback value={feedback} />
    {!draft && !loading && <>
      {medicines.length === 0 && <View style={s.panel}><Text style={c.title}>No medicines saved</Text><Text style={c.text}>Add a medicine, then set a time and amount for each dose. You can pause or edit it anytime.</Text></View>}
      <Group title="Your medicines">{medicines.map(m => <View key={m.id} style={s.row}><Text style={c.title}>{m.name}</Text><Text style={c.text}>{m.enabled ? 'Daily reminders on' : 'Reminders paused'}</Text>{[...m.doses].sort((a,b) => a.time.localeCompare(b.time)).map(d => <View key={d.time} style={[s.inline, { alignItems: 'center', gap: 8 }]}><AppIcon name="clock" size={18} /><Text style={c.text}>{formatClock(d.time)}</Text><Text style={c.text}>{d.amount}</Text></View>)}{!!m.notes && <Text style={c.text}>{m.notes}</Text>}<Button title={`Edit ${m.name}`} variant="secondary" disabled={busy} onPress={() => { setFeedback(''); setDraft({ ...m, doses: m.doses.map(d => ({ ...d })) }); }} /></View>)}<Button title="Add a medicine" disabled={busy || medicines.length >= 30} onPress={() => {setFeedback(''); setDraft({ id: Crypto.randomUUID(), name: '', notes: '', enabled: true, doses: [{ time: '08:00', amount: '' }] });}} /></Group>
    </>}
    {draft && <Group title={medicines.some(m => m.id === draft.id) ? 'Edit medicine' : 'Add medicine'}>
      <Field label="Medicine name" icon="pill" placeholder="e.g. Vitamin D" value={draft.name} onChange={name => change({ name })} />
      <Text style={c.text}>Enter the dose amounts and times from your prescription or care instructions.</Text>
      {draft.doses.map((dose, index) => <View key={index} style={s.row}><Text style={c.title}>Dose {index + 1}</Text><Field label={`Dose ${index + 1} amount`} placeholder="e.g. 1 tablet or 5 ml" icon="pill" value={dose.amount} onChange={amount => change({ doses: draft.doses.map((d,i) => i === index ? { ...d, amount } : d) })} /><TimeField label={`Dose ${index + 1} time`} value={dose.time} onChange={time => change({ doses: draft.doses.map((d,i) => i === index ? { ...d, time } : d) })} />{draft.doses.length > 1 && <Button title={`Remove dose ${index + 1}`} variant="secondary" onPress={() => change({ doses: draft.doses.filter((_,i) => i !== index) })} />}</View>)}
      <Button title="Add another dose time" variant="secondary" disabled={draft.doses.length >= 12} onPress={() => change({ doses: [...draft.doses, { time: '20:00', amount: '' }] })} />
      <Field label="Instructions (optional)" placeholder="e.g. After breakfast" icon="report" multiline value={draft.notes} onChange={notes => change({ notes })} />
      <Check label="Send daily dose reminders" checked={draft.enabled} disabled={busy} onChange={() => change({ enabled: !draft.enabled })} />
      <Button title="Save medicine" loading={busy || submitting} onPress={() => void submit()} /><Button title="Cancel" variant="secondary" disabled={busy || submitting} onPress={() => {setDraft(null);setFeedback('');}} />
      {medicines.some(m => m.id === draft.id) && <Button title="Delete medicine" variant="danger" disabled={busy} onPress={() => confirmDelete('Delete medicine?', 'This removes the medicine and its future reminders.', () => void (async () => { if (await save(`medicines/${draft.id}`, undefined, 'DELETE')) {setDraft(null);setFeedback('Medicine deleted.', 'success');} })())} />}
    </Group>}
    {!!notice && <Text style={[c.text,c.section]}>{notice}</Text>}<Text style={[c.text,c.section]}>Device reminders are scheduled ahead. Reopen Arogio regularly to keep upcoming reminders scheduled.</Text>
  </AppScreen>;
}
