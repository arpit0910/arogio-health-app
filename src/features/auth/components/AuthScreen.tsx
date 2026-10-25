import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ApiStatusCard } from '../../platform/components/ApiStatusCard';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

interface AuthScreenProps {
  initialTab?: 'login' | 'signup';
}

export function AuthScreen({ initialTab = 'login' }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab);
  const { mockLoginForTesting } = useAuth();

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandHeader}>
          <Text style={styles.brandBadge}>AROGIO HEALTH</Text>
          <Text style={styles.brandTagline}>Your Personal Preventive Health Platform</Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'login' && styles.tabActive]}
            onPress={() => setActiveTab('login')}
          >
            <Text style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}>
              Sign In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'signup' && styles.tabActive]}
            onPress={() => setActiveTab('signup')}
          >
            <Text style={[styles.tabText, activeTab === 'signup' && styles.tabTextActive]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {activeTab === 'login' ? (
            <LoginForm onSwitchToSignup={() => setActiveTab('signup')} />
          ) : (
            <SignupForm onSwitchToLogin={() => setActiveTab('login')} />
          )}
        </View>

        {/* Offline / Instant Demo Simulator for Testing */}
        <View style={styles.demoCard}>
          <View style={styles.demoRow}>
            <View style={styles.demoTextWrap}>
              <Text style={styles.demoTitle}>Offline / Instant App Testing</Text>
              <Text style={styles.demoDesc}>
                Preview dashboard, BMI calculations, and UI states without network setup.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.demoButton}
              onPress={mockLoginForTesting}
              activeOpacity={0.8}
            >
              <Text style={styles.demoButtonText}>Demo Sign-In</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Backend Connectivity Status */}
        <View style={styles.statusSection}>
          <ApiStatusCard />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: '#F7FAF9',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 40,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandBadge: {
    color: '#097C68',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 4,
  },
  brandTagline: {
    color: '#526766',
    fontSize: 14,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      },
    }),
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#097C68',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)',
      },
    }),
  },
  demoCard: {
    marginTop: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  demoTextWrap: {
    flex: 1,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  demoDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  demoButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  demoButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statusSection: {
    marginTop: 20,
  },
});

