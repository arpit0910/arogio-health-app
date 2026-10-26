# Android test APK

## Latest build - 2026-10-26

Version **1.0.1**, Android build **5**, is a standalone signed APK with the JavaScript bundle included. It does not require Metro or Expo Go.

- [Download build 5](https://expo.dev/artifacts/eas/wVHKk4mTUwgjkBMq-lCgwjSuduTr2dbdWMbCoZYq1RI.apk)
- [EAS build 5](https://expo.dev/accounts/arpit0910/projects/arogio-health-app/builds/6aa56a81-90eb-48dc-9ada-b2ce6bf8ad25)
- Local copy: `dist/arogio-health-1.0.1-build-5.apk` (99,015,907 bytes).
- SHA-256: `a6c87f5ef110603cbb44eaca1becbf5a5f2027e439c783282abcb344091492b5`.

EAS completed successfully. Android apksigner verified the signature; aapt confirmed `com.arogio.health`, versionCode 5, versionName 1.0.1, Android API 24 minimum, and arm64-v8a/armeabi-v7a/x86/x86_64 support. The downloaded APK's embedded bundle contains the production API URL, correct Google Web client ID, and setup route; the emulator API URL is absent. Lint, TypeScript and all 30 app tests passed before upload. Device rendering and successful Google account authentication remain unverified.

The signing SHA-1 is `CD:D6:E8:F9:74:AB:F3:E8:1E:65:32:D0:4C:AD:3E:96:6D:BF:EB:B6`. Register it for `com.arogio.health` in the same Google project as the Web client; the supplied local debug SHA-1 does not cover this APK.

The live production health endpoint was checked again during this build and returned HTTP 200 with `text/plain` containing `It works! NodeJS 22.23.4`. The hosted backend must be deployed/routed correctly before account and profile APIs can work. Rebuilding the APK does not resolve that server response.

An additional local release build was attempted while EAS was queued, but Windows Ninja rejected a generated native path longer than 260 characters. No local release APK was produced; the download above is the successful EAS artifact.

## Previous build 4

Version **1.0.1**, Android build **4**, includes profile setup and the corrected Google Web client.

- [Download APK](https://expo.dev/artifacts/eas/d2mqfmsIjGyz2e5j0IufAU8akfx5R9iILcVPsxpdg3Y.apk)
- [EAS build](https://expo.dev/accounts/arpit0910/projects/arogio-health-app/builds/21f7cc60-972a-4771-9a76-07d919a20b6e)
- APK size: 99,015,907 bytes. Local APK copies and generated build exports were removed after sharing to reclaim disk space; use the download link above.
- SHA-256: `7a4bc5d59f6fee9fe41b4be1e028a73f3a5085c14d55e638456d673018c4a2e9`.

Verified with Android apksigner/aapt: valid signature, package `com.arogio.health`, versionCode 4, versionName 1.0.1, and the same signing SHA-1 documented below. APK archive integrity and bundled setup route, corrected Google client and Google SDK references were checked. This is build/archive verification; device runtime and real Google account authorization remain unverified. Deploy the matching backend and migrations before testing account/setup APIs.

The EAS `preview` profile produces a standalone, signed APK with its JavaScript bundle included. It runs without Metro or Expo Go.

The first successful build is [available on EAS](https://expo.dev/accounts/arpit0910/projects/arogio-health-app/builds/77c958b8-ec59-4ad7-852c-2ae6ab9a93c2). Its local downloaded copy was removed during cleanup. Build completion and archive contents were verified; installation/runtime behavior has not been tested on a physical device.

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
