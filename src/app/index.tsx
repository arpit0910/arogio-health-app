import React from 'react';
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WelcomeScreen } from '../features/auth/components/WelcomeScreen';
import { UserDashboard } from '../features/auth/components/UserDashboard';
import { useAuth } from '../features/auth/context/AuthContext';

export default function HomeScreen() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#097C68" />
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) return <WelcomeScreen />;

  if (!user?.profileCompletedAt) return <Redirect href="/setup-profile" />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <UserDashboard />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7FAF9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
