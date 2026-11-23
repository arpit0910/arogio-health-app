import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { useCallback, useState } from 'react';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { AppState, View } from 'react-native';
import { AppScreen, useAppStyles } from '../../components/app/AppScreen';
import { EmbeddedVideo } from './EmbeddedVideo';
import { useTranslation } from '../../localization/LanguageProvider';
export function MeditationVideoScreen() {
  const { id, title } = useLocalSearchParams<{ id?: string; title?: string }>();
  const { t } = useTranslation(), s = useAppStyles();
  const [active, setActive] = useState(false);
  useFocusEffect(useCallback(() => {
    setActive(true);
    const listener = AppState.addEventListener('change', state => setActive(state === 'active'));
    return () => { listener.remove(); setActive(false); };
  }, []));
  return <AppScreen back title={title || t('Meditation video')}>
    <View style={{ width: '100%', aspectRatio: 16 / 9, minHeight: 240, backgroundColor: '#000', overflow: 'hidden', borderRadius: 16 }}>{active && <EmbeddedVideo id={id ?? ''} title={title || t('Meditation video')} />}</View>
    <Text style={s.subtitle}>{t('Play, pause and use full screen without leaving Arogio. Some creators may restrict embedded playback.')}</Text>
  </AppScreen>;
}
