import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { GoogleSignInButton } from './GoogleSignInButton';

interface LoginFormProps {
  onSwitchToSignup?: () => void;
}

export function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const { login, isSubmitting, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fillSampleCredentials = () => {
    clearError();
    setValidationError(null);
    setEmail('user@example.com');
    setPassword('SecurePassword123!');
  };

  const handleSubmit = async () => {
    clearError();
    setValidationError(null);

    if (!email.trim()) {
      setValidationError('Please enter your email.');
      return;
    }
    if (!password) {
      setValidationError('Please enter your password.');
      return;
    }

    try {
      await login({ email: email.trim(), password });
    } catch {
      // Error is set in AuthContext
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in to access your personalized health dashboard.</Text>

      {/* Quick Test Helper */}
      <View style={styles.sampleBar}>
        <Text style={styles.sampleBarText}>Testing credentials from Postman:</Text>
        <TouchableOpacity onPress={fillSampleCredentials} style={styles.fillButton}>
          <Text style={styles.fillButtonText}>Fill Sample</Text>
        </TouchableOpacity>
      </View>

      {(validationError || error) ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{validationError || error}</Text>
        </View>
      ) : null}

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={(val) => {
            setEmail(val);
            if (validationError) setValidationError(null);
          }}
          placeholder="user@example.com"
          placeholderTextColor="#94A3B8"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
        />
      </View>

      <View style={styles.formGroup}>
        <View style={styles.passwordHeader}>
          <Text style={styles.label}>Password</Text>
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.showHideText}>{showPassword ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={(val) => {
            setPassword(val);
            if (validationError) setValidationError(null);
          }}
          placeholder="••••••••••••"
          placeholderTextColor="#94A3B8"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
        activeOpacity={0.8}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or continue with</Text>
        <View style={styles.dividerLine} />
      </View>

      <GoogleSignInButton disabled={isSubmitting} />

      {onSwitchToSignup ? (
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don&apos;t have an account?</Text>
          <TouchableOpacity onPress={onSwitchToSignup}>
            <Text style={styles.footerLink}> Sign Up</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#102A2A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#526766',
    lineHeight: 20,
    marginBottom: 20,
  },
  sampleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EDF7F5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D0EBE5',
  },
  sampleBarText: {
    fontSize: 12,
    color: '#097C68',
    fontWeight: '500',
  },
  fillButton: {
    backgroundColor: '#097C68',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  fillButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 13,
    lineHeight: 18,
  },
  formGroup: {
    marginBottom: 16,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  showHideText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#097C68',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  submitButton: {
    height: 48,
    backgroundColor: '#097C68',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
  },
  footerLink: {
    fontSize: 14,
    color: '#097C68',
    fontWeight: '700',
  },
});
