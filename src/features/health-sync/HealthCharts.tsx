import { TouchTarget } from '../../components/ui/TouchTarget';
import { usePalette, useAppearance } from '../../theme/AppearanceProvider';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { G as PathGroup, Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { fonts } from '../../theme/tokens';
import { useCareStyles } from '../../components/app/CareUI';
import { formatHealthValue, healthMetrics, type HealthMetric, type HealthSnapshot } from './model';


function dayLabel(day: string) {
  return new Intl.DateTimeFormat('en-IN', { weekday: 'short', timeZone: 'Asia/Kolkata' }).format(new Date(`${day}T12:00:00Z`));
}
export function HealthChart({ snapshot, metric, emptyMessage, selectedDay, onSelectDay }: { snapshot: HealthSnapshot; metric: HealthMetric; emptyMessage?: string; selectedDay?: string; onSelectDay?: (day: string) => void }) {
  const colors = usePalette(), c = useCareStyles(), s = useStyles();
  const info = healthMetrics.find(item => item.key === metric)!;
  const values = snapshot.days.map(day => day.readings[metric]?.value ?? null);
  const finite = values.filter((value): value is number => value != null && Number.isFinite(value));
  if (!finite.length) return <View style={{ backgroundColor: colors.subtle, borderRadius: 12, padding: 20, gap: 10 }}><Text style={c.title}>No readings in these 7 days</Text><Text style={c.text}>{emptyMessage ?? `Check that ${info.title.toLowerCase()} is recorded in your source app and shared through Health Connect. Missing readings are never counted as zero.`}</Text></View>;
  const max = Math.max(...finite, 1) * 1.16;
  const isLine = ['HeartRate', 'RestingHeartRate', 'Weight'].includes(metric);
  const x = (i: number) => 68 + i * 40;
  const y = (value: number) => 160 - Math.max(0, value) / max * 128;
  const summary = snapshot.days.map((day, i) => `${day.day}: ${formatHealthValue(metric, values[i])} ${values[i] == null || metric === 'SleepSession' ? '' : info.unit}`).join('; ');
  return <View style={{ gap: 12 }}>
    <View accessible accessibilityRole="image" accessibilityLabel={`${info.title}, last 7 days. ${summary}`}>
      <Svg fontFamily={fonts.regular} width="100%" height={190} viewBox="0 0 336 190" accessible={false}>
        {snapshot.days.map((day, i) => selectedDay === day.day ? <Rect key={day.day} x={x(i) - 17} y={16} width={34} height={148} rx={8} fill={colors.subtle} /> : null)}
        {[0, 0.5, 1].map(part => <ViewlessGrid key={part} at={y(max * part)} label={formatHealthValue(metric, max * part)} />)}
        {snapshot.days.map((day, i) => {
          const value = values[i], previous = values[i - 1], selected = selectedDay === day.day;
          return <PathGroup key={day.day}>
            {value != null && isLine && previous != null && <Line x1={x(i - 1)} y1={y(previous)} x2={x(i)} y2={y(value)} stroke={colors.primary} strokeWidth={2.5} />}
            {value != null && (isLine ? <Circle cx={x(i)} cy={y(value)} r={selected ? 6 : 4} fill={selected ? colors.accent : colors.primary} stroke={colors.surface} strokeWidth={2} /> : <Rect x={x(i) - 10} y={y(value) - (value === 0 ? 2 : 0)} width={20} height={value === 0 ? 2 : 160 - y(value)} rx={5} fill={selected ? colors.accent : colors.primary} />)}
            {value == null && <SvgText x={x(i)} y={152} textAnchor="middle" fontSize={14} fill={colors.muted}>?</SvgText>}
            <SvgText x={x(i)} y={182} textAnchor="middle" fontSize={11} fill={colors.muted}>{dayLabel(day.day)}</SvgText>
          </PathGroup>;
        })}
      </Svg>
    </View>
    {onSelectDay && <ScrollView horizontal showsHorizontalScrollIndicator accessibilityRole="radiogroup" accessibilityLabel="Day to inspect" contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>{snapshot.days.map((day, i) => <TouchTarget key={day.day} accessibilityRole="radio" accessibilityLabel={`${day.day}, ${formatHealthValue(metric, values[i])}${values[i] != null && metric !== 'SleepSession' ? ` ${info.unit}` : ''}`} accessibilityState={{ checked: selectedDay === day.day }} onPress={() => onSelectDay(day.day)} style={{ minWidth: 48, padding: 10, minHeight: 60, alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 10, borderWidth: 1, borderColor: selectedDay === day.day ? colors.primary : colors.border, backgroundColor: selectedDay === day.day ? colors.subtle : colors.surface }}><Text style={[s.small, { color: colors.ink }]}>{dayLabel(day.day)}</Text><Text style={[s.label, { color: selectedDay === day.day ? colors.primary : colors.muted }]}>{Number(day.day.slice(-2))}</Text></TouchTarget>)}</ScrollView>}
    <Text style={s.small}>{isLine ? 'Points show daily averages.' : 'Bars show daily totals.'} Gaps mean no data. Today is still in progress.</Text>
  </View>;
}
// SVG groups keep every plotted mark in the same coordinate space.
function ViewlessGrid({ at, label }: { at: number; label: string }) {
  const colors = usePalette();

  return <PathGroup><Line x1={46} x2={324} y1={at} y2={at} stroke={colors.border} /><SvgText x={40} y={at + 4} textAnchor="end" fill={colors.muted} fontSize={10}>{label}</SvgText></PathGroup>;
}
export function WeeklyShare({ snapshot, metric }: { snapshot: HealthSnapshot; metric: HealthMetric }) {
  const { scheme } = useAppearance();
  const palette = scheme === 'dark' ? ['#86C6A4', '#E0A7AF', '#94BED8', '#DDBD82', '#B7CB8E', '#C4ADD2', '#CDB8A6'] : ['#214F3D', '#7B3D45', '#426E8A', '#8A601F', '#536632', '#765A80', '#67594B'];
  const colors = usePalette();
  const s = useStyles();

  if (['HeartRate', 'RestingHeartRate', 'Weight', 'SleepSession'].includes(metric)) return null;
  const info = healthMetrics.find((item) => item.key === metric)!;
  const slices = snapshot.days.map((day, i) => ({ day: day.day, value: day.readings[metric]?.value, color: palette[i % palette.length] }));
  const total = slices.reduce((sum, item) => sum + Math.max(0, item.value ?? 0), 0);
  if (!total) return null;
  return <View style={s.share}>
    <Text style={s.label}>How your week adds up</Text>
    <Text style={s.small}>{formatHealthValue(metric, total)} {info.unit} across recorded days. Each slice is one day’s share.</Text>
    <View style={s.shareBody}>
      <Svg width={136} height={136} viewBox="0 0 136 136" accessibilityRole="image" accessibilityLabel={`${info.title} by day: ${slices.filter((item) => item.value != null).map((item) => `${item.day}, ${Math.round((item.value ?? 0) / total * 100)} percent`).join('; ')}`}>
        {slices.map((item, index) => {
          const fraction = Math.max(0, item.value ?? 0) / total;
          const start = -Math.PI / 2 + slices.slice(0, index).reduce((sum, prior) => sum + Math.max(0, prior.value ?? 0) / total * Math.PI * 2, 0);
          const angle = start + fraction * Math.PI * 2;
          if (!fraction) return null;
          if (fraction === 1) return <Circle key={item.day} cx={68} cy={68} r={62} fill={item.color} />;
          return <Path key={item.day} d={`M68 68 L${68 + 62 * Math.cos(start)} ${68 + 62 * Math.sin(start)} A62 62 0 ${fraction > 0.5 ? 1 : 0} 1 ${68 + 62 * Math.cos(angle)} ${68 + 62 * Math.sin(angle)} Z`} fill={item.color} stroke={colors.surface} strokeWidth={2} />;
        })}
      </Svg>
      <View style={s.legend}>
        {slices.filter((item) => item.value != null).map((item) => <View key={item.day} style={s.legendRow}><View style={[s.swatch, { backgroundColor: item.color }]} /><Text style={s.small}>{dayLabel(item.day)} · {formatHealthValue(metric, item.value)} {info.unit}</Text></View>)}
      </View>
    </View>
  </View>;
}
const useStyles = () => {
  const colors = usePalette();
  const c = useCareStyles();
return StyleSheet.create({
  chart: { gap: 8, paddingVertical: 16 },
  summary: { gap: 4 },
  label: { fontFamily: fonts.semibold, color: colors.ink, fontSize: 15, lineHeight: 23 },
  small: { ...c.text, fontSize: 13, lineHeight: 20 },
  share: { gap: 10, paddingVertical: 16, borderTopWidth: 1, borderColor: colors.border },
  shareBody: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, alignItems: 'center' },
  legend: { gap: 6, flexGrow: 1 },
  legendRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  swatch: { width: 10, height: 10, borderRadius: 2 },
});
};
