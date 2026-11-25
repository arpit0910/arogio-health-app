import { useRouter } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { AppScreen } from '../../components/app/AppScreen';
import { Button } from '../../components/ui/Button';
import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { useTranslation } from '../../localization/LanguageProvider';
import { usePalette } from '../../theme/AppearanceProvider';
import { typeStyles } from '../../theme/tokens';
import { catalogCard, PracticeCardRow } from './PracticeCards';
import { useMeditationLibrary } from './useMeditationLibrary';

const collections = [
  { title: 'A short reset', sections: ['breathing', 'grounding'] },
  { title: 'Ease into the evening', sections: ['rest'] },
] as const;

export function WellnessCollectionsScreen() {
  const router = useRouter(), { t, language } = useTranslation(), colors = usePalette();
  const { query, items } = useMeditationLibrary();
  const practices = items.filter(item => item.kind === 'practice' &&
    collections.some(collection => collection.sections.some(section => section === item.section)));

  return <AppScreen back title={t('Guided collections')} refreshing={query.isRefetching && !query.isFetchingNextPage} onRefresh={() => void query.refetch()}>
    <View style={{ gap: 24 }}>
      {query.isPending && <ActivityIndicator color={colors.primary} accessibilityLabel={t('Loading meditation library')} />}
      {query.isError && !query.data && <Button title={t('Retry library')} variant="secondary" onPress={() => void query.refetch()} />}
      {query.data && !practices.length && !query.hasNextPage && <Text style={[typeStyles.body, { color: colors.muted }]}>
        {t('New practices and videos will appear here when published.')}
      </Text>}
      {collections.map(collection => <PracticeCardRow key={collection.title} title={t(collection.title)}
        items={practices.filter(item => collection.sections.some(section => section === item.section)).map(item => catalogCard(item, language === 'hi', t('Video')))}
        onOpen={item => router.push({ pathname: '/meditation', params: { practice: item.id, origin: 'collections' } })} />)}
      {query.hasNextPage && <Button title={t('More practices & videos')} variant="secondary" loading={query.isFetchingNextPage}
        onPress={() => { if (!query.isFetching) void query.fetchNextPage({ cancelRefetch: false }); }} />}
    </View>
  </AppScreen>;
}
