import { Text, View, StyleSheet, useWindowDimensions } from 'react-native';
import { router, type Href } from 'expo-router';
import { useTranslation } from '../../localization/LanguageProvider';
import { usePalette } from '../../theme/AppearanceProvider';
import { fonts } from '../../theme/tokens';
import { TouchTarget } from '../ui/TouchTarget';
import { AppIcon, type AppIconName } from './AppIcon';

/** A care destination: the label names the tool; the detail explains its task. */
export function FeatureCard({ title, detail, icon, route, tone = 'mint' }: {
  title: string; detail: string; icon: AppIconName; route: Href;
  tone?: 'mint' | 'blue' | 'rose' | 'lavender';
}) {
  const { t } = useTranslation(), colors = usePalette();
  const { width, fontScale } = useWindowDimensions();
  const singleColumn = width < 360 || fontScale > 1.2;
  const palette = {
    mint: ['#C6EFD9', '#12543D'], blue: ['#BEE2F7', '#165575'],
    rose: ['#F4C4D1', '#832C48'], lavender: ['#C8C8FB', '#404183'],
  }[tone];
  return <TouchTarget accessibilityRole="button" accessibilityLabel={`${t(title)}. ${t(detail)}`}
    onPress={() => router.push(route)} style={({ pressed }) => [s.card, singleColumn && { flexBasis: '100%' }, { backgroundColor: colors.surface, opacity: pressed ? 0.75 : 1 }]}>
    <View style={s.top}><View style={[s.symbol, { backgroundColor: palette[0] }]}><AppIcon name={icon} color={palette[1]} size={26} /></View><AppIcon name="right" color={colors.muted} size={16} /></View>
    <Text style={[s.title, { color: colors.ink }]}>{t(title)}</Text>
    <Text style={[s.detail, { color: colors.muted }]}>{t(detail)}</Text>
  </TouchTarget>;
}
const s = StyleSheet.create({
  card: { flexGrow: 1, flexBasis: '44%', minWidth: 130, padding: 18, borderRadius: 16, gap: 7 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  symbol: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 24 },
  detail: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 20 },
});
