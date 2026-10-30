import type { HealthApp } from './connection';
export async function installedHealthApps(): Promise<HealthApp[]> { return []; }

export async function openHealthApp(_id: string): Promise<void> { throw new Error('Open your health app on your Android phone.'); }
