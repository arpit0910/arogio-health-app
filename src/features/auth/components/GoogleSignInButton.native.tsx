import { useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Button } from '../../../components/ui/Button';
import { env } from '../../../config/env';
import { useAuth } from '../context/AuthContext';
import { getNativeGoogleIdToken } from '../api/nativeGoogleSignIn';
import { FormError } from './AuthPrimitives';
import { GoogleIcon } from './GoogleIcon';

/** Metro selects this implementation for Android/iOS, keeping native code off web. */
export function GoogleSignInButton({ disabled, referralCode }: { disabled?: boolean; referralCode?: string }) {
  const { loginWithGoogle, isSubmitting, beginExternalSignIn, endExternalSignIn } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);
  const ownsOperation = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (ownsOperation.current) {
        ownsOperation.current = false;
        endExternalSignIn();
      }
    };
  }, [endExternalSignIn]);

  const handlePress = async () => {
    if (pending || isSubmitting || !beginExternalSignIn()) return;
    ownsOperation.current = true;
    setError(null);
    setPending(true);
    try {
      if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
        throw new Error('Google sign-in needs the Arogio development build. Open that app instead of Expo Go.');
      }
      if (Platform.OS === 'ios' && !env.googleIosClientId) {
        throw new Error('Google sign-in on iPhone requires an iOS client ID and a new app build. You can still sign in with email.');
      }
      // Load on tap so an older development client can still open email login.
      const sdk = await import('@react-native-google-signin/google-signin').catch(() => {
        throw new Error('This app build does not include Google sign-in yet. Please install a new Arogio development build.');
      });
      if (!mounted.current) return;
      let idToken: string | null;
      try {
        idToken = await getNativeGoogleIdToken({ sdk: sdk.GoogleSignin, webClientId: env.googleClientId,
          iosClientId: env.googleIosClientId, platform: Platform.OS === 'ios' ? 'ios' : 'android' });
      } catch (nativeError) {
        if (sdk.isErrorWithCode(nativeError)) {
          if (nativeError.code === sdk.statusCodes.SIGN_IN_CANCELLED) return;
          if (nativeError.code === sdk.statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            throw new Error('Google Play Services is unavailable. Please update it and try again.');
          }
          if (nativeError.code === '10' || nativeError.code === 'DEVELOPER_ERROR') {
            throw new Error('Google sign-in is not configured for this app build. Please sign in with email for now.');
          }
        }
        throw nativeError;
      }
      if (!mounted.current || !idToken) return;
      await loginWithGoogle(idToken, referralCode);
    } catch (signInError) {
      if (mounted.current) setError(signInError instanceof Error ? signInError.message : 'Unable to sign in with Google. Please try again.');
    } finally {
      if (ownsOperation.current) {
        ownsOperation.current = false;
        endExternalSignIn();
      }
      if (mounted.current) setPending(false);
    }
  };

  return <View>
    <Button title="Continue with Google" variant="secondary" leading={<GoogleIcon />} onPress={handlePress}
      loading={pending} disabled={disabled || isSubmitting} />
    <FormError message={error} />
  </View>;
}
