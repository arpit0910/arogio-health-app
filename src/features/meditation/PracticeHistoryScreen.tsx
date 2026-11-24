import { useQuery } from '@tanstack/react-query';
import { View } from 'react-native';
import { AppScreen } from '../../components/app/AppScreen';
import { DCard, DText } from '../../components/app/DesignUI';
import { Button } from '../../components/ui/Button';
import { useTranslation } from '../../localization/LanguageProvider';
import { usePalette } from '../../theme/AppearanceProvider';
import { useAuth } from '../authentication/context/AuthContext';
import { clockTime } from './exercises';
import { loadPracticeHistory } from './practiceHistoryApi';

export function PracticeHistoryScreen() {
  const { t, locale, language } = useTranslation();
  const { user } = useAuth();
  const colors = usePalette();
  const history = useQuery({
    queryKey: ['practice-history', user?.id],
    queryFn: ({ signal }) => loadPracticeHistory(signal),
    enabled: Boolean(user),
  });
  const formatDate = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' });

  return <AppScreen back title={t('Practice history')} refreshing={history.isRefetching} onRefresh={() => void history.refetch()}>
    <View style={{ gap: 14 }}>
      {history.isPending && <DText>Loading practice history…</DText>}
      {history.isError && <DCard>
        <DText color={colors.error}>Practice history could not load.</DText>
        <Button title={t('Retry')} variant="secondary" onPress={() => void history.refetch()} />
      </DCard>}
      {history.data && <>
        <DCard style={{ backgroundColor: colors.mintSurface, padding: 20 }}>
          <DText kind="title">My practice</DText>
          <DText>{t('Completed sessions')}: {history.data.totalSessions.toLocaleString(locale)}</DText>
          <DText>{t('Practice time')}: {clockTime(history.data.totalSeconds)}</DText>
        </DCard>
        {!history.data.items.length && <DText>Completed practices you save will appear here.</DText>}
        {history.data.items.map(item => <DCard key={item.id}>
          <DText kind="title">{language === 'hi' && item.title_hi ? item.title_hi : item.title_en}</DText>
          <DText>{formatDate.format(new Date(item.completedAt))} · {clockTime(item.elapsedSeconds)}</DText>
        </DCard>)}
      </>}
    </View>
  </AppScreen>;
}
