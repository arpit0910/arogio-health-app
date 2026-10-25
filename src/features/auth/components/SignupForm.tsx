import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { GoogleSignInButton } from './GoogleSignInButton';

interface SignupFormProps {
  onSwitchToLogin?: () => void;
}

export function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const { register, isSubmitting, error, clearError } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Optional health metrics
  const [showHealthMetrics, setShowHealthMetrics] = useState(false);
  const [heightValue, setHeightValue] = useState('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'in'>('cm');
  const [weightValue, setWeightValue] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');

  const [validationError, setValidationError] = useState<string | null>(null);

  // Password validation checklist
  const hasMinLength = password.length >= 12;
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasLowerCase && hasUpperCase && hasNumber;

  const fillSampleSignup = () => {
    clearError();
    setValidationError(null);
    setFullName('Arogio Health Champion');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setEmail(`champion${randomSuffix}@example.com`);
    setPassword('SecurePassword123!');
    setShowHealthMetrics(true);
    setHeightValue('175');
    setHeightUnit('cm');
    setWeightValue('70.5');
    setWeightUnit('kg');
  };

  const handleSubmit = async () => {
    clearError();
    setValidationError(null);

    if (!email.trim()) {
      setValidationError('Please enter a valid email.');
      return;
    }
    if (!isPasswordValid) {
      setValidationError('Please satisfy all password security requirements.');
      return;
    }

    const payload: {
      email: string;
      password: string;
      fullName?: string;
      heightValue?: number;
      heightUnit?: 'cm' | 'in';
      weightValue?: number;
      weightUnit?: 'kg' | 'lb';
    } = {
      email: email.trim(),
      password,
      fullName: fullName.trim() || undefined,
    };

    if (heightValue.trim()) {
      const parsedH = parseFloat(heightValue);
      if (!isNaN(parsedH)) {
        payload.heightValue = parsedH;
        payload.heightUnit = heightUnit;
      }
    }

    if (weightValue.trim()) {
      const parsedW = parseFloat(weightValue);
      if (!isNaN(parsedW)) {
        payload.weightValue = parsedW;
        payload.weightUnit = weightUnit;
      }
    }

    try {
      await register(payload);
    } catch {
      // Error handled by AuthContext
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>Begin your preventive healthcare journey with Arogio.</Text>

      {/* Quick Test Helper */}
      <View style={styles.sampleBar}>
        <Text style={styles.sampleBarText}>Generate unique test user:</Text>
        <TouchableOpacity onPress={fillSampleSignup} style={styles.fillButton}>
          <Text style={styles.fillButtonText}>Fill Sample</Text>
        </TouchableOpacity>
      </View>

      {(validationError || error) ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{validationError || error}</Text>
        </View>
      ) : null}

      <View style={styles.formGroup}>
        <Text style={styles.label}>Full Name (Optional)</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="e.g. Jane Doe"
          placeholderTextColor="#94A3B8"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={(val) => {
            setEmail(val);
            if (validationError) setValidationError(null);
          }}
          placeholder="person@example.com"
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
          placeholder="At least 12 characters"
          placeholderTextColor="#94A3B8"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Requirements Checklist */}
        <View style={styles.criteriaContainer}>
          <Text style={styles.criteriaHeader}>Password must have:</Text>
          <Text style={[styles.criteriaItem, hasMinLength && styles.criteriaMet]}>
            {hasMinLength ? '✓' : '•'} At least 12 characters
          </Text>
          <Text style={[styles.criteriaItem, hasLowerCase && styles.criteriaMet]}>
            {hasLowerCase ? '✓' : '•'} At least 1 lowercase letter
          </Text>
          <Text style={[styles.criteriaItem, hasUpperCase && styles.criteriaMet]}>
            {hasUpperCase ? '✓' : '•'} At least 1 uppercase letter
          </Text>
          <Text style={[styles.criteriaItem, hasNumber && styles.criteriaMet]}>
            {hasNumber ? '✓' : '•'} At least 1 number
          </Text>
        </View>
      </View>

      {/* Optional Health Profile Toggle */}
      <TouchableOpacity
        style={styles.healthToggle}
        onPress={() => setShowHealthMetrics(!showHealthMetrics)}
      >
        <Text style={styles.healthToggleText}>
          {showHealthMetrics ? '▼ Hide Health Profile (Optional)' : '▶ Add Health Profile (Optional)'}
        </Text>
      </TouchableOpacity>

      {showHealthMetrics ? (
        <View style={styles.healthSection}>
          {/* Height */}
          <View style={styles.healthRow}>
            <View style={styles.healthInputWrap}>
              <Text style={styles.label}>Height</Text>
              <TextInput
                style={styles.input}
                value={heightValue}
                onChangeText={setHeightValue}
                placeholder={heightUnit === 'cm' ? '175' : '68'}
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.unitButtonGroup}>
              <TouchableOpacity
                style={[styles.unitBtn, heightUnit === 'cm' && styles.unitBtnActive]}
                onPress={() => setHeightUnit('cm')}
              >
                <Text style={[styles.unitBtnText, heightUnit === 'cm' && styles.unitBtnTextActive]}>
                  cm
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.unitBtn, heightUnit === 'in' && styles.unitBtnActive]}
                onPress={() => setHeightUnit('in')}
              >
                <Text style={[styles.unitBtnText, heightUnit === 'in' && styles.unitBtnTextActive]}>
                  in
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Weight */}
          <View style={styles.healthRow}>
            <View style={styles.healthInputWrap}>
              <Text style={styles.label}>Weight</Text>
              <TextInput
                style={styles.input}
                value={weightValue}
                onChangeText={setWeightValue}
                placeholder={weightUnit === 'kg' ? '70' : '154'}
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.unitButtonGroup}>
              <TouchableOpacity
                style={[styles.unitBtn, weightUnit === 'kg' && styles.unitBtnActive]}
                onPress={() => setWeightUnit('kg')}
              >
                <Text style={[styles.unitBtnText, weightUnit === 'kg' && styles.unitBtnTextActive]}>
                  kg
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.unitBtn, weightUnit === 'lb' && styles.unitBtnActive]}
                onPress={() => setWeightUnit('lb')}
              >
                <Text style={[styles.unitBtnText, weightUnit === 'lb' && styles.unitBtnTextActive]}>
                  lb
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
        activeOpacity={0.8}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Create Account</Text>
        )}
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or continue with</Text>
        <View style={styles.dividerLine} />
      </View>

      <GoogleSignInButton disabled={isSubmitting} />

      {onSwitchToLogin ? (
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={onSwitchToLogin}>
            <Text style={styles.footerLink}> Sign In</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </ScrollView>
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
  criteriaContainer: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  criteriaHeader: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  criteriaItem: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 2,
  },
  criteriaMet: {
    color: '#059669',
    fontWeight: '600',
  },
  healthToggle: {
    paddingVertical: 8,
    marginBottom: 12,
  },
  healthToggleText: {
    color: '#097C68',
    fontSize: 13,
    fontWeight: '600',
  },
  healthSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  healthRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
    gap: 12,
  },
  healthInputWrap: {
    flex: 1,
  },
  unitButtonGroup: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  unitBtn: {
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  unitBtnActive: {
    backgroundColor: '#097C68',
  },
  unitBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  unitBtnTextActive: {
    color: '#FFFFFF',
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
    marginTop: 20,
    marginBottom: 24,
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

