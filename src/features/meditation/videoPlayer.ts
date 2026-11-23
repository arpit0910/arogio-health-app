export const playerReferrer = 'https://com.arogio.health';
export function videoEmbedUrl(id: string) {
  if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
  return `https://www.youtube.com/embed/${id}?playsinline=1&rel=0&origin=${encodeURIComponent(playerReferrer)}`;
}
export function allowPlayerNavigation(url: string, topFrame = true) {
  if (!topFrame) return true;
  if (url === 'about:blank') return true;
  try { const parsed = new URL(url); return parsed.protocol === 'https:' && parsed.hostname === 'www.youtube.com' && /^\/embed\/[A-Za-z0-9_-]{11}$/.test(parsed.pathname); } catch { return false; }
}
