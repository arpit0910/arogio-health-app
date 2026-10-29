import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../auth/context/AuthContext';
import { AppScreen } from '../../../components/app/AppScreen';
import { AppIcon } from '../../../components/app/AppIcon';
import { useCareStyles } from '../../../components/app/CareUI';
import { TouchTarget } from '../../../components/ui/TouchTarget';
import { Button } from '../../../components/ui/Button';
import { usePalette } from '../../../theme/AppearanceProvider';
export function DeleteAccountScreen() {
  const { deleteAccount, isSubmitting } = useAuth(), c = useCareStyles(), colors = usePalette();
  const [confirmed, setConfirmed] = useState(false), [error, setError] = useState(''), lock = useRef(false);
  async function remove() {
    if (!confirmed || lock.current) return;
    lock.current = true; setError('');
    try { await deleteAccount(); router.replace('/login'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Account could not be deleted. Please try again.'); }
    finally { lock.current = false; }
  }
  return <AppScreen back title="Delete account"><View style={{ gap: 20, paddingTop: 12 }}>
    <AppIcon name="shield" size={36} />
    <Text accessibilityRole="header" style={c.heading}>Before you leave</Text>
    <Text style={c.text}>Your account will be deactivated and you’ll be signed out of all sessions. Arogio reminders on this device will stop.</Text>
    <View style={{ paddingVertical: 20, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border, gap: 12 }}><Text style={c.title}>30 days to change your mind</Text><Text style={c.text}>Sign in with your existing account within 30 days to restore your profile and records automatically. After 30 days, sign-in recovery is unavailable.</Text><Text style={c.text}>This is a soft deletion. Your basic details and saved records are retained; they are not permanently erased.</Text></View>
    <TouchTarget accessibilityRole="checkbox" accessibilityState={{ checked: confirmed, disabled: isSubmitting }} disabled={isSubmitting} onPress={() => setConfirmed(v => !v)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}><View style={{ width: 24, height: 24, borderWidth: 1, borderRadius: 5, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>{confirmed && <AppIcon name="check" size={20} />}</View><Text style={[c.text, { flex: 1, color: colors.ink }]}>I understand that signing in within 30 days restores my account, and I want to delete it.</Text></TouchTarget>
    {!!error && <Text accessibilityRole="alert" style={[c.text, { color: colors.error }]}>{error}</Text>}
    <Button title="Delete my account" variant="danger" disabled={!confirmed} loading={isSubmitting} onPress={() => void remove()} />
    <Button title="Keep my account" variant="secondary" disabled={isSubmitting} onPress={() => router.canGoBack() ? router.back() : router.replace('/profile')} />
  </View></AppScreen>;
}
