import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../../theme/tokens';
import { AuthIcon } from './AuthIcon';

export function AuthBrand() {
  return (
    <View style={styles.brand} accessibilityLabel="Arogio. Your Health Companion">
      <View style={styles.row}>
        <AuthIcon name="brand" />
        <Text style={styles.wordmark}>Arogio</Text>
      </View>
      <Text style={styles.tagline}>Your Health Companion</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wordmark: { fontFamily: fonts.bold, color: colors.ink, fontSize: 28, lineHeight: 42, letterSpacing: -0.7, includeFontPadding: false },
  tagline: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 17, color: colors.muted, marginTop: 2, includeFontPadding: false },
});
