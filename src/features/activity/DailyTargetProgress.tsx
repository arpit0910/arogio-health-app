import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/tokens';
import { careStyles as c } from '../../components/app/CareUI';
export function DailyTargetProgress({ value, goal, unit }: { value: number | null; goal?: number; unit: string }) {
  if (!goal) return <Text style={s.small}>Daily target not set</Text>;
  const fraction = value == null ? 0 : Math.min(1, Math.max(0, value / goal));
  return <View style={{ gap: 6 }}>
    <Text style={s.small}>{value == null ? 'No reading yet' : value >= goal ? 'Target reached' : `${Math.max(0, goal - value).toLocaleString('en-IN', { maximumFractionDigits: 2 })} ${unit} to target`} - target {goal.toLocaleString('en-IN')} {unit}</Text>
    <View accessible accessibilityRole="progressbar" accessibilityLabel={`Daily target, ${unit}`} accessibilityValue={{ min: 0, max: goal, ...(value == null ? {} : { now: Math.min(value, goal) }), text: value == null ? 'No reading yet' : `${value} of ${goal} ${unit}` }} style={s.track}><View style={[s.fill, { width: `${fraction * 100}%` }]} /></View>
  </View>;
}
const s = StyleSheet.create({ small: { ...c.text, fontSize: 13, lineHeight: 20 }, track: { height: 7, borderRadius: 4, backgroundColor: colors.border, overflow: 'hidden' }, fill: { height: 7, borderRadius: 4, backgroundColor: colors.primary } });
