import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { AuthScreen } from '../features/auth/components/AuthScreen';
import { useAuth } from '../features/auth/context/AuthContext';

export default function LoginRoute() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AuthScreen initialTab="login" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7FAF9',
  },
});

