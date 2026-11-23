export const launchDurations = [2400, 3600, 4200] as const;
export function launchAutoAdvance(active: boolean, laidOut: boolean, preferencesReady: boolean, screenReader: boolean) {
  return active && laidOut && preferencesReady && !screenReader;
}
