import { requireOptionalNativeModule } from 'expo';
type Counter = {
  startPhoneSteps(owner: string, totals: Record<string, number>): Promise<void>;
  stopPhoneSteps(owner: string, clear: boolean): Promise<void>;
  phoneStepTotals(owner: string): Promise<Record<string, number>>;
};
const counter = () => requireOptionalNativeModule<Counter>('ArogioHealthSources');
export async function startPersistentSteps(owner: string, totals: Record<string, number>) {
  const native = counter();
  if (!native) return false;
  await native.startPhoneSteps(owner, totals);
  return true;
}
export async function stopPersistentSteps(owner: string, clear = false) { await counter()?.stopPhoneSteps(owner, clear); }
export async function persistentStepTotals(owner: string) { return counter()?.phoneStepTotals(owner) ?? null; }
