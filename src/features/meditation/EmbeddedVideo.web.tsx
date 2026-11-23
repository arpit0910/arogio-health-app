import { videoEmbedUrl } from './videoPlayer';
export function EmbeddedVideo({ id, title }: { id: string; title: string }) {
  const src = videoEmbedUrl(id);
  return src ? <iframe title={title} src={src} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" style={{ border: 0, width: '100%', height: '100%', minHeight: 240 }} /> : null;
}
