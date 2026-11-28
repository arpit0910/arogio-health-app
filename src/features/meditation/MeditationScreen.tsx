import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, AppState, StyleSheet, View } from 'react-native';
import { randomUUID } from 'expo-crypto';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { AppScreen, useAppStyles } from '../../components/app/AppScreen';
import { DTabs } from '../../components/app/DesignUI';
import { Button } from '../../components/ui/Button';
import { usePalette } from '../../theme/AppearanceProvider';
import { fonts, ui } from '../../theme/tokens';
import { useTranslation } from '../../localization/LanguageProvider';
import { clockTime, exerciseDuration, exercisePosition, type Exercise } from './exercises';
import { PracticeAudio } from './PracticeAudio';
import { AffirmationsSection } from './AffirmationsSection';
import { availablePractices, catalogExercise, loadMeditationItem } from './catalog';
import { useMeditationLibrary } from './useMeditationLibrary';
import { useAuth } from '../authentication/context/AuthContext';
import { savePracticeCompletion } from './practiceHistoryApi';
import { SoundBreak } from './SoundBreak';
import { PracticeCardRow, PracticeCover } from './PracticeCards';

export function MeditationScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [attempt, setAttempt] = useState<{ id: string; owner: string } | null>(null);
  const saveLock = useRef(false);
  const [completion, setCompletion] = useState<{ id: string; status: 'saving' | 'saved' | 'error' }>();
  const completionStatus = completion?.id === attempt?.id ? completion?.status : undefined;
  const { t: tr, language } = useTranslation();
  const { query: catalog, items } = useMeditationLibrary();
  const offline = catalog.isError && !catalog.data;
  const practices = useMemo(() => availablePractices(items, language === 'hi'), [items, language]);
  const videos = (section: string) => items.filter(item => item.kind === 'video' && item.section === section && item.videoId).map(item => ({ contentId: item.id, id: item.videoId!, title: language === 'hi' && item.title_hi ? item.title_hi : item.title_en, section: item.section }));
  const a = useAppStyles(), s = useStyles();
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const clock = useRef({ elapsed: 0, started: 0 });
  const { practice, origin } = useLocalSearchParams<{ practice?: string; origin?: string }>();
  const [returnPath, setReturnPath] = useState<'/yoga' | '/guided-meditation' | '/yoga-meditation' | '/wellness-collections' | null>(null);
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
      setAttempt(null);
      clock.current = { elapsed: 0, started: 0 };
      setElapsed(0); setRunning(false); setSelected(exercise);
      setReturnPath(origin === 'yoga' ? '/yoga' : origin === 'meditation' ? '/guided-meditation'
        : origin === 'library' ? '/yoga-meditation' : origin === 'collections' ? '/wellness-collections' : null);
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
    setAttempt(null);
    clock.current = { elapsed: 0, started: 0 };
    setElapsed(0); setRunning(false); setSelected(exercise); setReturnPath(null);
  }
  function start() {
    if (complete || !clock.current.elapsed) {
      setAttempt(user && selected?.publishedVersion ? { id: randomUUID(), owner: user.id } : null);
      if (complete) { clock.current.elapsed = 0; setElapsed(0); }
    }
    clock.current.started = Date.now();
    setRunning(true);
  }

  const canSave = complete && Boolean(user && attempt?.owner === user.id && selected?.publishedVersion);
  async function saveCompletion() {
    const active = attempt;
    if (!active || active.owner !== user?.id || !selected?.publishedVersion || !complete || saveLock.current) return;
    saveLock.current = true;
    setCompletion({ id: active.id, status: 'saving' });
    try {
      await savePracticeCompletion({
        attemptId: active.id, itemId: selected.id, version: selected.publishedVersion, elapsedSeconds: duration,
      });
      setCompletion({ id: active.id, status: 'saved' });
      void queryClient.invalidateQueries({ queryKey: ['practice-history', active.owner] });
    } catch {
      setCompletion({ id: active.id, status: 'error' });
    } finally {
      saveLock.current = false;
    }
  }

  function leavePractice() {
    choose(null);
    if (returnPath) router.navigate(returnPath);
  }

  if (practice && practice !== 'breathing' && selected?.id !== practice) {
    const pending = direct.isFetching || (direct.isSuccess && direct.data.kind === 'practice');
    return <AppScreen back title={tr('Practice')}>
      {pending ? <ActivityIndicator accessibilityLabel={tr('Loading meditation library')} /> : <>
        <Text accessibilityRole="alert" style={a.subtitle}>{tr('This practice is unavailable.')}</Text>
        {direct.isError && <Button title={tr('Retry library')} onPress={() => void direct.refetch()} />}
      </>}
    </AppScreen>;
  }
  const preview = !running && !complete && elapsed === 0;
  const primaryAction = complete ? 'Practice again' : running ? 'Pause' : preview ? 'Start practice' : 'Resume';
  return <AppScreen title={selected ? tr('Practice') : undefined} back={!!selected} onBack={selected ? leavePractice : undefined}
    scrollKey={selected?.id} onRefresh={selected ? undefined : () => void catalog.refetch()} refreshing={catalog.isRefetching && !catalog.isFetchingNextPage}
    footer={selected && <PracticePrimaryAction title={primaryAction} disabled={completionStatus === 'saving'} onPress={running ? pause : start} />}>
    {!selected ? <>
      <View style={s.libraryHero}>
        <Text accessibilityRole="header" style={s.libraryTitle}>{tr('Calm Zone')}</Text>
        <Text style={a.subtitle}>{tr('Explore guided meditation, music, and short videos in Calm Zone.')}</Text>
      </View>
      <DTabs options={['All', 'Practices', 'Sounds', 'Videos']} value={category} onChange={setCategory} grid columns={3} />
      {practice && direct.isPending && direct.fetchStatus === 'fetching' && <ActivityIndicator accessibilityLabel={tr('Loading meditation library')} />}
      {practice && direct.isError && <Text accessibilityRole="alert" style={a.subtitle}>{tr('This practice is unavailable.')}</Text>}
      {catalog.isPending && <ActivityIndicator accessibilityLabel={tr('Loading meditation library')} />}
      {offline && <View style={{ gap: 12 }}><Text style={a.subtitle}>{tr('The library could not refresh. Try again when you are online.')}</Text><Button title={tr('Retry library')} variant="secondary" onPress={() => void catalog.refetch()} /></View>}
      {!catalog.isPending && !offline && !items.length && <Text style={a.subtitle}>{tr('New practices and videos will appear here when published.')}</Text>}
      {(category === 'All' || category === 'Practices') && <View style={s.note}>
        <PracticeCardRow title={tr('Guided meditation')} items={practices.filter(exercise => exercise.section !== 'yoga').map(exercise => ({
          id: exercise.id, title: tr(exercise.title), section: exercise.section, detail: clockTime(exerciseDuration(exercise)), thumbnailVariant: exercise.thumbnailVariant,
        }))} onOpen={item => choose(practices.find(exercise => exercise.id === item.id) ?? null)} />
      </View>}
      {(category === 'All' || category === 'Sounds') && <SoundBreak />}
      <Text style={[a.subtitle, s.note]}>{tr('Keep breathing comfortable. Stop if you feel dizzy, breathless or distressed, and return to your normal breathing. You can keep your eyes open or skip any practice.')}</Text>
      {(category === 'All' || category === 'Videos') && <><AffirmationsSection videos={videos('affirmations')} />
      {(['meditation', 'breathing', 'grounding', 'focus', 'rest'] as const).filter(section => videos(section).length > 0).map(section => <View key={section} style={s.note}><AffirmationsSection title={section === 'meditation' ? 'Meditation videos' : section === 'breathing' ? 'Breathing videos' : section === 'grounding' ? 'Grounding videos' : section === 'focus' ? 'Focus videos' : 'Rest videos'} videos={videos(section)} /></View>)}</>}
      {catalog.isFetchNextPageError && <Text accessibilityRole="alert" style={a.subtitle}>{tr('More meditation content could not load. Please try again.')}</Text>}
      {catalog.hasNextPage && <View style={s.note}><Button title={tr('More practices & videos')} loading={catalog.isFetchingNextPage} variant="secondary" onPress={() => { if (!catalog.isFetching) void catalog.fetchNextPage({ cancelRefetch: false }); }} /></View>}
      <View style={s.links}>
      <Button title={tr('Yoga & Meditation')} variant="secondary" onPress={() => router.push('/yoga-meditation')} />
      {user && <Button title={tr('Practice history')} variant="secondary" onPress={() => router.push('/practice-history')} />}
      <Button title={tr('Browse guided collections')} variant="secondary" onPress={() => router.push('/wellness-collections')} />
      </View>
    </> : <>
      <PracticeAudio running={running} language={language} audioUrl={selected.audioUrl} cue={position ? position.step.seconds <= 8 ? tr(position.step.title) : `${tr(position.step.title)}. ${tr(position.step.instruction)}` : ''} />
      {preview ? <PracticeDetailIntro exercise={selected} onWatchVideo={selected.videoId ? () => router.push({ pathname: '/meditation-video', params: { id: selected.videoId!, contentId: selected.id, title: selected.title, section: selected.section } }) : undefined} /> : <View style={s.session}>
        <Text style={a.subtitle}>{tr(selected.section === 'yoga' ? 'Yoga' : 'Meditation')}{' \u00b7 '}{clockTime(duration)}</Text>
        {(position?.step.imageUrl || selected.imageUrl || position?.step.videoId || selected.videoId) && !complete && (
          <PracticeCover
            section={selected.section}
            imageUrl={position?.step.imageUrl ?? selected.imageUrl}
            videoId={(position?.step.videoId ?? selected.videoId) || undefined}
            thumbnailVariant={selected.thumbnailVariant}
            style={{ borderRadius: 16 }}
          />
        )}
        <Text accessibilityRole="header" style={s.libraryTitle}>{tr(selected.title)}</Text>
        {!!(position?.step.sanskritName || selected.sanskritName) && !complete && (
          <Text style={[s.status, { fontStyle: 'italic' }]}>{position?.step.sanskritName ?? selected.sanskritName}</Text>
        )}
        <Text style={s.status}>
          {tr(complete ? 'Practice complete' : running ? 'In progress' : 'Paused')}
          {!complete && position?.step.phase ? ` · ${tr(position.step.phase === 'warmup' ? 'Warm-up' : position.step.phase === 'cooldown' ? 'Cool-down' : 'Main posture')}` : ''}
        </Text>
        <Text accessibilityLabel={`${tr('Time remaining')}: ${clockTime(duration - elapsed)}`} style={s.timer}>{clockTime(duration - elapsed)}</Text>
        <Text accessibilityLiveRegion="polite" accessibilityRole="header" style={a.sectionTitle}>{tr(complete ? 'Take a moment' : position?.step.title ?? '')}</Text>
        <Text style={[a.subtitle, s.center]}>{tr(complete ? 'Notice how you feel. Return to your day whenever you are ready.' : position?.step.instruction ?? '')}</Text>
        {!!position?.step.impact && !complete && (
          <View style={s.impactBox}>
            <Text style={s.impactLabel}>{tr('Impact on body')}</Text>
            <Text style={a.subtitle}>{position.step.impact}</Text>
          </View>
        )}
        {!!(position?.step.videoId || selected.videoId) && !complete && (
          <Button
            title={tr('Watch how-to video')}
            variant="secondary"
            onPress={() => {
              pause();
              const vid = (position?.step.videoId ?? selected.videoId)!;
              router.push({ pathname: '/meditation-video', params: { id: vid, contentId: selected.id, title: position?.step.title ?? selected.title, section: selected.section } });
            }}
          />
        )}
        {(selected.id === 'breathing' || selected.section === 'breathing') && !complete && <Text style={s.status}>{tr('Follow the comfortable count')}: {position?.remaining}</Text>}
        {canSave && completionStatus !== 'saved' &&
          <Button title={tr(completionStatus === 'error' ? 'Retry saving practice' : 'Save completed practice')}
            loading={completionStatus === 'saving'} onPress={() => void saveCompletion()} />}
        {canSave && completionStatus === 'saved' &&
          <Text accessibilityLiveRegion="polite" style={a.subtitle}>{tr('Practice saved to your history.')}</Text>}
        <Button title={tr(complete ? 'Choose another practice' : 'End practice')} variant="secondary" onPress={leavePractice} />
      </View>}
      <Text accessibilityRole="header" style={[a.sectionTitle, s.note]}>{tr('Practice guide')}</Text>
      {selected.steps.map((step, index) => <View key={`${index}-${step.title}`} style={s.guide}>
        <Text style={s.guideTitle}>
          {index + 1}. {tr(step.title)}
          {step.phase ? ` · ${tr(step.phase === 'warmup' ? 'Warm-up' : step.phase === 'cooldown' ? 'Cool-down' : 'Main posture')}` : ''}
          {` (${clockTime(step.seconds)})`}
        </Text>
        {!!step.sanskritName && <Text style={[a.subtitle, { fontStyle: 'italic' }]}>{step.sanskritName}</Text>}
        <Text style={a.subtitle}>{tr(step.instruction)}</Text>
        {!!step.impact && <Text style={[a.subtitle, { fontSize: 13 }]}>{tr('Impact on body')}: {step.impact}</Text>}
        {!!step.videoId && (
          <Button
            title={tr('Watch how-to video')}
            variant="secondary"
            onPress={() => {
              pause();
              router.push({ pathname: '/meditation-video', params: { id: step.videoId!, contentId: selected.id, title: step.title, section: selected.section } });
            }}
          />
        )}
      </View>)}
      <Text style={[a.subtitle, s.note]}>{tr('The timer and audio pause when you leave this screen or put the app in the background.')}</Text>
    </>}
  </AppScreen>;
}

