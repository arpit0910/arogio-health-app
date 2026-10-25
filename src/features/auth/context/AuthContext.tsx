import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { tokenStore } from '../../../services/auth/tokenStore';
import {
  getCurrentUserProfile,
  loginWithEmailPassword,
  loginWithGoogleIdToken,
  logoutAuthSession,
  refreshAuthSession,
  registerWithEmailPassword,
} from '../api/authApi';
import { AuthResponse, LoginInput, RegisterInput, SafeUser } from '../types';

interface AuthContextType {
  user: SafeUser | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (data: LoginInput) => Promise<AuthResponse>;
  register: (data: RegisterInput) => Promise<AuthResponse>;
  loginWithGoogle: (idToken: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  reloadProfile: () => Promise<void>;
  clearError: () => void;
  mockLoginForTesting: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    let isMounted = true;

    async function initializeSession() {
      try {
        const stored = await tokenStore.get();
        if (!stored) {
          if (isMounted) setIsLoading(false);
          return;
        }

        try {
          const profile = await getCurrentUserProfile();
          if (isMounted) setUser(profile);
        } catch {
          // Try refreshing token once if access token expired
          try {
            const renewed = await refreshAuthSession(stored.refreshToken);
            await tokenStore.save({
              accessToken: renewed.accessToken,
              refreshToken: renewed.refreshToken,
            });
            const profile = await getCurrentUserProfile();
            if (isMounted) setUser(profile);
          } catch {
            await tokenStore.clear();
            if (isMounted) setUser(null);
          }
        }
      } catch {
        await tokenStore.clear();
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initializeSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAuthSuccess = async (response: AuthResponse) => {
    await tokenStore.save({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    });
    setUser(response.user);
    setError(null);
  };

  const login = useCallback(async (data: LoginInput): Promise<AuthResponse> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await loginWithEmailPassword(data);
      await handleAuthSuccess(result);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterInput): Promise<AuthResponse> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await registerWithEmailPassword(data);
      await handleAuthSuccess(result);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string): Promise<AuthResponse> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await loginWithGoogleIdToken({ idToken });
      await handleAuthSuccess(result);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google authentication failed.';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const refreshTokens = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const stored = await tokenStore.get();
      if (!stored?.refreshToken) {
        throw new Error('No active session token found to refresh.');
      }
      const renewed = await refreshAuthSession(stored.refreshToken);
      await tokenStore.save({
        accessToken: renewed.accessToken,
        refreshToken: renewed.refreshToken,
      });
      const profile = await getCurrentUserProfile();
      setUser(profile);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to refresh session.';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const reloadProfile = useCallback(async () => {
    try {
      const profile = await getCurrentUserProfile();
      setUser(profile);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to load profile.';
      setError(msg);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const stored = await tokenStore.get();
      if (stored?.refreshToken) {
        await logoutAuthSession(stored.refreshToken).catch(() => {
          // Ignore network errors on logout
        });
      }
    } finally {
      await tokenStore.clear();
      setUser(null);
      setError(null);
      setIsSubmitting(false);
    }
  }, []);

  // For testing without live backend or when verifying UI states
  const mockLoginForTesting = useCallback(async () => {
    const mockUser: SafeUser = {
      id: 'test-user-uuid-1234',
      fullName: 'Alex River (Test User)',
      username: 'alex_river',
      email: 'alex.river@example.com',
      mobileNumber: '+1 555-0199',
      heightValue: 175,
      heightUnit: 'cm',
      weightValue: 70,
      weightUnit: 'kg',
      bmi: 22.9,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await tokenStore.save({
      accessToken: 'test-mock-access-token',
      refreshToken: 'test-mock-refresh-token',
    });
    setUser(mockUser);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isSubmitting,
      error,
      isAuthenticated: Boolean(user),
      login,
      register,
      loginWithGoogle,
      logout,
      refreshTokens,
      reloadProfile,
      clearError,
      mockLoginForTesting,
    }),
    [
      user,
      isLoading,
      isSubmitting,
      error,
      login,
      register,
      loginWithGoogle,
      logout,
      refreshTokens,
      reloadProfile,
      clearError,
      mockLoginForTesting,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

