import { useState } from 'react';
import { Image, ScrollView, StyleSheet, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import { AppIcon } from '../../components/app/AppIcon';
import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { useTranslation } from '../../localization/LanguageProvider';
import { usePalette } from '../../theme/AppearanceProvider';
import { typeStyles, ui } from '../../theme/tokens';
import { catalogExercise, type MeditationItem } from './catalog';
import { clockTime, exerciseDuration, type Exercise } from './exercises';

const yogaCover = require('../../../assets/wellness/chair-yoga.jpg');
const eveningCover = require('../../../assets/wellness/evening-yoga.jpg');
const meditationCover = require('../../../assets/wellness/guided-meditation.jpg');
const groundingCover = require('../../../assets/wellness/grounding.jpg');
const bodyScanCover = require('../../../assets/articles/mindfulness.jpg');
const restCover = require('../../../assets/articles/sleep.jpg');

export function PracticeCover({ section, videoId, thumbnailVariant, style }: {
  section?: string; videoId?: string; thumbnailVariant?: Exercise['thumbnailVariant']; style?: StyleProp<ViewStyle>;
}) {
  const colors = usePalette();
  const [failedVideo, setFailedVideo] = useState<string>();
  const video = videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId) && failedVideo !== videoId ? videoId : undefined;
  const fallback = thumbnailVariant === 'evening-yoga' ? eveningCover : thumbnailVariant === 'body-scan' ? bodyScanCover
    : section === 'yoga' ? yogaCover : section === 'grounding' ? groundingCover : section === 'rest' ? restCover : meditationCover;
  return <View style={[styles.cover, { backgroundColor: colors.mintSurface }, style]}>
    <Image key={video ?? 'cover'} accessible={false} source={video ? { uri: `https://i.ytimg.com/vi/${video}/hqdefault.jpg` } : fallback}
      onError={video ? () => setFailedVideo(video) : undefined} resizeMode="cover" style={styles.image} />
  </View>;
}

export type PracticeCardItem = {
  id: string;
  title: string;
  detail: string;
  section?: string;
  videoId?: string;
  thumbnailVariant?: Exercise['thumbnailVariant'];
};

export function catalogCard(item: MeditationItem, hindi: boolean, videoLabel: string): PracticeCardItem {
  const exercise = catalogExercise(item, hindi);
  const duration = item.kind === 'practice' ? exerciseDuration(exercise) : item.durationSeconds;
  return {
    id: item.id,
    title: exercise.title,
    detail: [item.kind === 'video' ? videoLabel : '', duration ? clockTime(duration) : ''].filter(Boolean).join(' · '),
    section: item.section,
    videoId: item.videoId ?? undefined,
    thumbnailVariant: exercise.thumbnailVariant,
  };
}

export function PracticeCardRow({ title, items, onOpen, onBrowse, browseLabel }: {
  title: string; items: PracticeCardItem[]; onOpen: (item: PracticeCardItem) => void;
  onBrowse?: () => void; browseLabel?: string;
}) {
  const [showList, setShowList] = useState(false);
  const { t } = useTranslation();
  const colors = usePalette();
  const { width } = useWindowDimensions();
  const available = Math.min(width, width >= 1024 ? 880 : ui.content) - ui.space.inset * 2;
  const cardWidth = Math.min(310, Math.round(available * 0.83));
  if (!items.length) return null;
  const stacked = showList || items.length === 1;
  const cards = items.map(item => (
    <TouchTarget key={item.id} accessibilityRole="button" accessibilityLabel={[item.title, item.detail].filter(Boolean).join(', ')}
      onPress={() => onOpen(item)}
      style={({ pressed }) => [styles.card, { width: stacked ? '100%' : cardWidth, maxWidth: stacked ? 520 : undefined, opacity: pressed ? 0.8 : 1, borderColor: colors.border, backgroundColor: colors.surface }]}>
      <PracticeCover section={item.section} videoId={item.videoId} thumbnailVariant={item.thumbnailVariant} />
      <View style={styles.copy}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[typeStyles.rowTitle, { color: colors.ink }]}>{item.title}</Text>
          {!!item.detail && <Text style={[typeStyles.detail, { color: colors.muted }]}>{item.detail}</Text>}
        </View>
        <AppIcon name="right" size={20} color={colors.primaryPressed} />
      </View>
    </TouchTarget>
  ));
  return <View style={styles.section}>
    <View style={styles.heading}>
      <Text accessibilityRole="header" style={[typeStyles.title, { color: colors.ink, flexGrow: 1 }]}>{title}</Text>
      {(onBrowse || items.length > 1) && <TouchTarget accessibilityRole="button"
        accessibilityLabel={`${browseLabel ?? t(showList ? 'Show as row' : 'Show as list')}: ${title}`}
        onPress={onBrowse ?? (() => setShowList(value => !value))} style={styles.action}>
        <Text style={[typeStyles.label, { color: colors.primaryPressed }]}>{browseLabel ?? t(showList ? 'Show as row' : 'Show as list')}</Text>
      </TouchTarget>}
    </View>
    {stacked ? <View style={{ gap: 12 }}>{cards}</View> : <ScrollView horizontal nestedScrollEnabled
      accessibilityLabel={title} contentContainerStyle={styles.rail} decelerationRate="fast"
      snapToInterval={cardWidth + 12} snapToAlignment="start">{cards}</ScrollView>}
  </View>;
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  heading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', columnGap: 12 },
  action: { justifyContent: 'center', alignItems: 'flex-end' },
  rail: { gap: 12, alignItems: 'stretch', paddingBottom: 8 },
  card: { borderRadius: ui.radius.card, borderWidth: 1, overflow: 'hidden' },
  cover: { width: '100%', aspectRatio: 1.72, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  copy: { padding: 16, flex: 1, minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 12 },
});
