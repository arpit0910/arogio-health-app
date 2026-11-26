export function resolveMediaUrl(value: string | null | undefined, apiUrl: string): URL | undefined {
  const input = value?.trim();
  if (!input || /[\\\s]/.test(input)) return undefined;
  try {
    const origin = new URL(apiUrl).origin;
    const rootRelative = input.startsWith('/') && !input.startsWith('//');
    if (!rootRelative && !/^https?:\/\//i.test(input)) return undefined;
    // React Native appends relative URLs to the full base path, including /api/v1.
    const url = new URL(rootRelative ? origin + input : input);
    if (url.username || url.password || (rootRelative && url.origin !== origin)) return undefined;
    return url.protocol === 'https:' || (url.protocol === 'http:' && url.origin === origin) ? url : undefined;
  } catch {
    return undefined;
  }
}
