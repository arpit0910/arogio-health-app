import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ApiStatusCard } from '../../platform/components/ApiStatusCard';
import { useAuth } from '../context/AuthContext';

function getBmiCategory(bmi: number | null | undefined): { label: string; color: string } {
  if (!bmi) return { label: 'Not calculated', color: '#64748B' };
  if (bmi < 18.5) return { label: 'Underweight', color: '#3B82F6' };
  if (bmi < 25) return { label: 'Optimal / Normal', color: '#10B981' };
  if (bmi < 30) return { label: 'Overweight', color: '#F59E0B' };
  return { label: 'Obese', color: '#EF4444' };
}

export function UserDashboard() {
  const { user, logout, refreshTokens, reloadProfile, isSubmitting } = useAuth();
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  if (!user) return null;

  const bmiInfo = getBmiCategory(user.bmi);

  const handleRefreshTokens = async () => {
    try {
      setActionSuccess(null);
      await refreshTokens();
      setActionSuccess('✓ Session tokens successfully rotated via POST /auth/refresh');
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Token refresh failed.';
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Error', msg);
      }
    }
  };

  const handleReloadProfile = async () => {
    try {
      setActionSuccess(null);
      await reloadProfile();
      setActionSuccess('✓ User profile reloaded via GET /users/me');
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Reload failed.';
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Error', msg);
      }
    }
  };

  return (
    <ScrollView bounces={false} alwaysBounceVertical={false} overScrollMode="never" style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user.fullName || user.email || 'A').slice(0, 1).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user.fullName || user.email || 'User'}</Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{user.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {actionSuccess ? (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>{actionSuccess}</Text>
        </View>
      ) : null}

      {/* Health Metrics Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Personal Health Metrics</Text>
        <Text style={styles.cardSubtitle}>
          Derived measurements recorded on your Arogio profile
        </Text>

        <View style={styles.metricsGrid}>
          {/* Height */}
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Height</Text>
            <Text style={styles.metricValue}>
              {user.heightValue ? `${user.heightValue} ${user.heightUnit ?? 'cm'}` : '—'}
            </Text>
          </View>

          {/* Weight */}
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Weight</Text>
            <Text style={styles.metricValue}>
              {user.weightValue ? `${user.weightValue} ${user.weightUnit ?? 'kg'}` : '—'}
            </Text>
          </View>

          {/* BMI */}
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Body Mass Index</Text>
            <Text style={styles.metricValue}>{user.bmi ? user.bmi : '—'}</Text>
            <Text style={[styles.bmiBadge, { color: bmiInfo.color }]}>{bmiInfo.label}</Text>
          </View>
        </View>
      </View>

      {/* Account Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>User ID</Text>
          <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
            {user.id}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user.email || 'None'}</Text>
        </View>
        {user.username ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Username</Text>
            <Text style={styles.infoValue}>@{user.username}</Text>
          </View>
        ) : null}
      </View>

      {/* Testing & Verification Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>API Testing Tools</Text>
        <Text style={styles.cardSubtitle}>
          Verify backend session token rotation and profile synchronization endpoints:
        </Text>

        <View style={styles.actionButtonGroup}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleRefreshTokens}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#097C68" />
            ) : (
              <Text style={styles.actionButtonText}>🔄 Test POST /auth/refresh</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleReloadProfile}
            disabled={isSubmitting}
          >
            <Text style={styles.actionButtonText}>👤 Test GET /users/me</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Live Backend Connection Status */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Platform Connectivity</Text>
        <ApiStatusCard />
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={logout}
        disabled={isSubmitting}
        activeOpacity={0.8}
      >
        <Text style={styles.logoutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAF9',
  },
  content: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#097C68',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  headerTextWrap: {
    flex: 1,
  },
  greeting: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#102A2A',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: '#DEF7EC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.5,
  },
  successBanner: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    color: '#065F46',
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      },
    }),
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#102A2A',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
    lineHeight: 18,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#102A2A',
  },
  bmiBadge: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: '#102A2A',
    fontWeight: '600',
    maxWidth: '65%',
  },
  actionButtonGroup: {
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#166534',
    fontSize: 13,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  logoutButtonText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '600',
  },
});

