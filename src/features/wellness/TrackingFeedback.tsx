import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../../components/app/AppIcon';
import { careStyles as c } from '../../components/app/CareUI';
import { colors } from '../../theme/tokens';

type Feedback = { message: string; tone: 'success' | 'error' | 'info' };
export function useTrackingFeedback() {
  const [feedback, update] = useState<Feedback | null>(null);
  const setFeedback = useCallback((message: string | null, tone: Feedback['tone'] = 'error') => update(message ? { message, tone } : null), []);
  return { feedback, setFeedback };
}
export function TrackingFeedback({ value }: { value: Feedback | null }) {
  if (!value) return null;
  const error = value.tone === 'error';
  return <View accessibilityRole={error ? 'alert' : undefined} accessibilityLiveRegion="polite" style={[s.feedback, error && { backgroundColor: colors.errorSurface }]}>
    <AppIcon name={value.tone === 'success' ? 'check' : error ? 'report' : 'bell'} color={error ? colors.error : colors.primary} size={21} />
    <Text style={[c.text, s.copy, { color: error ? colors.error : colors.ink }]}>{value.message}</Text>
  </View>;
}
const s = StyleSheet.create({ feedback: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: colors.subtle, padding: 14, borderRadius: 12, marginTop: 16 }, copy: { flex: 1 } });
