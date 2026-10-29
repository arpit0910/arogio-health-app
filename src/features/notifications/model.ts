export type InboxItem = { id: string; title: string; body: string; at: number; route: '/water' | '/medicines' | '/cycle'; read: boolean };
export function mergeInbox(items: InboxItem[], incoming: InboxItem[], now = Date.now()) {
  const all = new Map(items.map(item => [item.id, item]));
  for (const item of incoming) all.set(item.id, { ...item, read: (all.get(item.id)?.read || item.read) });
  const recent = [...all.values()].filter(item => item.at > now - 90 * 86400000).sort((a, b) => b.at - a.at);
  return [...recent.filter(item => item.at > now).slice(0, 60), ...recent.filter(item => item.at <= now).slice(0, 120)];
}
