import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, AppState, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { AppScreen, useAppStyles } from '../../components/app/AppScreen';
import { CareGroup, CareRow } from '../../components/app/CareUI';
import { DTabs } from '../../components/app/DesignUI';
import { Button } from '../../components/ui/Button';
import { usePalette } from '../../theme/AppearanceProvider';
import { fonts } from '../../theme/tokens';
import { useTranslation } from '../../localization/LanguageProvider';
import { clockTime, exerciseDuration, exercisePosition, type Exercise } from './exercises';
import { PracticeAudio } from './PracticeAudio';
import { AffirmationsSection } from './AffirmationsSection';
import { availablePractices, catalogExercise, loadMeditationItem } from './catalog';
import { useMeditationLibrary } from './useMeditationLibrary';
import { SoundBreak } from './SoundBreak';

export function MeditationScreen() {
  const router = useRouter();
  const { t: tr, language } = useTranslation();
  const { query: catalog, items } = useMeditationLibrary();
  const offline = catalog.isError && !catalog.data;
  const practices = useMemo(() => availablePractices(items, language === 'hi'), [items, language]);
  const videos = (section: string) => items.filter(item => item.kind === 'video' && item.section === section && item.videoId).map(item => ({ contentId: item.id, id: item.videoId!, title: language === 'hi' && item.title_hi ? item.title_hi : item.title_en, description: language === 'hi' && item.description_hi ? item.description_hi : item.description_en, author: item.author }));
  const a = useAppStyles(), s = useStyles();
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const clock = useRef({ elapsed: 0, started: 0 });
  const { practice, origin } = useLocalSearchParams<{ practice?: string; origin?: string }>();
  const [returnPath, setReturnPath] = useState<'/yoga' | '/guided-meditation' | null>(null);
  const direct = useQuery({
    queryKey: ['meditation-item', practice],
    queryFn: ({ signal }) => loadMeditationItem(practice!, signal),
    enabled: Boolean(practice && /^[0-9a-f-]{36}$/i.test(practice)),
    staleTime: 0,
  });
  useEffect(() => {
    const exercise = direct.isSuccess && !direct.isFetching && direct.data.id === practice && direct.data.kind === 'practice'
      ? catalogExercise(direct.data, language === 'hi')
      : practice === 'breathing' ? practices.find(item => item.section === 'breathing') : undefined;
    if (!exercise) return;
    const timer = setTimeout(() => {
      clock.current = { elapsed: 0, started: 0 };
      setElapsed(0); setRunning(false); setSelected(exercise);
      setReturnPath(origin === 'yoga' ? '/yoga' : origin === 'meditation' ? '/guided-meditation' : null);
      router.setParams({ practice: undefined, origin: undefined });
    }, 0);
    return () => clearTimeout(timer);
  }, [practice, origin, practices, router, direct.data, direct.isSuccess, direct.isFetching, language]);
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
    setElapsed(0); setRunning(false); setSelected(exercise); setReturnPath(null);
  }
  function start() {
    if (complete) { clock.current.elapsed = 0; setElapsed(0); }
    clock.current.started = Date.now();
    setRunning(true);
  }

  return <AppScreen onRefresh={() => void catalog.refetch()} refreshing={catalog.isRefetching && !catalog.isFetchingNextPage}>
    {!selected ? <>
      <View style={s.libraryHero}>
        <Text accessibilityRole="header" style={s.libraryTitle}>{tr('Calm Zone')}</Text>
        <Text style={a.subtitle}>{tr('Explore guided meditation, music, and short videos in Calm Zone.')}</Text>
      </View>
      <Button title={tr('Yoga & Meditation')} variant="secondary" onPress={() => router.push('/yoga-meditation')} />
      <Button title={tr('Browse guided collections')} variant="secondary" onPress={() => router.push('/wellness-collections')} />
      <DTabs options={['All', 'Practices', 'Sounds', 'Videos']} value={category} onChange={setCategory} grid columns={3} />
      {practice && direct.isPending && direct.fetchStatus === 'fetching' && <ActivityIndicator accessibilityLabel={tr('Loading meditation library')} />}
      {practice && direct.isError && <Text accessibilityRole="alert" style={a.subtitle}>{tr('This practice is unavailable.')}</Text>}
      {catalog.isPending && <ActivityIndicator accessibilityLabel={tr('Loading meditation library')} />}
      {offline && <View style={{ gap: 12 }}><Text style={a.subtitle}>{tr('The library could not refresh. Try again when you are online.')}</Text><Button title={tr('Retry library')} variant="secondary" onPress={() => void catalog.refetch()} /></View>}
      {!catalog.isPending && !offline && !items.length && <Text style={a.subtitle}>{tr('New practices and videos will appear here when published.')}</Text>}
      {(category === 'All' || category === 'Practices') && practices.length > 0 && <CareGroup title="Everyday resets & wind-down">
      {practices.filter(exercise => exercise.section !== 'yoga').map(exercise => <CareRow key={exercise.id} icon={exercise.id === 'breathing' || exercise.section === 'breathing' ? 'cloud' : exercise.id === 'body' ? 'user' : 'leaf'} title={tr(exercise.title)} detail={[clockTime(exerciseDuration(exercise)), tr(exercise.description)].filter(Boolean).join(' · ')} onPress={() => choose(exercise)} />)}
      </CareGroup>}
      {(category === 'All' || category === 'Sounds') && <SoundBreak />}
      <Text style={[a.subtitle, s.note]}>{tr('Keep breathing comfortable. Stop if you feel dizzy, breathless or distressed, and return to your normal breathing. You can keep your eyes open or skip any practice.')}</Text>
      {(category === 'All' || category === 'Videos') && <><AffirmationsSection videos={videos('affirmations')} />
      {(['meditation', 'breathing', 'grounding', 'focus', 'rest', 'yoga'] as const).filter(section => videos(section).length > 0).map(section => <AffirmationsSection key={section} title={section === 'meditation' ? 'Meditation videos' : section === 'breathing' ? 'Breathing videos' : section === 'grounding' ? 'Grounding videos' : section === 'focus' ? 'Focus videos' : section === 'rest' ? 'Rest videos' : 'Yoga videos'} description="Choose a video to watch or listen to." videos={videos(section)} />)}</>}
      {catalog.isFetchNextPageError && <Text accessibilityRole="alert" style={a.subtitle}>{tr('More meditation content could not load. Please try again.')}</Text>}
      {catalog.hasNextPage && <View style={s.note}><Button title={tr('More practices & videos')} loading={catalog.isFetchingNextPage} variant="secondary" onPress={() => { if (!catalog.isFetching) void catalog.fetchNextPage({ cancelRefetch: false }); }} /></View>}
    </> : <>

      <PracticeAudio running={running} language={language} cue={position ? position.step.seconds <= 8 ? tr(position.step.title) : `${tr(position.step.title)}. ${tr(position.step.instruction)}` : ''} />
      <View style={s.session}>
        <Text accessibilityRole="header" style={s.libraryTitle}>{tr(selected.title)}</Text>
        <Text style={[a.subtitle, s.center]}>{tr(selected.preparation)}</Text>
        <Text style={s.status}>{tr(complete ? 'Practice complete' : running ? 'In progress' : elapsed > 0 ? 'Paused' : 'Ready when you are')}</Text>
        <Text accessibilityLabel={`${tr('Time remaining')}: ${clockTime(duration - elapsed)}`} style={s.timer}>{clockTime(duration - elapsed)}</Text>
        <Text accessibilityLiveRegion="polite" accessibilityRole="header" style={a.sectionTitle}>{tr(complete ? 'Take a moment' : position?.step.title ?? '')}</Text>
        <Text style={[a.subtitle, s.center]}>{tr(complete ? 'Notice how you feel. Return to your day whenever you are ready.' : position?.step.instruction ?? '')}</Text>
        {(selected.id === 'breathing' || selected.section === 'breathing') && !complete && <Text style={s.status}>{tr('Follow the comfortable count')}: {position?.remaining}</Text>}
        <Button title={tr(complete ? 'Practice again' : running ? 'Pause' : elapsed > 0 ? 'Resume' : 'Start practice')} onPress={running ? pause : start} />
        <Button title={tr(complete ? 'Choose another practice' : 'End practice')} variant="secondary" onPress={() => {
          choose(null);
          if (returnPath) router.navigate(returnPath);
        }} />
      </View>
      <Text accessibilityRole="header" style={[a.sectionTitle, s.note]}>{tr('Practice guide')}</Text>
      {selected.steps.map((step, index) => <View key={`${index}-${step.title}`} style={s.guide}>
        <Text style={s.guideTitle}>{index + 1}. {tr(step.title)}</Text>
        <Text style={a.subtitle}>{tr(step.instruction)}</Text>
      </View>)}
      <Text style={[a.subtitle, s.note]}>{tr('The timer and audio pause when you leave this screen or put the app in the background.')}</Text>
      <Text style={[a.subtitle, s.note]}>{tr(selected.section === 'yoga' ? 'If a movement hurts or you feel unsteady, stop and rest.' : 'Keep breathing comfortable. Stop if you feel dizzy, breathless or distressed, and return to your normal breathing. You can keep your eyes open or skip any practice.')}</Text>
    </>}
  </AppScreen>;
}

const useStyles = () => {
  const c = usePalette();
  return StyleSheet.create({
    libraryHero: { backgroundColor: c.mintSurface, padding: 22, borderRadius: 24, gap: 8, marginBottom: 14 },
    libraryTitle: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 36, color: c.ink },
    note: { marginTop: 24 },
    session: { backgroundColor: c.mintSurface, borderRadius: 28, padding: 24, gap: 18, alignItems: 'center' },
    status: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 20, color: c.muted, textAlign: 'center' },
    timer: { fontFamily: fonts.semibold, fontSize: 48, lineHeight: 64, color: c.ink, fontVariant: ['tabular-nums'] },
    center: { textAlign: 'center' },
    guide: { paddingVertical: 16, borderBottomWidth: 1, borderColor: c.border, gap: 6 },
    guideTitle: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 24, color: c.ink },
  });
};
