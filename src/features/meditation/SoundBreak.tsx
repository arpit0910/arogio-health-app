import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Image, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Button } from '../../components/ui/Button';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { useCareStyles } from '../../components/app/CareUI';
import { usePalette } from '../../theme/AppearanceProvider';
import { useTranslation } from '../../localization/LanguageProvider';
import { clockTime } from './exercises';

/** One focused sound session; it never plays alongside a guided practice. */
export function SoundBreak() {
  const c = useCareStyles(), colors = usePalette(), { t } = useTranslation();
  const [sound, setSound] = useState<'music' | 'noise'>('music');
  const audioSource = sound === 'music' ? require('../../../assets/sounds/meditation_ambient.wav') : require('../../../assets/sounds/soft_noise.wav');
  const player = useAudioPlayer(audioSource);
  const status = useAudioPlayerStatus(player);
  const [minutes, setMinutes] = useState(5), [remaining, setRemaining] = useState(300), [running, setRunning] = useState(false), [error, setError] = useState('');
  const [loadFailed, setLoadFailed] = useState(false), [loadAttempt, setLoadAttempt] = useState(0);
  const deadline = useRef(0), request = useRef(0);
  const pause = useCallback(() => { ++request.current; player.pause(); if (deadline.current) setRemaining(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000))); deadline.current = 0; setRunning(false); }, [player]);
  useFocusEffect(useCallback(() => () => pause(), [pause]));
  useEffect(() => { const sub = AppState.addEventListener('change', state => { if (state !== 'active') pause(); }); return () => sub.remove(); }, [pause]);
  useEffect(() => {
    if (status.isLoaded) return;
    const timeout = setTimeout(() => setLoadFailed(true), 10000);
    return () => clearTimeout(timeout);
  }, [status.isLoaded, sound, loadAttempt]);
  function retry() {
    setLoadFailed(false); setError('');
    try { player.replace(audioSource); setLoadAttempt(value => value + 1); }
    catch { setLoadFailed(true); }
  }
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      const left = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)); setRemaining(left);
      if (!left) pause();
    }, 250);
    return () => clearInterval(timer);
  }, [running, pause]);
  async function play() {
    const current = ++request.current;
    setError('');
    try {
      await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false, interruptionMode: 'doNotMix' });
      if (current !== request.current) return;
      // eslint-disable-next-line react-hooks/immutability
      player.loop = true; player.volume = 0.25;
      player.play(); deadline.current = Date.now() + (remaining || minutes * 60) * 1000; setRunning(true);
    } catch { if (current === request.current) setError('Sound could not start. Please try again.'); }
  }
  return <View style={{ marginTop: 24, gap: 14 }}>
    <Text accessibilityRole="header" style={c.title}>{t('Sound & stillness')}</Text>
    <Image source={require('../../../assets/articles/mindfulness.jpg')} accessibilityLabel={t('A quiet moment in warm morning light')} resizeMode="cover" style={{ width: '100%', aspectRatio: 16 / 9, borderRadius: 16 }} />
    <Text style={c.text}>{t('Soft ambient music, a quiet image and time with nothing to do. Available offline.')}</Text>
    <View accessibilityRole="radiogroup" accessibilityLabel={t('Choose a sound')} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {(['music', 'noise'] as const).map(value => <TouchTarget key={value} accessibilityRole="radio" accessibilityState={{ checked: sound === value }} onPress={() => { if (value === sound) { if (loadFailed) retry(); return; } pause(); setLoadFailed(false); setError(''); setSound(value); }} style={{ paddingHorizontal: 16, justifyContent: 'center', borderRadius: 12, backgroundColor: sound === value ? colors.primary : colors.subtle }}><Text style={[c.text, { color: sound === value ? colors.onPrimary : colors.ink }]}>{t(value === 'music' ? 'Ambient music' : 'Soft noise')}</Text></TouchTarget>)}
    </View>
    <View accessibilityRole="radiogroup" accessibilityLabel={t('Sound timer')} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {[2, 5, 10, 20].map(value => <TouchTarget key={value} accessibilityRole="radio" accessibilityLabel={`${value} ${t('minutes')}`} accessibilityState={{ checked: minutes === value }} onPress={() => { pause(); setMinutes(value); setRemaining(value * 60); }} style={{ paddingHorizontal: 16, justifyContent: 'center', borderRadius: 12, backgroundColor: minutes === value ? colors.primary : colors.subtle }}><Text style={[c.text, { color: minutes === value ? colors.onPrimary : colors.ink }]}>{value} {t('min')}</Text></TouchTarget>)}
    </View>
    <Text style={c.title}>{clockTime(remaining)}</Text>
    <Button title={t(!status.isLoaded ? loadFailed ? 'Retry sound' : 'Loading sound...' : running ? 'Pause sound' : remaining === 0 ? 'Listen again' : 'Play sound')} onPress={!status.isLoaded ? retry : running ? pause : () => void play()} disabled={!status.isLoaded && !loadFailed} />
    {!status.isLoaded && loadFailed && <Text accessibilityRole="alert" style={c.text}>{t('Sound could not load. Tap Retry sound or choose another sound.')}</Text>}
    {!!error && <Text accessibilityRole="alert" style={c.text}>{t(error)}</Text>}
    <Text style={[c.text, { fontSize: 12 }]}>{t('Sound pauses when you leave this screen or put Arogio in the background. Keep media volume comfortable.')}</Text>
  </View>;
}
