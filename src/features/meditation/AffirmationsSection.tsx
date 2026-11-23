import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { AppIcon } from '../../components/app/AppIcon';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { useTranslation } from '../../localization/LanguageProvider';
import { usePalette } from '../../theme/AppearanceProvider';
import { typeStyles } from '../../theme/tokens';

const builtInVideos = [
  { id: 's2NISyShKXM', title: 'Affirmations video' },
  { id: 'fG1oNm2tCro', title: 'Daily morning affirmations · Sandeep Maheshwari' },
];

export type MeditationVideo = { id: string; contentId?: string; title: string; description?: string; author?: string };
function AffirmationVideo({ id, title, description, author }: MeditationVideo) {
  const router = useRouter();
  const { t: tr } = useTranslation();
  const s = useStyles();
  const colors = usePalette();
  const [imageFailed, setImageFailed] = useState(false);
  function watch() { router.push({ pathname: '/meditation-video', params: { id, title: tr(title) } }); }
  return <View style={s.video}>
    <TouchTarget accessibilityRole="button" accessibilityLabel={`${tr('Play in Arogio')}: ${tr(title)}`} accessibilityHint={tr('Opens the in-app video player')} onPress={() => void watch()} style={({ pressed }) => [s.link, pressed && s.pressed]}>
      <View style={s.preview}>
        {!imageFailed && <Image accessible={false} source={{ uri: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` }} resizeMode="cover" onError={() => setImageFailed(true)} style={s.thumbnail} />}
        <View style={s.watchBadge}><AppIcon name="right" size={20} color={colors.onPrimary} /><Text style={s.watchText}>{tr('Play in Arogio')}</Text></View>
      </View>
      <View style={s.copy}><Text style={s.title}>{tr(title)}</Text>{!!description && <Text style={s.detail}>{description}</Text>}{!!author && <Text style={s.detail}>{author}</Text>}<Text style={s.detail}>{tr('YouTube · In-app playback')}</Text></View>
    </TouchTarget>
  </View>;
}

export function AffirmationsSection({ videos = builtInVideos, title = 'Affirmations', description = 'Make time for encouraging words. Choose a video to watch or listen to.' }: { videos?: MeditationVideo[]; title?: string; description?: string }) {
  const { t: tr } = useTranslation();
  const s = useStyles();
  if (!videos.length) return null;
  return <View style={s.section}>
    <Text accessibilityRole="header" style={s.heading}>{tr(title)}</Text>
    <Text style={s.description}>{tr(description)}</Text>
    {videos.map(video => <AffirmationVideo key={video.contentId ?? video.id} {...video} />)}
  </View>;
}

const useStyles = () => {
  const c = usePalette();
  return StyleSheet.create({
    section: { marginTop: 32, gap: 16 },
    heading: { ...typeStyles.title, color: c.ink },
    description: { ...typeStyles.body, color: c.muted },
    video: { gap: 8 },
    link: { backgroundColor: c.surface, borderRadius: 16, overflow: 'hidden' },
    pressed: { opacity: 0.8 },
    preview: { width: '100%', aspectRatio: 16 / 9, backgroundColor: c.subtle, justifyContent: 'flex-end', alignItems: 'flex-start' },
    thumbnail: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
    watchBadge: { margin: 12, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: c.primary, flexDirection: 'row', gap: 4, alignItems: 'center', maxWidth: '90%' },
    watchText: { ...typeStyles.label, color: c.onPrimary, flexShrink: 1 },
    copy: { padding: 16, gap: 6 },
    title: { ...typeStyles.rowTitle, color: c.ink },
    detail: { ...typeStyles.detail, color: c.muted },
    error: { ...typeStyles.detail, color: c.error },
  });
};
