# Android test APK

The EAS `preview` profile produces a standalone, signed APK with its JavaScript bundle included. It runs without Metro or Expo Go.

The first successful build is [available on EAS](https://expo.dev/accounts/arpit0910/projects/arogio-health-app/builds/77c958b8-ec59-4ad7-852c-2ae6ab9a93c2). A downloaded copy is saved as `dist/arogio-health-preview.apk` (excluded from Git). Build completion and archive contents were verified; installation/runtime behavior has not been tested on a physical device.

## Test build signing

The first preview build is linked to `@arpit0910/arogio-health-app` (EAS project `74b1d2d2-f785-4933-80a9-bea41803a5fd`). Its Android package is `com.arogio.health`.

Register this signing SHA-1 with the matching Android OAuth client in Google Cloud:

```text
CD:D6:E8:F9:74:AB:F3:E8:1E:65:32:D0:4C:AD:3E:96:6D:BF:EB:B6
```

This is a public certificate fingerprint, not a private signing key. Signing credentials are managed by EAS. Google Play App Signing may use a different certificate for store-distributed builds.

## Build

```bash
npx eas-cli@latest login
npx eas-cli@latest init
npm run check
npx eas-cli@latest build --platform android --profile preview
```

Use the install/download link returned by EAS when the build finishes. The `preview` profile pins `EXPO_PUBLIC_API_URL` to `https://backend.arogio.com/api/v1`, matching the enabled `baseUrl` and `apiPrefix` in `arogio_backend_arogio_com.postman_environment.json`. A contract test verifies this match. Configure Google OAuth variables in the EAS `preview` environment. `.env` is intentionally excluded from uploads.

## API integration

The app includes email registration, email login, Google ID-token login, refresh-token rotation, logout, current-profile retrieval, profile updates through `useAuth().updateProfile`, liveness, and readiness clients. Requests and successful responses are validated against the supplied Postman contracts. Profile updates are exposed to app code; a profile-editing screen is outside the current login/signup work.

The API client handles Bearer authorization, timeouts, JSON validation, backend error messages, and an empty logout response. A successful HTTP response containing a server welcome page is reported as API unavailable.

## Live server check

On 2026-10-25, `GET /health`, `GET /ready`, `GET /users/me` without authorization, and `POST /auth/login` with an empty body all returned HTTP 200 and the same plain-text Node welcome page. This does not satisfy the supplied API contract. The backend deployment or API URL needs correction before real account testing can pass. No test account was created during these checks.

Google login has a separate credential configuration requirement documented in [google-sign-in.md](google-sign-in.md). Register the APK signing certificate with the Android Google OAuth client. Password recovery has no supplied API endpoint and remains an information screen. Legal documents are drafts.

## Test on device

1. Install the APK using the EAS download link and allow installation from that source when Android asks.
2. Register an account, verify password confirmation and consent, and check the signed-in profile.
3. Sign out and sign in again. Test remembered and temporary sessions by restarting the app.
4. Check Google login with an authorized account after configuring its client and signing certificate.
5. Check offline errors, invalid credentials, keyboard behavior, scrolling, and larger text sizes.
