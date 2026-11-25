import { useRouter } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { AppScreen } from '../../components/app/AppScreen';
import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { Button } from '../../components/ui/Button';
import { useTranslation } from '../../localization/LanguageProvider';
import { usePalette } from '../../theme/AppearanceProvider';
import { typeStyles } from '../../theme/tokens';
import { useAuth } from '../authentication/context/AuthContext';
import { type MeditationItem } from './catalog';
import { useMeditationLibrary } from './useMeditationLibrary';
import { catalogCard, PracticeCardRow, type PracticeCardItem } from './PracticeCards';

const groups = [
  { title: 'Yoga postures & sessions', sections: ['yoga'] },
  { title: 'Breathing & grounding', sections: ['breathing', 'grounding'] },
  { title: 'Focus & awareness', sections: ['meditation', 'focus'] },
  { title: 'Rest & reflection', sections: ['rest'] },
  { title: 'Affirmations', sections: ['affirmations'] },
] as { title: string; sections: MeditationItem['section'][] }[];

export function YogaMeditationScreen({ section }: { section?: 'yoga' | 'meditation' }) {
  const router = useRouter(), colors = usePalette(), { t, language } = useTranslation(), { user } = useAuth();
  const { query, items } = useMeditationLibrary(section === 'yoga' ? 'yoga' : undefined);
  const yogaPreview = useMeditationLibrary('yoga', !section);
  const heading = !section ? 'Yoga & Meditation' : section === 'yoga' ? 'Yoga' : 'Meditation';
  const yoga = (!section && yogaPreview.query.data ? yogaPreview.items : items).filter(item => item.section === 'yoga');
  const meditation = items.filter(item => item.section !== 'yoga');
  const visible = section === 'yoga' ? yoga : section === 'meditation' ? meditation : items;
  const cards = (entries: MeditationItem[]) => entries.map(item => catalogCard(item, language === 'hi', t('Video')));
  function open(item: PracticeCardItem) {
    if (item.videoId) {
      router.push({ pathname: '/meditation-video', params: { id: item.videoId, contentId: item.id, title: item.title, section: item.section } });
      return;
    }
    router.push({ pathname: '/meditation', params: { practice: item.id, origin: section ?? 'library' } });
  }
  const intro = !section ? 'Choose a yoga or meditation session.' : section === 'yoga'
    ? 'Explore seated, standing, and floor postures or choose a guided yoga session.'
    : 'Choose a guided practice for breathing, focus, or a quieter evening.';
  return <AppScreen back title={t(heading)}
    refreshing={(query.isRefetching && !query.isFetchingNextPage) || (!section && yogaPreview.query.isRefetching)}
    onRefresh={() => { void query.refetch(); if (!section) void yogaPreview.query.refetch(); }}>
    <View style={{ gap: 24 }}>
      <Text style={[typeStyles.body, { color: colors.muted }]}>{t(intro)}</Text>
      {query.isPending && <ActivityIndicator color={colors.primary} accessibilityLabel={t('Loading meditation library')} />}
      {query.isError && !query.data && <View style={{ gap: 12 }}>
        <Text accessibilityRole="alert" style={[typeStyles.body, { color: colors.ink }]}>{t('The library could not refresh. Try again when you are online.')}</Text>
        <Button title={t('Retry library')} onPress={() => void query.refetch()} />
      </View>}
      {!query.isPending && query.data && !(section ? visible.length : yoga.length + meditation.length) && !query.hasNextPage &&
        <Text style={[typeStyles.body, { color: colors.muted }]}>{t('New practices and videos will appear here when published.')}</Text>}
      {section ? groups.map(group => (
        <PracticeCardRow key={group.title} title={t(group.title)} items={cards(visible.filter(item => group.sections.includes(item.section)))} onOpen={open} />
      )) : <>
        <PracticeCardRow title={t('Yoga')} items={cards(yoga.slice(0, 5))} onOpen={open} browseLabel={t('Browse yoga')} onBrowse={() => router.push('/yoga')} />
        <PracticeCardRow title={t('Meditation')} items={cards(meditation.slice(0, 5))} onOpen={open} browseLabel={t('Browse meditation')} onBrowse={() => router.push('/guided-meditation')} />
      </>}
      {query.hasNextPage && <Button title={t(query.isFetchNextPageError ? 'Retry library' : 'More practices & videos')} variant="secondary"
        loading={query.isFetchingNextPage} onPress={() => { if (!query.isFetching) void query.fetchNextPage({ cancelRefetch: false }); }} />}
      {!section && !yoga.length && <Button title={t('Browse yoga')} variant="secondary" onPress={() => router.push('/yoga')} />}
      {!section && !meditation.length && <Button title={t('Browse meditation')} variant="secondary" onPress={() => router.push('/guided-meditation')} />}
      {section !== 'yoga' && <Button title={t('Browse guided collections')} variant="secondary" onPress={() => router.push('/wellness-collections')} />}
      {section === 'meditation' && <Button title={t('Open Calm Zone')} variant="secondary" onPress={() => router.navigate('/meditation')} />}
      {user && <Button title={t('Practice history')} variant="secondary" onPress={() => router.push('/practice-history')} />}
    </View>
  </AppScreen>;
}