export function PracticeDetailIntro({ exercise, onWatchVideo }: { exercise: Exercise; onWatchVideo?: () => void }) {
  const a = useAppStyles(), s = useStyles(), { t } = useTranslation();
  const yoga = exercise.section === 'yoga';
  return <>
    <PracticeCover section={exercise.section} imageUrl={exercise.imageUrl} videoId={exercise.videoId ?? undefined} thumbnailVariant={exercise.thumbnailVariant} style={s.detailCover} />
    <View style={s.session}>
      <View style={{ gap: 6 }}>
        <Text style={a.subtitle}>
          {t(yoga ? 'Yoga' : 'Meditation')}
          {exercise.difficulty ? ` · ${t(exercise.difficulty === 'beginner' ? 'Beginner' : exercise.difficulty === 'intermediate' ? 'Intermediate' : 'Gentle')}` : ''}
          {' · '}{clockTime(exerciseDuration(exercise))}
        </Text>
        <Text accessibilityRole="header" style={s.libraryTitle}>{t(exercise.title)}</Text>
        {!!exercise.sanskritName && <Text style={[a.subtitle, { fontStyle: 'italic' }]}>{exercise.sanskritName}</Text>}
        {!!exercise.description && <Text style={a.subtitle}>{t(exercise.description)}</Text>}
      </View>
      {!!exercise.impact && (
        <View style={s.impactBox}>
          <Text style={s.impactLabel}>{t('Impact on body')}</Text>
          <Text style={a.subtitle}>{exercise.impact}</Text>
        </View>
      )}
      {onWatchVideo && <Button title={t('Watch how-to video')} variant="secondary" onPress={onWatchVideo} />}
      <View style={{ gap: 6 }}>
        <Text accessibilityRole="header" style={a.sectionTitle}>{t('Before you start')}</Text>
        {!!exercise.preparation && <Text style={a.subtitle}>{t(exercise.preparation)}</Text>}
        <Text style={a.subtitle}>{t(yoga ? 'If a movement hurts or you feel unsteady, stop and rest.' : 'Keep breathing comfortable. Stop if you feel dizzy, breathless or distressed, and return to your normal breathing. You can keep your eyes open or skip any practice.')}</Text>
      </View>
    </View>
  </>;
}

