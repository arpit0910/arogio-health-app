import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../../theme/tokens';
import { AuthIcon } from './AuthIcon';

export function AuthBrand() {
  return (
    <View style={styles.brand} accessibilityLabel="Arogio. Your Health Companion">
      <View style={styles.row}>
        <AuthIcon name="brand" />
        <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65} style={styles.wordmark}>Arogio</Text>
      </View>
      <Text style={styles.tagline}>Your Health Companion</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: 'center' },
  row: { maxWidth: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 12 },
  wordmark: { flexShrink: 1, fontFamily: fonts.bold, color: colors.ink, fontSize: 28, lineHeight: 42, letterSpacing: 0, paddingRight: 6, includeFontPadding: true },
  tagline: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 17, color: colors.muted, marginTop: 2, includeFontPadding: false },
});
