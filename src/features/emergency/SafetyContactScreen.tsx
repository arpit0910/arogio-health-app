import { useState } from 'react';
import { Linking, View } from 'react-native';
import { AppScreen } from '../../components/app/AppScreen';
import { DAction, DCard, DField, DText } from '../../components/app/DesignUI';
import { useSafetyContact, type SafetyContact } from './safetyContact';
import { ResourceState } from '../care-directory/CarePrimitives';
export function SafetyContactScreen() {
  const contact = useSafetyContact();
  return <AppScreen back title="SOS contact">{contact.isPending || contact.isError ? <ResourceState loading={contact.isPending} error={contact.isError} onRetry={() => void contact.refetch()} /> : <ContactForm key={JSON.stringify(contact.data)} current={contact.data ?? null} save={contact.save} />}</AppScreen>;
}
function ContactForm({ current, save }: { current: SafetyContact | null; save: (value: SafetyContact | null) => Promise<void> }) {
  const [name, setName] = useState(current?.name ?? ''), [phone, setPhone] = useState(current?.phone ?? ''), [busy, setBusy] = useState(false), [error, setError] = useState(''), [saved, setSaved] = useState(false);
  async function store(remove = false) {
    if (busy) return;
    const clean = phone.replace(/[ ()-]/g, '');
    if (!remove && (!name.trim() || !/^\+?\d{6,15}$/.test(clean))) { setError('Enter a contact name and a valid phone number.'); return; }
    setBusy(true); setError('');
    try { await save(remove ? null : { name: name.trim().slice(0, 80), phone: clean }); setSaved(true); }
    catch { setError('Contact could not be saved. Try again.'); }
    finally { setBusy(false); }
  }
  return <View style={{ gap: 16 }}><DText>Save a trusted person on this device for your account. Ask them before adding their number. Arogio does not monitor emergencies, relay dispatches or send automatic messages.</DText>{saved && <DText>Contact saved.</DText>}<DField label="Contact name" maxLength={80} value={name} onChangeText={setName} /><DField label="Phone number" maxLength={20} keyboardType="phone-pad" value={phone} onChangeText={setPhone} /><DAction filled label={busy ? 'Saving…' : 'Save contact'} disabled={busy} onPress={() => void store()} />{current && <DCard><DText kind="title">{current.name}</DText><DText>{current.phone}</DText><DAction label="Open phone dialer" onPress={() => void Linking.openURL(`tel:${current.phone}`).catch(() => setError('The dialer could not open. Dial the number on your phone.'))} /><DAction label="Remove contact" disabled={busy} onPress={() => void store(true)} /></DCard>}{!!error && <DText color="#BD3038">{error}</DText>}</View>;
}
