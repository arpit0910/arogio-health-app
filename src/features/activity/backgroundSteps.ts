export async function startPersistentSteps(_owner: string, _totals: Record<string, number>) { return false; }
export async function stopPersistentSteps(_owner: string, _clear = false) {}
export async function persistentStepTotals(_owner: string): Promise<Record<string, number> | null> { return null; }
