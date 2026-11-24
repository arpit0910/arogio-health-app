import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen } from '../../components/app/AppScreen';
import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { Button } from '../../components/ui/Button';
import { useTranslation } from '../../localization/LanguageProvider';
import { usePalette } from '../../theme/AppearanceProvider';
import { typeStyles } from '../../theme/tokens';
import { useWellness } from '../personal-wellness/WellnessContext';
import { HomeRoutines } from './HomeRoutines';

export function TodayRoutineScreen() {
  const router = useRouter();
  const colors = usePalette();
  const { t } = useTranslation();
  const { loading, refresh } = useWellness();

  return (
    <AppScreen back title={t('Today’s routine')} refreshing={loading} onRefresh={() => void refresh()}>
      <View style={{ gap: 20 }}>
        <HomeRoutines detailed />
        <Button title={t('Health history')} variant="secondary" onPress={() => router.push('/health-history')} />
        <Button title={t('Manage medicines')} variant="secondary" onPress={() => router.push('/medicines')} />
        <View style={{ backgroundColor: colors.mintSurface, borderRadius: 20, padding: 16, gap: 12 }}>
          <Text accessibilityRole="header" style={[typeStyles.title, { color: colors.ink }]}>{t('Make time for a short reset')}</Text>
          <Text style={[typeStyles.body, { color: colors.muted }]}>{t('Choose a guided practice for breathing, focus, or a quieter evening.')}</Text>
          <Button title={t('Yoga & Meditation')} variant="secondary" onPress={() => router.push('/yoga-meditation')} />
        </View>
      </View>
    </AppScreen>
  );
}
