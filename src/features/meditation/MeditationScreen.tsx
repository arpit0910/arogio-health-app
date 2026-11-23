import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, AppState, StyleSheet, View } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { AppScreen, useAppStyles } from '../../components/app/AppScreen';
import { CareGroup, CareRow } from '../../components/app/CareUI';
import { PageIntro } from '../../components/app/PageIntro';
import { Button } from '../../components/ui/Button';
import { usePalette } from '../../theme/AppearanceProvider';
import { fonts } from '../../theme/tokens';
import { useTranslation } from '../../localization/LanguageProvider';
import { clockTime, exerciseDuration, exercisePosition, type Exercise } from './exercises';
import { PracticeAudio } from './PracticeAudio';
import { AffirmationsSection } from './AffirmationsSection';
import { availablePractices, loadMeditationPage } from './catalog';
import { SoundBreak } from './SoundBreak';

export function MeditationScreen() {
  const router = useRouter();
  const { t: tr, language } = useTranslation();
  const catalog = useInfiniteQuery({
    queryKey: ['meditation-library'], initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => loadMeditationPage(pageParam, signal),
    getNextPageParam: last => last.hasNext && last.items.length ? last.page + 1 : undefined,
    staleTime: 60000,
  });
  const items = useMemo(() => Array.from(new Map(catalog.data?.pages.flatMap(page => page.items).map(item => [item.id, item]) ?? []).values()), [catalog.data]);
  const offline = catalog.isError && !catalog.data;
  const practices = useMemo(() => availablePractices(items, language === 'hi'), [items, language]);
  const videos = (section: string) => items.filter(item => item.kind === 'video' && item.section === section && item.videoId).map(item => ({ contentId: item.id, id: item.videoId!, title: language === 'hi' && item.title_hi ? item.title_hi : item.title_en, description: language === 'hi' && item.description_hi ? item.description_hi : item.description_en, author: item.author }));
  const a = useAppStyles(), s = useStyles();
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const clock = useRef({ elapsed: 0, started: 0 });
  const { practice } = useLocalSearchParams<{ practice?: string }>();
  useEffect(() => {
    const exercise = practices.find(item => item.id === practice) ?? (practice === 'breathing' ? practices.find(item => item.section === 'breathing') : undefined);
    if (!exercise) return;
    const timer = setTimeout(() => {
      clock.current = { elapsed: 0, started: 0 };
      setElapsed(0); setRunning(false); setSelected(exercise);
      router.setParams({ practice: undefined });
    }, 0);
    return () => clearTimeout(timer);
  }, [practice, practices, router]);
  const duration = selected ? exerciseDuration(selected) : 0;
  const complete = Boolean(selected && elapsed >= duration);
  const position = selected ? exercisePosition(selected, elapsed) : null;

  const pause = useCallback(() => {
    if (clock.current.started) {
      clock.current.elapsed += (Date.now() - clock.current.started) / 1000;
      clock.current.started = 0;
      setElapsed(clock.current.elapsed);
    }
    setRunning(false);
  }, []);
  useFocusEffect(useCallback(() => () => pause(), [pause]));
  const refreshLibrary = catalog.refetch;
  useFocusEffect(useCallback(() => { void refreshLibrary({ cancelRefetch: false }); }, [refreshLibrary]));
  useEffect(() => {
    const listener = AppState.addEventListener('change', state => { if (state !== 'active') pause(); });
    return () => listener.remove();
  }, [pause]);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      const next = clock.current.elapsed + (Date.now() - clock.current.started) / 1000;
      setElapsed(Math.min(next, duration));
      if (next >= duration) {
        clock.current = { elapsed: duration, started: 0 };
        setRunning(false);
      }
    }, 200);
    return () => clearInterval(timer);
  }, [running, duration]);

  function choose(exercise: Exercise | null) {
    clock.current = { elapsed: 0, started: 0 };
    setElapsed(0); setRunning(false); setSelected(exercise);
  }
  function start() {
    if (complete) { clock.current.elapsed = 0; setElapsed(0); }
    clock.current.started = Date.now();
    setRunning(true);
  }

  return <AppScreen onRefresh={() => void catalog.refetch()} refreshing={catalog.isRefetching && !catalog.isFetchingNextPage}>
    {!selected ? <>
      <PageIntro title="Calm Zone" description="A short reset or a slower evening. Find a little space for yourself with guided practices, music and videos." icon="leaf" tone="lavender" />
      {catalog.isPending && <ActivityIndicator accessibilityLabel={tr('Loading meditation library')} />}
      {offline && <View style={{ gap: 12 }}><Text style={a.subtitle}>{tr('The library could not refresh. Built-in practices are available below.')}</Text><Button title={tr('Retry library')} variant="secondary" onPress={() => void catalog.refetch()} /></View>}
      {!catalog.isPending && !offline && !items.length && <Text style={a.subtitle}>{tr('New practices and videos will appear here when published.')}</Text>}
      {practices.length > 0 && <CareGroup title="Everyday resets & wind-down">
      {practices.map(exercise => <CareRow key={exercise.id} icon={exercise.id === 'breathing' || exercise.section === 'breathing' ? 'cloud' : exercise.id === 'body' ? 'user' : 'leaf'} title={tr(exercise.title)} detail={tr(exercise.description) || clockTime(exerciseDuration(exercise))} onPress={() => choose(exercise)} />)}
      </CareGroup>}
      <SoundBreak />
      <Text style={[a.subtitle, s.note]}>{tr('Keep breathing comfortable. Stop if you feel dizzy, breathless or distressed, and return to your normal breathing. You can keep your eyes open or skip any practice.')}</Text>
      <AffirmationsSection videos={offline ? undefined : videos('affirmations')} />
      {(['meditation', 'breathing', 'grounding'] as const).map(section => <AffirmationsSection key={section} title={section === 'meditation' ? 'Meditation videos' : section === 'breathing' ? 'Breathing videos' : 'Grounding videos'} description="Choose a video to watch or listen to." videos={videos(section)} />)}
      {catalog.isFetchNextPageError && <Text accessibilityRole="alert" style={a.subtitle}>{tr('More meditation content could not load. Please try again.')}</Text>}
      {catalog.hasNextPage && <View style={s.note}><Button title={tr('More practices & videos')} loading={catalog.isFetchingNextPage} variant="secondary" onPress={() => { if (!catalog.isFetching) void catalog.fetchNextPage({ cancelRefetch: false }); }} /></View>}
    </> : <>
      <Text accessibilityRole="header" style={a.title}>{tr(selected.title)}</Text>
      <Text style={[a.subtitle, s.intro]}>{tr(selected.preparation)}</Text>
      <PracticeAudio running={running} language={language} cue={position ? position.step.seconds <= 8 ? tr(position.step.title) : `${tr(position.step.title)}. ${tr(position.step.instruction)}` : ''} />
      <View style={s.session}>
        <Text style={s.status}>{tr(complete ? 'Practice complete' : running ? 'In progress' : elapsed > 0 ? 'Paused' : 'Ready when you are')}</Text>
        <Text accessibilityLabel={`${tr('Time remaining')}: ${clockTime(duration - elapsed)}`} style={s.timer}>{clockTime(duration - elapsed)}</Text>
        <Text accessibilityLiveRegion="polite" accessibilityRole="header" style={a.sectionTitle}>{tr(complete ? 'Take a moment' : position?.step.title ?? '')}</Text>
        <Text style={[a.subtitle, s.center]}>{tr(complete ? 'Notice how you feel. Return to your day whenever you are ready.' : position?.step.instruction ?? '')}</Text>
        {(selected.id === 'breathing' || selected.section === 'breathing') && !complete && <Text style={s.status}>{tr('Follow the comfortable count')}: {position?.remaining}</Text>}
        <Button title={tr(complete ? 'Practice again' : running ? 'Pause' : elapsed > 0 ? 'Resume' : 'Start practice')} onPress={running ? pause : start} />
        <Button title={tr(complete ? 'Choose another practice' : 'End practice')} variant="secondary" onPress={() => choose(null)} />
      </View>
      <Text accessibilityRole="header" style={[a.sectionTitle, s.note]}>{tr('Practice guide')}</Text>
      {selected.steps.map((step, index) => <View key={`${index}-${step.title}`} style={s.guide}>
        <Text style={s.guideTitle}>{index + 1}. {tr(step.title)}</Text>
        <Text style={a.subtitle}>{tr(step.instruction)}</Text>
      </View>)}
      <Text style={[a.subtitle, s.note]}>{tr('The timer and audio pause when you leave this screen or put the app in the background.')}</Text>
      <Text style={[a.subtitle, s.note]}>{tr('Keep breathing comfortable. Stop if you feel dizzy, breathless or distressed, and return to your normal breathing. You can keep your eyes open or skip any practice.')}</Text>
    </>}
  </AppScreen>;
}

const useStyles = () => {
  const c = usePalette();
  return StyleSheet.create({
    intro: { marginTop: 10, marginBottom: 14 },
    note: { marginTop: 24 },
    session: { backgroundColor: c.subtle, borderRadius: 16, padding: 20, gap: 16, alignItems: 'center' },
    status: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 20, color: c.muted, textAlign: 'center' },
    timer: { fontFamily: fonts.semibold, fontSize: 48, lineHeight: 64, color: c.ink, fontVariant: ['tabular-nums'] },
    center: { textAlign: 'center' },
    guide: { paddingVertical: 16, borderBottomWidth: 1, borderColor: c.border, gap: 6 },
    guideTitle: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 24, color: c.ink },
  });
};
