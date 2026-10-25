import { apiClient } from '../../../services/api/client';
import {
  AuthResponse,
  authResponseSchema,
  GoogleLoginInput,
  LoginInput,
  RegisterInput,
  SafeUser,
  safeUserSchema,
  TokenPair,
  tokenPairSchema,
} from '../types';

export async function registerWithEmailPassword(
  input: RegisterInput,
  signal?: AbortSignal,
): Promise<AuthResponse> {
  const payload: Record<string, unknown> = {
    email: input.email.trim().toLowerCase(),
    password: input.password,
  };
  if (input.fullName && input.fullName.trim()) {
    payload.fullName = input.fullName.trim();
  }
  if (input.heightValue !== undefined) {
    payload.heightValue = input.heightValue;
    payload.heightUnit = input.heightUnit ?? 'cm';
  }
  if (input.weightValue !== undefined) {
    payload.weightValue = input.weightValue;
    payload.weightUnit = input.weightUnit ?? 'kg';
  }

  const response = await apiClient.request<unknown>({
    path: '/auth/register',
    method: 'POST',
    body: payload,
    signal,
  });
  return authResponseSchema.parse(response);
}

export async function loginWithEmailPassword(
  input: LoginInput,
  signal?: AbortSignal,
): Promise<AuthResponse> {
  const response = await apiClient.request<unknown>({
    path: '/auth/login',
    method: 'POST',
    body: {
      email: input.email.trim().toLowerCase(),
      password: input.password,
    },
    signal,
  });
  return authResponseSchema.parse(response);
}

export async function loginWithGoogleIdToken(
  input: GoogleLoginInput,
  signal?: AbortSignal,
): Promise<AuthResponse> {
  const response = await apiClient.request<unknown>({
    path: '/auth/google',
    method: 'POST',
    body: {
      idToken: input.idToken,
    },
    signal,
  });
  return authResponseSchema.parse(response);
}

export async function refreshAuthSession(
  refreshToken: string,
  signal?: AbortSignal,
): Promise<TokenPair> {
  const response = await apiClient.request<unknown>({
    path: '/auth/refresh',
    method: 'POST',
    body: { refreshToken },
    signal,
  });
  return tokenPairSchema.parse(response);
}

export async function logoutAuthSession(
  refreshToken: string,
  signal?: AbortSignal,
): Promise<void> {
  await apiClient.request<void>({
    path: '/auth/logout',
    method: 'POST',
    body: { refreshToken },
    signal,
  });
}

export async function getCurrentUserProfile(signal?: AbortSignal): Promise<SafeUser> {
  const response = await apiClient.request<unknown>({
    path: '/users/me',
    method: 'GET',
    signal,
  });
  return safeUserSchema.parse(response);
}

