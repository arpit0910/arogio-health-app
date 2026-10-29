import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { exchangeCodeAsync } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Button } from '../../../components/ui/Button';
import { env } from '../../../config/env';
import { useAuth } from '../context/AuthContext';
import { FormError } from './AuthPrimitives';
import { GoogleIcon } from './GoogleIcon';

WebBrowser.maybeCompleteAuthSession();

export function GoogleSignInButton({ disabled, referralCode }: { disabled?: boolean; referralCode?: string }) {
  const [configurationError, setConfigurationError] = useState(false);
  // Android and iOS use GoogleSignInButton.native.tsx via Metro resolution.
  const clientId = env.googleClientId;
  if (!clientId) return <View>
    <Button title="Continue with Google" variant="secondary" leading={<GoogleIcon />} disabled={disabled}
      onPress={() => setConfigurationError(true)} />
    <FormError message={configurationError ? 'Google sign-in is not available on this device yet. Please sign in with email.' : null} />
  </View>;
  return <ConfiguredGoogleSignInButton disabled={disabled} clientId={clientId} referralCode={referralCode} />;
}

function ConfiguredGoogleSignInButton({ disabled, clientId, referralCode }: { disabled?: boolean; clientId: string; referralCode?: string }) {
  const { loginWithGoogle, isSubmitting, beginExternalSignIn, endExternalSignIn } = useAuth();
  const mounted = useRef(true);
  const ownsOperation = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (ownsOperation.current) { ownsOperation.current = false; endExternalSignIn(); }
    };
  }, [endExternalSignIn]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [request, , promptAsync] = Google.useIdTokenAuthRequest({
    clientId,
    webClientId: clientId,
    iosClientId: clientId,
    androidClientId: clientId,
    shouldAutoExchangeCode: false,
  });
  const handlePress = async () => {
    if (pending || isSubmitting || !beginExternalSignIn()) return;
    ownsOperation.current = true;
    setError(null); setPending(true);
    try {
      const result = await promptAsync();
      if (!mounted.current) return;
      if (result.type === 'success') {
        let idToken: string | undefined = result.params.id_token ?? result.authentication?.idToken;
        if (!idToken && result.params.code && request) {
          const tokens = await exchangeCodeAsync({ clientId, code: result.params.code, redirectUri: request.redirectUri,
            extraParams: { code_verifier: request.codeVerifier ?? '' } }, Google.discovery);
          idToken = tokens.idToken;
        }
        if (!mounted.current) return;
        if (!idToken) throw new Error('Google did not return a sign-in token. Please try again.');
        await loginWithGoogle(idToken, referralCode);
      } else if (result.type === 'error') {
        setError('Google sign-in could not complete. Please try again or use your email.');
      }
    } catch { if (mounted.current) setError('Unable to sign in with Google. Please try again or use your email.'); }
    finally {
      if (ownsOperation.current) { ownsOperation.current = false; endExternalSignIn(); }
      if (mounted.current) setPending(false);
    }
  };
  return <View><Button title="Continue with Google" variant="secondary" leading={<GoogleIcon />}
    onPress={handlePress} loading={pending} disabled={disabled || isSubmitting || !request} /><FormError message={error} /></View>;
}
