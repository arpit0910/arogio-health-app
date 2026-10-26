/** Minimal SDK contract keeps native token acquisition independently testable. */
export type NativeGoogleSdk = {
  configure: (options: { webClientId: string; iosClientId?: string; offlineAccess: boolean }) => void;
  hasPlayServices: (options: { showPlayServicesUpdateDialog: boolean }) => Promise<boolean>;
  signIn: () => Promise<
    { type: 'success'; data: { idToken: string | null } } | { type: 'cancelled'; data: null }
  >;
};

export async function getNativeGoogleIdToken({ sdk, webClientId, iosClientId, platform }: {
  sdk: NativeGoogleSdk; webClientId: string; iosClientId?: string; platform: 'android' | 'ios';
}): Promise<string | null> {
  if (!webClientId) throw new Error('Google sign-in requires the configured web client ID.');
  if (platform === 'ios' && !iosClientId) {
    throw new Error('Google sign-in on iPhone requires an iOS client ID and a new app build. You can still sign in with email.');
  }
  sdk.configure({ webClientId, ...(iosClientId ? { iosClientId } : {}), offlineAccess: false });
  if (platform === 'android') {
    const available = await sdk.hasPlayServices({ showPlayServicesUpdateDialog: true });
    if (!available) throw new Error('Google Play Services is unavailable. Please update it and try again.');
  }
  const response = await sdk.signIn();
  if (response.type === 'cancelled') return null;
  if (!response.data.idToken) throw new Error('Google did not return a sign-in token. Please try again.');
  return response.data.idToken;
}
