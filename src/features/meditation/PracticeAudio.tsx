import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { useEffect, useState } from 'react';
import { Switch, View } from 'react-native';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { useAppStyles } from '../../components/app/AppScreen';
import { usePalette } from '../../theme/AppearanceProvider';
import { useTranslation } from '../../localization/LanguageProvider';

const ambientAsset = require('../../../assets/sounds/meditation_ambient.wav');

export function PracticeAudio({ running, audioUrl }: { running: boolean; cue: string; language: string; audioUrl?: string }) {
  const { t } = useTranslation(), s = useAppStyles(), colors = usePalette();
  const [ambient, setAmbient] = useState(true);
  const [error, setError] = useState('');
  const player = useAudioPlayer(audioUrl ? { uri: audioUrl } : ambientAsset);
  useEffect(() => {
    let cancelled = false;
    // Expo Audio exposes native player properties as mutable setters.
    // eslint-disable-next-line react-hooks/immutability
    player.loop = true;
    player.volume = 0.18;
    if (running && ambient) void setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false, interruptionMode: 'mixWithOthers' }).then(() => { if (!cancelled) player.play(); }).catch(() => { if (!cancelled) setError('Sound could not start. Try turning sound off and on.'); });
    else player.pause();
    return () => { cancelled = true; player.pause(); };
  }, [running, ambient, player]);
  return <View style={{ gap: 12, marginVertical: 16 }}>
    <Text accessibilityRole="header" style={s.sectionTitle}>{t('Make it your practice')}</Text>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}><Text style={[s.subtitle, { flex: 1 }]}>{t('Soft ambient sound')}</Text><Switch accessibilityLabel={t('Soft ambient sound')} value={ambient} onValueChange={value => { setError(''); setAmbient(value); }} trackColor={{ true: colors.primary }} /></View>
    {!!error && <Text accessibilityRole="alert" style={s.subtitle}>{t(error)}</Text>}
  </View>;
}
