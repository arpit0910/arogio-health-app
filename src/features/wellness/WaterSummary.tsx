import { usePalette } from '../../theme/AppearanceProvider';
import { useId } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { ClipPath, Defs, Path, Rect, Line, Text as SvgText } from 'react-native-svg';
import { useCareStyles } from '../../components/app/CareUI';
import { fonts } from '../../theme/tokens';
import { addDays, type WaterLog } from './domain';

export function WaterSummary({ total, target, done, tasks }: { total: number; target: number; done: number; tasks: number }) {
  const c = useCareStyles();
  const colors = usePalette();
  const s = useStyles();

  const clip = useId().replace(/[^a-zA-Z0-9]/g, '');
  const fraction = Math.min(1, Math.max(0, total / Math.max(1, target)));
  return <View style={s.summary}>
    <View accessible accessibilityRole="progressbar" accessibilityLabel="Water logged toward your target" accessibilityValue={{ min: 0, max: target, now: Math.min(total, target), text: `${total} of ${target} millilitres logged` }} style={s.glass}>
      <Svg width={66} height={94} viewBox="0 0 66 94">
        <Defs><ClipPath id={clip}><Path d="M12 12H54L48 83H18Z" /></ClipPath></Defs>
        <Path d="M12 12H54L48 83H18Z" fill={colors.surface} />
        <Rect x={10} y={83 - fraction * 71} width={46} height={fraction * 71} fill={colors.primary} clipPath={`url(#${clip})`} />
        <Path d="M12 12H54L48 83H18ZM43 30H50M42 48H49M40 66H48" fill="none" stroke={colors.ink} strokeWidth={2} strokeLinejoin="round" />
      </Svg>
    </View>
    <View style={s.copy}><Text style={c.title}>Your water today</Text><Text style={s.amount}>{total.toLocaleString('en-IN')} <Text style={s.unit}>/ {target.toLocaleString('en-IN')} ml</Text></Text><Text style={c.text}>{total >= target ? 'Your target is complete.' : `${(target - total).toLocaleString('en-IN')} ml to your target`}</Text><Text style={s.small}>{done} of {tasks} drinking tasks logged</Text></View>
  </View>;
}
export function WaterHistory({ logs, day }: { logs: WaterLog[]; day: string }) {
  const colors = usePalette();
  const s = useStyles();

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(day, index - 6);
    return { date, value: logs.filter((log) => log.day === date).reduce((sum, log) => sum + log.amountMl, 0) };
  });
  const max = Math.max(100, ...days.map((item) => item.value)) * 1.1;
  return <View accessible accessibilityRole="image" accessibilityLabel={`Logged water for the last seven waking days. ${days.map((item) => `${item.date}: ${item.value} millilitres`).join('; ')}`} style={{ gap: 8 }}>
    <Svg width="100%" height={180} viewBox="0 0 336 180" fontFamily={fonts.regular}>
      {[0, 0.5, 1].map((part) => <Line key={part} x1={12} x2={324} y1={140 - 110 * part} y2={140 - 110 * part} stroke={colors.border} />)}
      {days.map((item, index) => <Rect key={item.date} x={23 + index * 44} y={140 - item.value / max * 110 - (item.value === 0 ? 2 : 0)} width={24} height={Math.max(2, item.value / max * 110)} rx={3} fill={index === 6 ? colors.accent : colors.primary} />)}
      {days.map((item, index) => <SvgText key={item.date} x={35 + index * 44} y={162} fill={colors.muted} fontSize={12} textAnchor="middle">{new Intl.DateTimeFormat('en-IN', { weekday: 'short', timeZone: 'Asia/Kolkata' }).format(new Date(`${item.date}T12:00:00Z`))}</SvgText>)}
      {days.map((item, index) => <SvgText key={item.date} x={35 + index * 44} y={Math.max(16, 132 - item.value / max * 110)} fill={colors.ink} fontSize={11} textAnchor="middle">{item.value}</SvgText>)}
    </Svg>
    <Text style={s.small}>Your saved logs in ml. No logs appear as zero; today is still in progress.</Text>
  </View>;
}
const useStyles = () => {
  const c = useCareStyles();
  const colors = usePalette();
return StyleSheet.create({
  summary: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 16, padding: 20, backgroundColor: colors.subtle, borderRadius: 16, marginTop: 24 },
  glass: { width: 66, alignItems: 'center' }, copy: { flex: 1, minWidth: 160, gap: 5 },
  amount: { fontFamily: fonts.semibold, fontSize: 26, lineHeight: 36, color: colors.ink, fontVariant: ['tabular-nums'] },
  unit: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23, color: colors.muted },
  small: { ...c.text, fontSize: 13, lineHeight: 20 },
});
};
