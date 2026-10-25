import React from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native';
import { AuthScreen } from '../features/auth/components/AuthScreen';
import { UserDashboard } from '../features/auth/components/UserDashboard';
import { useAuth } from '../features/auth/context/AuthContext';

export default function HomeScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#097C68" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {isAuthenticated ? <UserDashboard /> : <AuthScreen />}
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
