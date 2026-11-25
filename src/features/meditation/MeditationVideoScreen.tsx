import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { useCallback, useState } from 'react';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { AppState, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { AppScreen, useAppStyles } from '../../components/app/AppScreen';
import { EmbeddedVideo } from './EmbeddedVideo';
import { useTranslation } from '../../localization/LanguageProvider';
import { loadMeditationItem } from './catalog';
import { PracticeCover } from './PracticeCards';
import { usePalette } from '../../theme/AppearanceProvider';
import { clockTime } from './exercises';
export function MeditationVideoScreen() {
  const { id, title, contentId, section } = useLocalSearchParams<{ id?: string; title?: string; contentId?: string; section?: string }>();
  const { t, language } = useTranslation(), s = useAppStyles(), colors = usePalette();
  const catalog = useQuery({
    queryKey: ['meditation-item', contentId],
    queryFn: ({ signal }) => loadMeditationItem(contentId!, signal),
    enabled: !!contentId && /^[0-9a-f-]{36}$/i.test(contentId),
  });
  const item = catalog.data?.kind === 'video' && catalog.data.videoId === id ? catalog.data : undefined;
  const name = (language === 'hi' && item?.title_hi) || item?.title_en || title || t('Meditation video');
  const description = (language === 'hi' && item?.description_hi) || item?.description_en;
  const type = item?.section ?? section;
  const [active, setActive] = useState(false);
  useFocusEffect(useCallback(() => {
    setActive(true);
    const listener = AppState.addEventListener('change', state => setActive(state === 'active'));
    return () => { listener.remove(); setActive(false); };
  }, []));
  return <AppScreen back title={t('Video')}>
    <View style={{ gap: 16 }}>
      <View style={{ gap: 6 }}>
        <Text style={[s.subtitle, { color: colors.primaryPressed }]}>{t(type === 'yoga' ? 'Yoga' : 'Meditation')}{item?.durationSeconds ? ` · ${clockTime(item.durationSeconds)}` : ''}</Text>
        <Text accessibilityRole="header" style={s.title}>{name}</Text>
        {!!item?.author && <Text style={s.subtitle}>{item.author}</Text>}
      </View>
      <View style={{ width: '100%', aspectRatio: 16 / 9, minHeight: 200, backgroundColor: colors.ink, overflow: 'hidden', borderRadius: 20 }}>
        {active ? <EmbeddedVideo id={id ?? ''} title={name} /> : <PracticeCover section={type} videoId={id} style={{ height: '100%' }} />}
      </View>
      {!!description && <View style={{ gap: 6 }}>
        <Text accessibilityRole="header" style={s.sectionTitle}>{t('About this video')}</Text>
        <Text style={s.subtitle}>{description}</Text>
      </View>}
    </View>
  </AppScreen>;
}
