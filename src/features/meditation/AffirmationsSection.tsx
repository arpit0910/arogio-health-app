import { useRouter } from 'expo-router';
import { useTranslation } from '../../localization/LanguageProvider';
import { PracticeCardRow } from './PracticeCards';

export type MeditationVideo = { id: string; contentId?: string; title: string; description?: string; author?: string; section?: string };
export function AffirmationsSection({ videos, title = 'Affirmations' }: { videos: MeditationVideo[]; title?: string }) {
  const router = useRouter(), { t } = useTranslation();
  return <PracticeCardRow title={t(title)}
    items={videos.map(video => ({ id: video.contentId ?? video.id, videoId: video.id, title: t(video.title), section: video.section, detail: t('Video') }))}
    onOpen={item => router.push({ pathname: '/meditation-video', params: { id: item.videoId, title: item.title, contentId: item.id, section: item.section } })} />;
}
