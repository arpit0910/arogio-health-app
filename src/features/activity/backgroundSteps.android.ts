import { requireNativeModule } from 'expo';
type Counter = {
  startPhoneSteps(owner: string, totals: Record<string, number>): Promise<void>;
  stopPhoneSteps(owner: string, clear: boolean): Promise<void>;
  phoneStepTotals(owner: string): Promise<Record<string, number>>;
};
const counter = () => requireNativeModule<Counter>('ArogioHealthSources');
export async function startPersistentSteps(owner: string, totals: Record<string, number>) {
  await counter().startPhoneSteps(owner, totals);
  return true;
}
export async function stopPersistentSteps(owner: string, clear = false) { await counter().stopPhoneSteps(owner, clear); }
export async function persistentStepTotals(owner: string) { return counter().phoneStepTotals(owner); }
