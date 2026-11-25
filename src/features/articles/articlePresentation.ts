export function articleImageCandidates(apiUrl: string, thumbnailUrl?: string, imageUrl?: string) {
  const origin = new URL(apiUrl).origin;
  function resolve(value?: string) {
    const input = value?.trim();
    if (!input) return undefined;
    const isRelative = input.startsWith('/') && !input.startsWith('//');
    if (!isRelative && !/^https?:\/\//i.test(input)) return undefined;
    try {
      const url = new URL(input, apiUrl);
      if (url.username || url.password || (isRelative && url.origin !== origin)) return undefined;
      return url.protocol === 'https:' || (url.protocol === 'http:' && url.origin === origin) ? url : undefined;
    } catch {
      return undefined;
    }
  }

  const thumbnail = resolve(thumbnailUrl);
  const image = resolve(imageUrl);
  const uploaded = thumbnail?.origin === origin && /^\/api\/v1\/public\/articles\/[0-9a-f-]{36}\/thumbnail$/i.test(thumbnail.pathname);
  const urls = uploaded ? [thumbnail, image] : [image, thumbnail];
  return [...new Set(urls.flatMap((url) => url ? [url.href] : []))];
}

export function articleBodyLines(content: string) {
  return content.split(/\r\n|\r|\n/).map((line) => {
    const heading = /^[\t ]*##(?!#)[\t ]*(\S.*)$/.exec(line);
    return { text: heading?.[1] ?? line, bold: Boolean(heading) };
  });
}
