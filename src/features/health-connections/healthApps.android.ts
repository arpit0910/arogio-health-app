import { requireOptionalNativeModule } from 'expo';
import { isHealthApp, type HealthApp } from './connection';
import { healthRead } from './model';

export async function installedHealthApps(): Promise<HealthApp[]> {
  const native = requireOptionalNativeModule<{ getInstalledHealthApps: () => Promise<HealthApp[]> }>('ArogioHealthSources');
  if (!native) throw new Error('Install the updated Android build to choose a health app.');
  return (await healthRead(native.getInstalledHealthApps())).filter(isHealthApp);
}

export async function openHealthApp(id: string): Promise<void> {
  const native = requireOptionalNativeModule<{ openHealthApp: (id: string) => Promise<void> }>('ArogioHealthSources');
  if (!native) throw new Error('Open your health app from your phone to enable data sharing.');
  await native.openHealthApp(id);
}
