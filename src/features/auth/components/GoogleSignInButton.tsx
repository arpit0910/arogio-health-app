import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { env } from '../../../config/env';
import { useAuth } from '../context/AuthContext';
import { GoogleIcon } from './GoogleIcon';

WebBrowser.maybeCompleteAuthSession();

interface GoogleSignInButtonProps {
  disabled?: boolean;
}

export function GoogleSignInButton({ disabled }: GoogleSignInButtonProps) {
  const { loginWithGoogle, isSubmitting } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [customToken, setCustomToken] = useState('sample-google-id-token');
  const [localError, setLocalError] = useState<string | null>(null);

  const [request, , promptAsync] = Google.useIdTokenAuthRequest({
    clientId: env.googleClientId,
    webClientId: env.googleClientId,
    iosClientId: env.googleClientId,
    androidClientId: env.googleClientId,
  });

  const handleGooglePress = async () => {
    setLocalError(null);
    if (!request) {
      // In development or when redirect URI / credentials are not ready, prompt test token dialog
      setModalVisible(true);
      return;
    }

    try {
      const res = await promptAsync();
      if (res.type === 'success') {
        const idToken = res.params?.id_token;
        if (idToken) {
          await loginWithGoogle(idToken);
        } else {
          setLocalError('No ID token received from Google.');
        }
      } else if (res.type === 'error') {
        setLocalError(res.error?.message ?? 'Google authentication was cancelled or failed.');
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Could not launch Google authentication.');
    }
  };

  const handleCustomTokenSubmit = async () => {
    if (!customToken.trim()) return;
    try {
      setLocalError(null);
      await loginWithGoogle(customToken.trim());
      setModalVisible(false);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Google token sign-in failed.');
    }
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[
          styles.button,
          (disabled || isSubmitting) && styles.buttonDisabled,
        ]}
        onPress={handleGooglePress}
        activeOpacity={0.8}
        disabled={disabled || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#097C68" />
        ) : (
          <>
            <GoogleIcon />
            <Text style={styles.buttonText}>Continue with Google</Text>
          </>
        )}
      </TouchableOpacity>

      {localError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{localError}</Text>
        </View>
      ) : null}

      {/* Testing & Developer shortcut to test Google API endpoint directly */}
      <TouchableOpacity
        style={styles.testLink}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.testLinkText}>⚙️ Test Google Sign-in with ID Token</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Test Google Authentication</Text>
            <Text style={styles.modalSubtitle}>
              Test the `POST /auth/google` API directly using a Google ID token from Postman or Google OAuth playground.
            </Text>

            <Text style={styles.inputLabel}>Google ID Token:</Text>
            <TextInput
              style={styles.input}
              value={customToken}
              onChangeText={setCustomToken}
              placeholder="Paste ID token here..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
                onPress={handleCustomTokenSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit to API</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    width: '100%',
  },
  errorText: {
    color: '#991B1B',
    fontSize: 12,
    textAlign: 'center',
  },
  testLink: {
    marginTop: 10,
    paddingVertical: 4,
  },
  testLinkText: {
    color: '#097C68',
    fontSize: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    width: '100%',
    maxWidth: 440,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
      },
    }),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#102A2A',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#F8FAFC',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#097C68',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