export function PracticePrimaryAction({ title, onPress, disabled }: { title: string; onPress: () => void; disabled?: boolean }) {
  const colors = usePalette(), { t } = useTranslation();
  return <View style={{ backgroundColor: colors.background, borderTopWidth: 1, borderColor: colors.border }}>
    <View style={{ width: '100%', maxWidth: ui.content, alignSelf: 'center', paddingHorizontal: ui.space.inset, paddingVertical: 8 }}>
      <Button title={t(title)} onPress={onPress} disabled={disabled} />
    </View>
  </View>;
}

const useStyles = () => {
  const c = usePalette();
  return StyleSheet.create({
    libraryHero: { backgroundColor: c.mintSurface, padding: 22, borderRadius: 24, gap: 8, marginBottom: 14 },
    libraryTitle: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 36, color: c.ink },
    note: { marginTop: 24 },
    links: { gap: 12, marginTop: 24 },
    detailCover: { borderRadius: 20, marginBottom: 16 },
    session: { backgroundColor: c.surface, borderColor: c.border, borderWidth: 1, borderRadius: 20, padding: 18, gap: 14 },
    status: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 20, color: c.muted, textAlign: 'center' },
    timer: { fontFamily: fonts.semibold, fontSize: 48, lineHeight: 64, color: c.ink, fontVariant: ['tabular-nums'] },
    center: { textAlign: 'center' },
    guide: { paddingVertical: 16, borderBottomWidth: 1, borderColor: c.border, gap: 6 },
    guideTitle: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 24, color: c.ink },
    impactBox: { backgroundColor: c.mintSurface, borderRadius: 14, padding: 14, gap: 4 },
    impactLabel: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18, color: c.primaryPressed },
  });
};
