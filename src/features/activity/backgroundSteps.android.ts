import { requireOptionalNativeModule } from 'expo';
type Counter = {
  startPhoneSteps(owner: string, totals: Record<string, number>): Promise<void>;
  stopPhoneSteps(owner: string, clear: boolean): Promise<void>;
  phoneStepTotals(owner: string): Promise<Record<string, number>>;
  isPhoneStepsRunning?(owner: string): Promise<boolean>;
};
const counter = () => requireOptionalNativeModule<Counter>('ArogioHealthSources');
export async function startPersistentSteps(owner: string, totals: Record<string, number>) {
  const native = counter();
  if (!native?.isPhoneStepsRunning) return false;
  await native.startPhoneSteps(owner, totals);
  for (let attempt = 0; attempt < 20; attempt++) {
    if (await native.isPhoneStepsRunning(owner)) return true;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return false;
}
export async function persistentStepsRunning(owner: string) { return counter()?.isPhoneStepsRunning?.(owner) ?? false; }
export async function stopPersistentSteps(owner: string, clear = false) { await counter()?.stopPhoneSteps(owner, clear); }
export async function persistentStepTotals(owner: string) { return counter()?.phoneStepTotals(owner) ?? null; }
