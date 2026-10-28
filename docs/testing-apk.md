# Android test APK

## Latest build - Arogio Health, Android 12

Version **1.0.1**, Android build **12**, includes the two launch screens and their crossfade, automatic navigation from profile success to Home, the welcome screen without pagination dots, and preference checkboxes matching the terms agreement. The temporary preference preview route is excluded. This is a signed standalone production APK using the hosted backend.

- [Download build 12](https://expo.dev/artifacts/eas/HNgdRN-03W7M-FbS7OKtltsxknJSMLVvjORX7vmtkYc.apk)
- [EAS build 12](https://expo.dev/accounts/arpit0910/projects/arogio-health-app/builds/da7d8b86-8ed9-492f-9fc9-61401f2d97ac)
- Local copy: `dist/arogio-health-1.0.1-build-12.apk` (101,561,173 bytes).
- SHA-256: `891ff5797d105fac37cff71fe7f32da35eed6ce08c7a1ac361d1e42d3e8d6579`.

Lint, TypeScript and all 34 tests pass. EAS completed successfully. Android apksigner verifies the signature and unchanged release SHA-1 `CD:D6:E8:F9:74:AB:F3:E8:1E:65:32:D0:4C:AD:3E:96:6D:BF:EB:B6`; aapt confirms Arogio Health, package `com.arogio.health`, versionCode 12, minimum API 24 and target API 36. Installation and on-device visual verification of this build remain pending.

## Previous build 11

Version **1.0.1**, Android build **11**, is a signed standalone production APK with Home, Profile, shared five-tab navigation, personal/body/photo editing and health-goal/activity editing. It uses the production backend and the new profile URLs.

- [Download build 11](https://expo.dev/artifacts/eas/FHGo3M2v3ergEZFTVeZz6ceQjXIvcidfkgniX2ogwU0.apk)
- [EAS build 11](https://expo.dev/accounts/arpit0910/projects/arogio-health-app/builds/81880888-149c-418e-802f-a23cf5be012c)
- Local copy: `dist/arogio-health-1.0.1-build-11.apk` (99,720,281 bytes).
- SHA-256: `8df08b270f9af00581dbf03340ec4279a4b1c67e8c049264eb9c496b918b9d9c`.

Signature verified, with unchanged release certificate SHA-1 `CD:D6:E8:F9:74:AB:F3:E8:1E:65:32:D0:4C:AD:3E:96:6D:BF:EB:B6`. Manifest confirms Arogio Health, package `com.arogio.health`, versionCode 11, minimum API 24 and target API 36. It has no debug/test-only flag or camera/microphone permission. The 1,353 archive entries contain no env files, signing keys, source maps, tests, docs or node_modules. The bundle contains the production URL, /profile/view, /profile/create, /profile/update, correct Google Web client and both photo modules; the emulator URL is absent. Upload inspection found 138 files totaling 4,496,548 bytes, compressed to 3.6 MB.

App lint, TypeScript and all 34 tests pass. Production liveness/readiness return 200; all three profile URLs are deployed and require authentication. Installed as an update over build 10 on API 34, without Metro or Expo Go. A generated account completed email login, Home/Profile navigation, profile editing, Android scoped photo selection and cropping, native JPEG processing, production photo save/read-back, all tabs/Coming soon states and logout. The saved DOB and BMI remained correct. Test sessions were revoked. A test helper was corrected to accept logout's expected empty HTTP 204 response; no application change was required. The generated test account remains in production.

Google client configuration is embedded, but real Google account authorization remains unverified. Native iOS and physical-device testing remain unverified. The previous local build 10 APK was removed after this verification; its cloud download remains available below.

## Previous build 10

Version **1.0.1**, Android build **10**, adds the native DOB picker, field-specific placeholders, optional-entry guidance and dark teal selected measurement units.

- [Download build 10](https://expo.dev/artifacts/eas/mssU0ovDd2fU4UaKo49GUqEw3nCJjUKeYZsx-3qQ8cE.apk)
- [EAS build 10](https://expo.dev/accounts/arpit0910/projects/arogio-health-app/builds/eb3aa848-0b1f-4717-a326-c55cfaae74e4)
- Local copy: `dist/arogio-health-1.0.1-build-10.apk` (99,355,226 bytes).
- SHA-256: `2ad2872cf14df514a84c1b1e9b87b851bd3b0e1d3391476f01359250f91e4eec`.

Signature, name and package verified; installed as an update on API 34. Native calendar Save/Cancel, placeholders, unit conversion and live production profile save/reload passed. Lint, TypeScript, 32 tests, web export and browser flow checks passed. See [profile-picker-verification.md](./profile-picker-verification.md) for evidence and limits. Real Google account authorization and native iOS rendering remain unverified.

The previous local build 8 APK was removed after verification; its cloud download remains available below.

## Previous build 8

Version **1.0.1**, Android build **8**, is a signed standalone production APK with the **Arogio Health** launcher name and the existing Arogio brand mark as its app icon.

- [Download build 8](https://expo.dev/artifacts/eas/BQnvKCugQoQ54_iqSvoQ53UKi1sxs0CJxyPovzhAJmc.apk)
- [EAS build 8](https://expo.dev/accounts/arpit0910/projects/arogio-health-app/builds/50e4d3f5-9443-4ec9-8fdb-a680bcc2bebc)
- Local copy: `dist/arogio-health-1.0.1-build-8.apk` (98,762,270 bytes).
- SHA-256: `5851d54dfe2e999669955711238fedcd15e1751487b40b99a31b710af0a69331`.

Apksigner verified the unchanged release certificate. Aapt confirmed the name, package `com.arogio.health`, versionCode 8, minimum API 24 and target API 36. The manifest has no debuggable or testOnly flag. The archive's 1,333 entries contain no private env files, signing keys, source maps, tests, docs or node_modules. Its embedded bundle contains the production URL, canonical login/profile-setup paths, eight-character password message and configured Google Web client; emulator URLs and the old twelve-character message are absent.

Installed as an update over build 6 without clearing data on the API 34 emulator. Standalone startup rendered the welcome screen without a development overlay; the app drawer visibly showed the Arogio Health name and unclipped circular launcher icon. App lint, TypeScript and all 31 tests passed. Production liveness/readiness returned HTTP 200. See [release-packaging.md](./release-packaging.md) for upload exclusions and icon generation.

Real Google account authorization remains unverified; the release SHA-1 must be registered in Google Cloud. Build 7 was canceled before completion to correct the adaptive icon's circular safe area. The prior local build 6 APK was removed after build 8 verification; its cloud download remains available.

## Previous build 6

Version **1.0.1**, Android build **6**, includes responsive auth/profile layouts, the eight-character password minimum, and canonical API routes.

- [Download build 6](https://expo.dev/artifacts/eas/XuNHxR_KE6Rz8ioV3xa_HuBb8fOqwq2e-sR_Yo4vI5E.apk)
- [EAS build 6](https://expo.dev/accounts/arpit0910/projects/arogio-health-app/builds/e118c9a6-283f-4f17-b5cb-ea89fbfea1d7)
- Local copy: `dist/arogio-health-1.0.1-build-6.apk` (99,016,855 bytes).
- SHA-256: `1ce0a58ea2b4db8e1636a53d151b9926d8567ecee38e765c7196f0574d450911`.

Android apksigner verified the signature; aapt confirmed package `com.arogio.health`, versionCode 6, versionName 1.0.1, API 24 minimum and all four Android architectures. The downloaded APK bundle contains the production API URL, eight-character message, canonical login/profile-setup paths and the configured Google Web client. The emulator API URL and old twelve-character message are absent.

The signed release APK was installed and launched on the API 34 emulator with the test Metro server stopped; the welcome, login and signup screens rendered without the development overlay. Login/signup fit the normal phone viewport without unnecessary scrolling. Development-build native checks also passed all eight login/signup cases across phone, small-phone, large-text and tablet sizes; see [responsive-layout.md](./responsive-layout.md). App lint, TypeScript and 31 tests pass. The profile dialog was additionally checked with the virtual keyboard visible and Save/Cancel reachable through its bounded scroll view.

Production's canonical liveness/readiness endpoints returned HTTP 200, and invalid-email input confirmed an eight-character password passes server length validation without creating an account. Existing live account-flow verification passed after migrations. Real Google account authorization on the release APK remains unverified. Its SHA-1 is unchanged: `CD:D6:E8:F9:74:AB:F3:E8:1E:65:32:D0:4C:AD:3E:96:6D:BF:EB:B6`; Google Cloud must register that fingerprint for this package in the Web client's project.

## Previous build 5

Version **1.0.1**, Android build **5**, is a standalone signed APK with the JavaScript bundle included. It does not require Metro or Expo Go.

- [Download build 5](https://expo.dev/artifacts/eas/wVHKk4mTUwgjkBMq-lCgwjSuduTr2dbdWMbCoZYq1RI.apk)
- [EAS build 5](https://expo.dev/accounts/arpit0910/projects/arogio-health-app/builds/6aa56a81-90eb-48dc-9ada-b2ce6bf8ad25)
- Size: 99,015,907 bytes. Its older local copy was removed after build 6 verification; the download link remains available on EAS.
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
