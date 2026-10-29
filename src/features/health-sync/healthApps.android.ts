import { requireOptionalNativeModule } from 'expo';
import type { HealthApp } from './connection';

export async function installedHealthApps(): Promise<HealthApp[]> {
  const native = requireOptionalNativeModule<{ getInstalledHealthApps: () => Promise<HealthApp[]> }>('ArogioHealthSources');
  if (!native) throw new Error('Install the updated Android build to choose a health app.');
  return native.getInstalledHealthApps();
}
