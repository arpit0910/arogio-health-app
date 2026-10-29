import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { tokenStore } from "../../../services/auth/tokenStore";
import {
  applyReferralCode,
  getCurrentUserProfile,
  saveProfileSetup,
  loginWithEmailPassword,
  loginWithGoogleIdToken,
  logoutAuthSession,
  refreshAuthSession,
  registerWithEmailPassword,
  updateCurrentUserProfile,
} from "../api/authApi";
import {
  AuthResponse,
  LoginInput,
  RegisterInput,
  SafeUser,
  UpdateProfileInput,
} from "../types";

interface AuthContextType {
  user: SafeUser | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (data: LoginInput, remember?: boolean) => Promise<AuthResponse>;
  register: (data: RegisterInput) => Promise<AuthResponse>;
  loginWithGoogle: (idToken: string, referralCode?: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  reloadProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileInput) => Promise<SafeUser>;
  applyReferral: (code: string) => Promise<SafeUser>;
  saveSetup: (data: Record<string, unknown>) => Promise<SafeUser>;
  clearError: () => void;
  beginExternalSignIn: () => boolean;
  endExternalSignIn: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [externalSignIn, setExternalSignIn] = useState(false);
  const externalSignInRef = useRef(false);
  const authRequestRef = useRef(false);
  const beginExternalSignIn = useCallback(() => {
    if (externalSignInRef.current || authRequestRef.current) return false;
    externalSignInRef.current = true;
    setExternalSignIn(true);
    return true;
  }, []);
  const endExternalSignIn = useCallback(() => {
    externalSignInRef.current = false;
    setExternalSignIn(false);
  }, []);

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

  const handleAuthSuccess = async (response: AuthResponse, remember = true) => {
    await tokenStore.save(
      {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      },
      remember,
    );
    setUser(response.user);
    setError(null);
  };

  const login = useCallback(
    async (data: LoginInput, remember = true): Promise<AuthResponse> => {
      if (externalSignInRef.current || authRequestRef.current)
        throw new Error("A sign-in request is already in progress.");
      authRequestRef.current = true;
      setIsSubmitting(true);
      setError(null);
      try {
        const result = await loginWithEmailPassword(data);
        await handleAuthSuccess(result, remember);
        return result;
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Login failed. Please check your credentials.";
        setError(msg);
        throw err;
      } finally {
        authRequestRef.current = false;
        setIsSubmitting(false);
      }
    },
    [],
  );

  const register = useCallback(
    async (data: RegisterInput): Promise<AuthResponse> => {
      if (externalSignInRef.current || authRequestRef.current)
        throw new Error("A sign-in request is already in progress.");
      authRequestRef.current = true;
      setIsSubmitting(true);
      setError(null);
      try {
        const result = await registerWithEmailPassword(data);
        await handleAuthSuccess(result);
        return result;
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Registration failed. Please try again.";
        setError(msg);
        throw err;
      } finally {
        authRequestRef.current = false;
        setIsSubmitting(false);
      }
    },
    [],
  );

  const loginWithGoogle = useCallback(
    async (idToken: string, referralCode?: string): Promise<AuthResponse> => {
      if (authRequestRef.current)
        throw new Error("A sign-in request is already in progress.");
      authRequestRef.current = true;
      setIsSubmitting(true);
      setError(null);
      try {
        const result = await loginWithGoogleIdToken({ idToken, referralCode });
        await handleAuthSuccess(result);
        return result;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Google authentication failed.";
        setError(msg);
        throw err;
      } finally {
        authRequestRef.current = false;
        setIsSubmitting(false);
      }
    },
    [],
  );

  const refreshTokens = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const stored = await tokenStore.get();
      if (!stored?.refreshToken) {
        throw new Error("No active session token found to refresh.");
      }
      const renewed = await refreshAuthSession(stored.refreshToken);
      await tokenStore.save({
        accessToken: renewed.accessToken,
        refreshToken: renewed.refreshToken,
      });
      const profile = await getCurrentUserProfile();
      setUser(profile);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Unable to refresh session.";
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
      const msg =
        err instanceof Error ? err.message : "Unable to load profile.";
      setError(msg);
      throw err;
    }
  }, []);

  const updateProfile = useCallback(
    async (data: UpdateProfileInput): Promise<SafeUser> => {
      if (externalSignInRef.current || authRequestRef.current)
        throw new Error("Another account request is already in progress.");
      authRequestRef.current = true;
      setIsSubmitting(true);
      setError(null);
      try {
        const profile = await updateCurrentUserProfile(data);
        setUser(profile);
        return profile;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to update your profile.",
        );
        throw err;
      } finally {
        authRequestRef.current = false;
        setIsSubmitting(false);
      }
    },
    [],
  );

  const applyReferral = useCallback(async (code: string) => {
    const profile = await applyReferralCode(code);
    setUser(profile);
    return profile;
  }, []);

  const saveSetup = useCallback(
    async (data: Record<string, unknown>) => {
      const profile = await saveProfileSetup(data, !user?.profileSetup);
      setUser(profile);
      return profile;
    },
    [user?.profileSetup],
  );

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

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isSubmitting: isSubmitting || externalSignIn,
      error,
      isAuthenticated: Boolean(user),
      login,
      register,
      loginWithGoogle,
      logout,
      refreshTokens,
      reloadProfile,
      updateProfile,
      applyReferral,
      saveSetup,
      clearError,
      beginExternalSignIn,
      endExternalSignIn,
    }),
    [
      user,
      isLoading,
      isSubmitting,
      externalSignIn,
      beginExternalSignIn,
      endExternalSignIn,
      error,
      login,
      register,
      loginWithGoogle,
      logout,
      refreshTokens,
      reloadProfile,
      updateProfile,
      applyReferral,
      saveSetup,
      clearError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
