import { requireOptionalNativeModule } from 'expo';
import { connectableHealthApps, type HealthApp } from './connection';

export async function installedHealthApps(): Promise<HealthApp[]> {
  const native = requireOptionalNativeModule<{ getInstalledHealthApps: () => Promise<HealthApp[]> }>('ArogioHealthSources');
  if (!native) throw new Error('Install the updated Android build to choose a health app.');
  return connectableHealthApps(await native.getInstalledHealthApps());
}

export async function openHealthApp(id: string): Promise<void> {
  const native = requireOptionalNativeModule<{ openHealthApp: (id: string) => Promise<void> }>('ArogioHealthSources');
  if (!native) throw new Error('Open your health app from your phone to enable data sharing.');
  await native.openHealthApp(id);
}
