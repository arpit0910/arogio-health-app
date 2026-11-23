import { AccessibleText as Text } from '../ui/AccessibleText';
import { StyleSheet, View } from 'react-native';
import { usePalette } from '../../theme/AppearanceProvider';
import { typeStyles } from '../../theme/tokens';
import { AppIcon, type AppIconName } from './AppIcon';
import { useTranslation } from '../../localization/LanguageProvider';

export function PageIntro({ title, description, icon, tone = 'mint' }: {
  title: string; description: string; icon: AppIconName; tone?: 'mint' | 'blue' | 'rose' | 'lavender';
}) {
  const { t } = useTranslation(), c = usePalette();
  const tones = { mint: [c.mintSurface, c.primary], blue: [c.secondarySurface, c.secondary], rose: [c.roseSurface, c.error], lavender: [c.subtle, c.primary] };
  const [backgroundColor, color] = tones[tone];
  return <View style={s.intro}>
    <View style={s.headingRow}><View style={[s.symbol, { backgroundColor }]}><AppIcon name={icon} color={color} size={25} /></View><Text accessibilityRole="header" style={[s.title, { color: c.ink }]}>{t(title)}</Text></View>
    <Text style={[s.description, { color: c.muted }]}>{t(description)}</Text>
  </View>;
}
const s = StyleSheet.create({
  intro: { gap: 10, marginBottom: 24 },
  headingRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  symbol: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  title: { ...typeStyles.heading, flex: 1, minWidth: 0 },
  description: { ...typeStyles.body, maxWidth: 560 },
});
