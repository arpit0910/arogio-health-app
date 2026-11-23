import type { MedicineNotificationAction } from './medicineNotificationAction';
type State = { pending: MedicineNotificationAction[]; handled: string[] };
// Persist before acknowledging a native response. Receipts prevent cold-start replay.
export function createMedicineActionQueue(storage: { get: (key: string) => Promise<string | null>; set: (key: string, value: string) => Promise<void> }) {
  let serial: Promise<unknown> = Promise.resolve();
  const key = (owner: string) => `arogio.medicine-actions.${owner}`;
  async function read(owner: string): Promise<State> {
    const raw = await storage.get(key(owner));
    if (!raw) return { pending: [], handled: [] };
    const state = JSON.parse(raw) as State;
    if (!Array.isArray(state.pending) || !Array.isArray(state.handled)) throw new Error('Unable to read saved medicine actions.');
    return state;
  }
  function mutate(owner: string, change: (state: State) => void) {
    const task = serial.catch(() => {}).then(async () => { const state = await read(owner); change(state); await storage.set(key(owner), JSON.stringify(state)); });
    serial = task; return task;
  }
  return {
    enqueue: (item: MedicineNotificationAction) => mutate(item.owner, state => {
      if (!state.handled.includes(item.id) && !state.pending.some(prior => prior.id === item.id)) state.pending.push(item);
    }),
    list: async (owner: string) => { await serial.catch(() => {}); return (await read(owner)).pending.filter(item => item.owner === owner); },
    complete: (owner: string, id: string) => mutate(owner, state => {
      state.pending = state.pending.filter(item => item.id !== id);
      state.handled = [...state.handled.filter(item => item !== id), id].slice(-100);
    }),
  };
}
