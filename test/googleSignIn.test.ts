import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { getNativeGoogleIdToken, type NativeGoogleSdk } from '../src/features/auth/api/nativeGoogleSignIn.ts';

function mockSdk(overrides: Partial<NativeGoogleSdk> = {}) {
  const calls: string[] = [];
  const sdk: NativeGoogleSdk = {
    configure: (options) => { calls.push('configure'); assert.equal(options.webClientId, 'shared-web-id'); assert.equal(options.offlineAccess, false); },
    hasPlayServices: async () => { calls.push('play-services'); return true; },
    signIn: async () => { calls.push('sign-in'); return { type: 'success', data: { idToken: 'google-id-token' } }; },
    ...overrides,
  };
  return { sdk, calls };
}

describe('Native Google sign-in', () => {
  it('uses the existing web client ID on Android without requiring an Android client ID', async () => {
    const { sdk, calls } = mockSdk();
    const token = await getNativeGoogleIdToken({ sdk, platform: 'android', webClientId: 'shared-web-id' });
    assert.equal(token, 'google-id-token');
    assert.deepEqual(calls, ['configure', 'play-services', 'sign-in']);
  });

  it('returns cancellation without a token or backend sign-in', async () => {
    const { sdk } = mockSdk({ signIn: async () => ({ type: 'cancelled', data: null }) });
    assert.equal(await getNativeGoogleIdToken({ sdk, platform: 'android', webClientId: 'shared-web-id' }), null);
  });

  it('rejects a successful response with no ID token', async () => {
    const { sdk } = mockSdk({ signIn: async () => ({ type: 'success', data: { idToken: null } }) });
    await assert.rejects(getNativeGoogleIdToken({ sdk, platform: 'android', webClientId: 'shared-web-id' }), /did not return a sign-in token/);
  });

  it('does not launch sign-in when Play Services is unavailable', async () => {
    const { sdk, calls } = mockSdk({ hasPlayServices: async () => false });
    await assert.rejects(getNativeGoogleIdToken({ sdk, platform: 'android', webClientId: 'shared-web-id' }), /Play Services is unavailable/);
    assert.deepEqual(calls, ['configure']);
  });

  it('uses the iOS client ID without checking Android Play Services', async () => {
    const { sdk, calls } = mockSdk();
    let configuredIosId: string | undefined;
    sdk.configure = (options) => { configuredIosId = options.iosClientId; };
    assert.equal(await getNativeGoogleIdToken({ sdk, platform: 'ios', webClientId: 'shared-web-id', iosClientId: 'ios-id' }), 'google-id-token');
    assert.equal(configuredIosId, 'ios-id');
    assert.deepEqual(calls, ['sign-in']);
  });

  it('rejects missing iOS configuration before calling the native SDK', async () => {
    const { sdk, calls } = mockSdk();
    await assert.rejects(getNativeGoogleIdToken({ sdk, platform: 'ios', webClientId: 'shared-web-id' }), /requires an iOS client ID/);
    assert.deepEqual(calls, []);
  });
});

describe('Google native build configuration', () => {
  const require = createRequire(import.meta.url);
  const configureApp = require('../app.config.js');

  it('preserves Android configuration without enabling Firebase plugins', () => {
    const previous = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
    delete process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
    try {
      const config = configureApp({ config: { name: 'Arogio', slug: 'arogio', plugins: ['expo-router'] } });
      assert.deepEqual(config.plugins, ['expo-router']);
    } finally {
      if (previous === undefined) delete process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
      else process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID = previous;
    }
  });

  it('derives the correct iOS callback scheme from the iOS client ID', () => {
    const previous = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID = '123-ios.apps.googleusercontent.com';
    try {
      const config = configureApp({ config: { name: 'Arogio', slug: 'arogio', plugins: [] } });
      assert.deepEqual(config.plugins, [['@react-native-google-signin/google-signin', { iosUrlScheme: 'com.googleusercontent.apps.123-ios' }]]);
    } finally {
      if (previous === undefined) delete process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
      else process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID = previous;
    }
  });
});
