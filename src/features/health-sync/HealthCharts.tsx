import { StyleSheet, Text, View } from 'react-native';
import Svg, { G as PathGroup, Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { colors, fonts } from '../../theme/tokens';
import { careStyles as c } from '../../components/app/CareUI';
import { formatHealthValue, healthMetrics, metricAverage, type HealthMetric, type HealthSnapshot } from './model';

const palette = [colors.primary, '#7B3D45', '#426E8A', '#8A601F', '#536632', '#765A80', '#67594B'];
function dayLabel(day: string) {
  return new Intl.DateTimeFormat('en-IN', { weekday: 'short', timeZone: 'Asia/Kolkata' }).format(new Date(`${day}T12:00:00Z`));
}
export function HealthChart({ snapshot, metric, emptyMessage }: { snapshot: HealthSnapshot; metric: HealthMetric; emptyMessage?: string }) {
  const info = healthMetrics.find((item) => item.key === metric)!;
  const values = snapshot.days.map((day) => day.readings[metric]?.value ?? null);
  const finite = values.filter((v): v is number => v != null && Number.isFinite(v));
  const average = metricAverage(snapshot, metric);
  if (!finite.length) return <Text style={c.text}>{emptyMessage ?? `No ${info.title.toLowerCase()} readings yet. Allow this data in Health Connect and check that your source app is sharing it.`}</Text>;
  const max = Math.max(...finite, 1) * 1.12;
  const isLine = ['HeartRate', 'RestingHeartRate', 'Weight'].includes(metric);
  const x = (i: number) => 64 + i * 40;
  const y = (value: number) => 164 - Math.max(0, value) / max * 136;
  const summary = snapshot.days.map((day, i) => `${day.day}: ${formatHealthValue(metric, values[i])} ${values[i] == null ? '' : info.unit}`).join('; ');
  return <View style={s.chart} accessible accessibilityRole="image" accessibilityLabel={`${info.title}, last 7 days. ${summary}`}>
    <View style={s.summary}>
      <Text style={s.label}>{isLine ? 'Daily average' : 'Daily total'} · {info.unit}</Text>
      {average && <Text style={s.small}>{formatHealthValue(metric, average.value)} average · {average.days} recorded days</Text>}
    </View>
    <Svg fontFamily={fonts.regular} width="100%" height={204} viewBox="0 0 336 204" accessible={false}>
      {[0, 0.5, 1].map((part) => <ViewlessGrid key={part} at={y(max * part)} label={formatHealthValue(metric, max * part)} />)}
      {snapshot.days.map((day, i) => {
        const value = values[i];
        const previous = values[i - 1];
        return <PathGroup key={day.day}>
          {value != null && isLine && previous != null && <Line x1={x(i - 1)} y1={y(previous)} x2={x(i)} y2={y(value)} stroke={colors.primary} strokeWidth={2.5} />}
          {value != null && (isLine ? <Circle cx={x(i)} cy={y(value)} r={4} fill={colors.primary} /> : <Rect x={x(i) - 11} y={y(value) - (value === 0 ? 2 : 0)} width={22} height={value === 0 ? 2 : 164 - y(value)} rx={3} fill={i === 6 ? colors.accent : colors.primary} />)}
          {value == null && <SvgText x={x(i)} y={158} textAnchor="middle" fontSize={14} fill={colors.muted}>–</SvgText>}
          <SvgText x={x(i)} y={186} textAnchor="middle" fontSize={11} fill={colors.muted}>{dayLabel(day.day)}</SvgText>
        </PathGroup>;
      })}
    </Svg>
    <Text style={s.small}>Gaps mean no data. Today is still in progress.</Text>
  </View>;
}
// SVG groups keep every plotted mark in the same coordinate space.
function ViewlessGrid({ at, label }: { at: number; label: string }) {
  return <PathGroup><Line x1={46} x2={324} y1={at} y2={at} stroke={colors.border} /><SvgText x={40} y={at + 4} textAnchor="end" fill={colors.muted} fontSize={10}>{label}</SvgText></PathGroup>;
}
export function WeeklyShare({ snapshot, metric }: { snapshot: HealthSnapshot; metric: HealthMetric }) {
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
const s = StyleSheet.create({
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
