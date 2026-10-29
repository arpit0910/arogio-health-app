import { usePalette } from '../../../theme/AppearanceProvider';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { isApiConfigured } from '../../../config/env';
import { useApiHealth } from '../hooks/useApiHealth';

export function ApiStatusCard() {
  const styles = useStyles();

  const health = useApiHealth();
  const status = !isApiConfigured
    ? 'API URL required'
    : health.isPending
      ? 'Checking backend'
      : health.isError
        ? 'Backend unavailable'
        : `Backend ${health.data.status}`;
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>Connection</Text>
        {health.isPending && isApiConfigured ? <ActivityIndicator color="#097C68" size="small" /> : null}
      </View>
      <Text style={styles.status}>{status}</Text>
      <Text style={styles.help}>Configure EXPO_PUBLIC_API_URL in your local environment.</Text>
    </View>
  );
}

const useStyles = () => {
  const colors = usePalette();
return StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 16, marginTop: 32, padding: 20 },
  row: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: colors.muted, fontSize: 14, fontWeight: '600' },
  status: { color: colors.ink, fontSize: 20, fontWeight: '700', marginTop: 8 },
  help: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 8 },
});
};
