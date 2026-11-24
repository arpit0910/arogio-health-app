import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { AppIcon } from '../../components/app/AppIcon';
import { AppScreen } from '../../components/app/AppScreen';
import { CareGroup, CareRow } from '../../components/app/CareUI';
import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { Button } from '../../components/ui/Button';
import { useTranslation } from '../../localization/LanguageProvider';
import { usePalette } from '../../theme/AppearanceProvider';
import { typeStyles } from '../../theme/tokens';
import { clockTime, exerciseDuration } from './exercises';

import { useAuth } from '../authentication/context/AuthContext';
import { catalogExercise, type MeditationItem } from './catalog';
import { useMeditationLibrary } from './useMeditationLibrary';

const sectionTitles: Record<MeditationItem['section'], string> = {
  breathing: 'Quick reset', grounding: 'Quick reset', focus: 'Focus & awareness',
  meditation: 'Focus & awareness', rest: 'Rest & reflection', yoga: 'Seated yoga sessions',
  affirmations: 'Affirmations',
};

export function YogaMeditationScreen({ section }: { section?: 'yoga' | 'meditation' }) {
  const router = useRouter();
  const colors = usePalette();
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const yoga = section === 'yoga';
  const { query, items } = useMeditationLibrary();
  const groups = new Map<string, MeditationItem[]>();
  for (const item of items) {
    if (item.kind !== 'practice' || (item.section === 'yoga') !== yoga) continue;
    const title = sectionTitles[item.section];
    const group = groups.get(title) ?? [];
    group.push(item);
    groups.set(title, group);
  }

  if (!section) return (
    <AppScreen back title={t('Yoga & Meditation')}>
      <View style={{ gap: 16 }}>
        <Text accessibilityRole="header" style={[typeStyles.heading, { color: colors.ink }]}>{t('Choose a practice')}</Text>
        <View style={{ padding: 20, gap: 12, borderRadius: 24, backgroundColor: colors.mintSurface }}>
          <AppIcon name="leaf" size={27} color={colors.primaryPressed} />
          <Text style={[typeStyles.title, { color: colors.ink }]}>{t('Yoga')}</Text>
          <Text style={[typeStyles.body, { color: colors.muted }]}>{t('Start with short, seated yoga sessions you can do with a sturdy chair.')}</Text>
          <Button title={t('Browse yoga')} onPress={() => router.push('/yoga')} />
        </View>
        <View style={{ padding: 20, gap: 12, borderRadius: 24, backgroundColor: colors.secondarySurface }}>
          <AppIcon name="moon" size={27} color={colors.secondary} />
          <Text style={[typeStyles.title, { color: colors.ink }]}>{t('Meditation')}</Text>
          <Text style={[typeStyles.body, { color: colors.muted }]}>{t('Choose a guided practice for breathing, focus, or a quieter evening.')}</Text>
          <Button title={t('Browse meditation')} variant="secondary" onPress={() => router.push('/guided-meditation')} />
        </View>
      </View>
    </AppScreen>
  );

  return (
    <AppScreen back title={t(yoga ? 'Yoga' : 'Meditation')} refreshing={query.isRefetching && !query.isFetchingNextPage} onRefresh={() => void query.refetch()}>
      <View style={{ gap: 16 }}>
        <View style={{ borderRadius: 24, padding: 22, gap: 10, backgroundColor: yoga ? colors.mintSurface : colors.secondarySurface }}>
          <AppIcon name={yoga ? 'leaf' : 'moon'} size={28} color={colors.primaryPressed} />
          <Text accessibilityRole="header" style={[typeStyles.heading, { color: colors.ink }]}>{t(yoga ? 'Move at your own pace' : 'Make time for a short reset')}</Text>
          <Text style={[typeStyles.body, { color: colors.muted }]}>{t(yoga ? 'Start with short, seated yoga sessions you can do with a sturdy chair.' : 'Choose a guided practice for breathing, focus, or a quieter evening.')}</Text>
        </View>
      </View>
      {user && <Button title={t('Practice history')} variant="secondary" onPress={() => router.push('/practice-history')} />}
      {query.isPending && <Text style={typeStyles.body}>{t('Loading meditation library')}</Text>}
      {query.isError && <Button title={t('Retry library')} variant="secondary" onPress={() => void query.refetch()} />}
      {!query.isPending && !query.isError && !groups.size && !query.hasNextPage &&
        <Text style={typeStyles.body}>{t('New practices and videos will appear here when published.')}</Text>}
      {Array.from(groups, ([title, group]) => (
        <CareGroup key={title} title={t(title)}>
          {group.map(item => {
            const exercise = catalogExercise(item, language === 'hi');
            return <CareRow key={item.id} icon={yoga ? 'leaf' : 'clock'} title={exercise.title}
              detail={[clockTime(exerciseDuration(exercise)), exercise.description].filter(Boolean).join(' \u00b7 ')}
              onPress={() => router.navigate({ pathname: '/meditation', params: { practice: item.id, origin: section } })} />;
          })}
        </CareGroup>
      ))}
      {query.hasNextPage && <Button title={t('More practices & videos')} variant="secondary"
        loading={query.isFetchingNextPage} onPress={() => { if (!query.isFetching) void query.fetchNextPage({ cancelRefetch: false }); }} />}
      {!yoga && <View style={{ marginTop: 20, gap: 12 }}>
        <Button title={t('Browse guided collections')} variant="secondary" onPress={() => router.push('/wellness-collections')} />
        <Button title={t('Open Calm Zone')} variant="secondary" onPress={() => router.navigate('/meditation')} />
      </View>}
    </AppScreen>
  );
}
