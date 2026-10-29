import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { AppState } from 'react-native';
import { useAuth } from '../auth/context/AuthContext';
import { loadInbox, observeInbox, readInbox } from './storage';
import type { InboxItem } from './model';
const Context = createContext({ items: [] as InboxItem[], loading: true, error: '', markRead: async (_id?: string) => {} });
export const useInbox = () => useContext(Context);
export function InboxProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  return <InboxSession key={user?.id ?? 'out'} owner={user?.id ?? null}>{children}</InboxSession>;
}
function InboxSession({ owner, children }: PropsWithChildren<{ owner: string | null }>) {
  const [items, setItems] = useState<InboxItem[]>([]), [loading, setLoading] = useState(true), [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    const refresh = () => { if (owner) void loadInbox(owner).then(next => { if (alive) { setItems(next); setError(''); } }).catch(() => { if (alive) setError('Notifications could not be loaded. Reopen this page to try again.'); }).finally(() => { if (alive) setLoading(false); }); else setLoading(false); };
    refresh();
    const stop = owner ? observeInbox(owner, refresh) : () => {};
    const interval = setInterval(refresh, 30000);
    const app = AppState.addEventListener('change', state => { if (state === 'active') refresh(); });
    return () => { alive = false; stop(); clearInterval(interval); app.remove(); };
  }, [owner]);
  const markRead = useCallback(async (id?: string) => { if (!owner) return; try { await readInbox(owner, id); setItems(await loadInbox(owner)); setError(''); } catch { setError('Could not mark notifications as read. Please try again.'); } }, [owner]);
  return <Context.Provider value={{ items, loading, error, markRead }}>{children}</Context.Provider>;
}
