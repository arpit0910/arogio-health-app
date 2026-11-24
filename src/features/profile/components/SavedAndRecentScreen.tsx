import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { AppScreen } from '../../../components/app/AppScreen';
import { CareGroup, CareRow } from '../../../components/app/CareUI';
import { DText } from '../../../components/app/DesignUI';
import { useTranslation } from '../../../localization/LanguageProvider';
import { usePalette } from '../../../theme/AppearanceProvider';

export function SavedAndRecentScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const colors = usePalette();

  return (
    <AppScreen back title={t('Saved and recent')}>
      <View style={{ gap: 14 }}>
        <View style={{ backgroundColor: colors.mintSurface, borderRadius: 24, padding: 20, gap: 8 }}>
          <DText kind="title">Saved and recent</DText>
          <DText>Return to a provider, an article, or a care search.</DText>
        </View>
        <CareGroup title={t('Saved')}>
          <CareRow icon="hospital" title={t('Saved care')} onPress={() => router.push('/saved-care')} />
          <CareRow icon="book" title={t('Saved articles')} onPress={() => router.push({ pathname: '/articles', params: { saved: '1' } })} />
        </CareGroup>
        <CareGroup title={t('Recent searches')}>
          <CareRow icon="clock" title={t('Recent searches')} onPress={() => router.push({ pathname: '/saved-care', params: { history: '1' } })} />
        </CareGroup>
      </View>
    </AppScreen>
  );
}
