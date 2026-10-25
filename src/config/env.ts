const rawApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const rawGoogleClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID?.trim();

function normalizeUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return undefined;
    return url.toString().replace(/\/$/, '');
  } catch {
    return undefined;
  }
}

export const env = {
  // Default to production backend endpoint from postman environment
  apiUrl: normalizeUrl(rawApiUrl) ?? 'https://backend.arogio.com/api/v1',
  googleClientId:
    rawGoogleClientId ||
    '987857172312-2lpo2lomjmfde8r0kr4k9doeqnkfeb17.apps.googleusercontent.com',
  isDevelopment: __DEV__,
} as const;

export const isApiConfigured = Boolean(env.apiUrl);
