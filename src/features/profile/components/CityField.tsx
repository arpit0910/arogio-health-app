import { useTranslation } from "../../../localization/LanguageProvider";
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { ProfileInput } from './ProfileInput';
import { useCareStyles } from '../../../components/app/CareUI';
import { TouchTarget } from '../../../components/ui/TouchTarget';
import { usePalette } from '../../../theme/AppearanceProvider';
export function CityField({ value, onChange, disabled, autoDetect }: { value: string; onChange: (value: string) => void; disabled: boolean; autoDetect: boolean }) {
  const { t: tr } = useTranslation();
  const c = useCareStyles(), colors = usePalette(), [busy, setBusy] = useState(false), [message, setMessage] = useState('We use location once to find your city. You can also enter it yourself.');
  const lock = useRef(false), alive = useRef(true), edited = useRef(false);
  const initial = useRef(autoDetect && !value);
  const detect = useCallback(async () => {
    if (lock.current || disabled) return;
    lock.current = true; edited.current = false; setBusy(true);
    try {
      if (Platform.OS === 'web') throw new Error('Enter your city below. City detection is available in the mobile app.');
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) throw new Error('Location is off. You can still enter your city and continue.');
      const position = await Promise.race([Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }), new Promise<never>((_, reject) => setTimeout(() => reject(new Error('City detection took too long. Try again or enter your city.')), 15000))]);
      const [address] = await Location.reverseGeocodeAsync(position.coords);
      const city = address?.city || address?.subregion || address?.district;
      if (!city) throw new Error('Your city could not be found. Please enter it below.');
      if (alive.current && !edited.current) { onChange(city); setMessage('City found. Check it below; only your city is saved.'); }
    } catch (error) { if (alive.current) setMessage(error instanceof Error ? error.message : 'Could not find your city. Enter it below.'); }
    finally { lock.current = false; if (alive.current) setBusy(false); }
  }, [disabled, onChange]);
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);
  useEffect(() => { if (initial.current) { initial.current = false; void detect(); } }, [detect]);
  return <View style={{ gap: 10, marginTop: 12 }}><Text style={c.title}>{tr("Your city")}</Text><Text style={c.text}>{tr(message)}</Text><ProfileInput label={tr("City")} icon="location" value={value} placeholder={tr("Enter your city")} maxLength={100} editable={!disabled} onChangeText={next => { edited.current = true; onChange(next); }} /><TouchTarget accessibilityRole="button" disabled={busy || disabled} accessibilityState={{ busy, disabled: busy || disabled }} onPress={() => void detect()} style={{ paddingVertical: 10 }}><Text style={[c.text, { color: colors.primary }]}>{tr(busy ? 'Finding your city...' : 'Use my location')}</Text></TouchTarget></View>;
}
