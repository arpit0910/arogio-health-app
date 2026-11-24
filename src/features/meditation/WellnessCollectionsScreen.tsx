import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { AppIcon } from '../../components/app/AppIcon';
import { AppScreen } from '../../components/app/AppScreen';
import { CareGroup, CareRow } from '../../components/app/CareUI';
import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { useTranslation } from '../../localization/LanguageProvider';
import { usePalette } from '../../theme/AppearanceProvider';
import { typeStyles } from '../../theme/tokens';
import { clockTime, exerciseDuration } from './exercises';
import { catalogExercise } from './catalog';
import { useMeditationLibrary } from './useMeditationLibrary';
import { Button } from '../../components/ui/Button';

const collections = [
  { title: 'A short reset', description: 'Short breathing and grounding practices.', icon: 'cloud', sections: ['breathing', 'grounding'] },
  { title: 'Ease into the evening', description: 'Quiet practices for rest and reflection.', icon: 'moon', sections: ['rest'] },
] as const;

export function WellnessCollectionsScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { query, items } = useMeditationLibrary();
  const colors = usePalette();

  return (
    <AppScreen back title={t('Guided collections')} refreshing={query.isRefetching && !query.isFetchingNextPage} onRefresh={() => void query.refetch()}>
      <View style={{ gap: 24 }}>
        {query.isPending && <Text>{t('Loading meditation library')}</Text>}
        {query.isError && <Button title={t('Retry library')} variant="secondary" onPress={() => void query.refetch()} />}
        {collections.map(collection => (
          <View key={collection.title}>
            <View style={{ borderRadius: 24, padding: 20, gap: 8, backgroundColor: collection.icon === 'moon' ? colors.mintSurface : colors.secondarySurface }}>
              <AppIcon name={collection.icon} size={28} color={colors.primaryPressed} />
              <Text accessibilityRole="header" style={[typeStyles.heading, { color: colors.ink }]}>{t(collection.title)}</Text>
              <Text style={[typeStyles.body, { color: colors.muted }]}>{t(collection.description)}</Text>
            </View>
            <CareGroup>
              {items.filter(item => item.kind === 'practice' && collection.sections.some(section => section === item.section)).map(item => {
                const exercise = catalogExercise(item, language === 'hi');
                return <CareRow key={item.id} icon="clock" title={exercise.title} detail={clockTime(exerciseDuration(exercise))}
                  onPress={() => router.navigate({ pathname: '/meditation', params: { practice: item.id } })} />;
              })}
            </CareGroup>
          </View>
        ))}
        {query.hasNextPage && <Button title={t('More practices & videos')} variant="secondary" loading={query.isFetchingNextPage}
          onPress={() => { if (!query.isFetching) void query.fetchNextPage({ cancelRefetch: false }); }} />}
      </View>
    </AppScreen>
  );
}
