import { resolveMediaUrl } from '../../services/api/mediaUrl.ts';

export function articleImageCandidates(apiUrl: string, thumbnailUrl?: string, imageUrl?: string) {
  const thumbnail = resolveMediaUrl(thumbnailUrl, apiUrl);
  const image = resolveMediaUrl(imageUrl, apiUrl);
  const uploaded = thumbnail && thumbnail.origin === new URL(apiUrl).origin
    && /^\/api\/v1\/public\/articles\/[0-9a-f-]{36}\/thumbnail$/i.test(thumbnail.pathname);
  // Older backends also put category covers in thumbnail_url.
  const articleImage = image && !image.pathname.startsWith('/admin-assets/article-thumbnails/') ? image : undefined;
  const urls = [uploaded ? thumbnail : undefined, articleImage];
  return [...new Set(urls.flatMap((url) => url ? [url.href] : []))];
}

export function articleBodyLines(content: string) {
  return content.split(/\r\n|\r|\n/).map((line) => {
    const heading = /^[\t ]*##(?!#)[\t ]*(\S.*)$/.exec(line);
    return { text: heading?.[1] ?? line, bold: Boolean(heading) };
  });
}
