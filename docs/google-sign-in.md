# Google sign-in

## Current APK diagnosis - build 11

The shared production APK was rechecked after the reported configuration error:

- Package: `com.arogio.health`.
- APK signing SHA-1: `CD:D6:E8:F9:74:AB:F3:E8:1E:65:32:D0:4C:AD:3E:96:6D:BF:EB:B6`.
- Embedded Web client: `987857172312-fil8ani3esi0j9gsg095c6tg1utcbm2j.apps.googleusercontent.com`.
- Supplied Android client: `987857172312-2lpo2lomjmfde8r0kr4k9doeqnkfeb17.apps.googleusercontent.com`. This ID is not embedded as the Web client, which is correct.

The reported message maps specifically to native Google error `10` / `DEVELOPER_ERROR`, before the app receives an ID token or calls the backend. The SDK's Web client configuration is correct in this APK. The user confirmed the Android client currently has package `com.arogio.health` and SHA-1 `6B:D7:02:D6:96:2B:4A:B0:67:06:CD:ED:39:DF:95:69:CA:2E:D9:45`. The package matches, but its registered debug certificate differs from the APK's release certificate. Add a second Android OAuth client for the release package/SHA-1 pair above in the same project as the Web client.

The earlier supplied SHA-1 `6B:D7:02:D6:96:2B:4A:B0:67:06:CD:ED:39:DF:95:69:CA:2E:D9:45` belongs to the local debug build and does not match this release APK. Keep that debug registration and add a separate Android OAuth client for the release package/SHA-1 pair. Do not replace the Web client in app configuration with the Android client ID. Correcting only the Google Cloud package/certificate registration does not change the APK's embedded configuration.

The production backend is now deployed; older deployment-status notes below are historical. Backend Google token verification must continue accepting the Web client audience. Successful real-account Google authorization is not yet verified.

For the verified local debug certificate, supplied Android/Web client IDs, and isolated local API commands, see [local-google-testing.md](local-google-testing.md). The local debug and EAS release signing certificates differ.

The app opens Google authentication directly and sends the resulting ID token to the existing `POST /auth/google` endpoint. Account creation/sign-in and Arogio session storage continue through `AuthContext`. There is no manual ID-token entry.

## Credentials

Use a Google Cloud OAuth client of type **Web application** for `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`. If that variable is unset, the app uses the existing `EXPO_PUBLIC_GOOGLE_CLIENT_ID` for backward compatibility. Native ID tokens use this Web client ID as their server audience. The backend must accept the same audience.

Android uses native Google Sign-In and the shared Web client ID. Register an Android OAuth client in the same Google project for package `com.arogio.health` and the SHA-1 certificate of each app build you test or distribute. The Android OAuth client ID itself is not passed in JavaScript. Register development/EAS signing certificates and the Google Play App Signing certificate as applicable.

For iOS, create an iOS OAuth client for bundle identifier `com.arogio.health` and set `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`. `app.config.js` derives and registers its reversed client ID URL scheme using the Google Sign-In plugin. Without that ID, Android and web still build; iOS email sign-in works, while tapping Google explains the missing configuration.

For web development, register `http://localhost:8081` as both an authorized JavaScript origin and an authorized redirect URI in the Web client configuration. This is the exact redirect captured from the current Expo browser flow, regardless of whether sign-in starts on `/login`, `/signup`, or `/`. Register the matching production HTTPS origin and redirect before deployment. Use a Web client rather than a mobile client for localhost browser authorization.

Apply the same public environment values in the selected EAS environment. Do not add Google client secrets to the app.

## Build and test

```bash
npx eas-cli@latest build --profile development --platform android
npm run start:dev
```

Install the new build, then tap Continue with Google. The SDK must be compiled into the app; restarting Metro or opening Expo Go cannot add it to an existing binary. Choose a Google account and verify the backend creates/restores the Arogio session. Cancellation must return to the form, and Play Services/configuration failures must show a recoverable message. On signup, consent is required first.

Use `npm run web` to test the browser flow. The test suite covers native SDK configuration, ID-token extraction, cancellation, missing tokens, Play Services, and iOS callback configuration. These tests use a fake SDK and do not assert real provider authorization.

## Live verification status

On 2026-10-25, the supplied installed-app client was replaced with Web client ID 987857172312-fil8ani3esi0j9gsg095c6tg1utcbm2j.apps.googleusercontent.com in local and EAS build configuration. The local backend accepts that audience. A browser authorization attempt recognizes the new client but reports redirect_uri_mismatch until localhost is registered; this is separate from native Android authentication.

Real Google sign-in remains unverified. The deployed API still returns the hosting sample page and must be restarted with the actual Nest application. Confirm the Android OAuth registration for package com.arogio.health and release SHA-1 CD:D6:E8:F9:74:AB:F3:E8:1E:65:32:D0:4C:AD:3E:96:6D:BF:EB:B6. No client secret is included in the app.

References: [Expo Google authentication](https://docs.expo.dev/guides/google-authentication/), [native SDK configuration](https://react-native-google-signin.github.io/docs/original), [Expo plugin setup](https://react-native-google-signin.github.io/docs/setting-up/expo), [Google loopback migration](https://developers.google.com/identity/protocols/oauth2/resources/loopback-migration).

## 2026-10-26 verification

The supplied downloaded OAuth JSON is a Web client for project `arogio-health`, matching `987857172312-fil8ani3esi0j9gsg095c6tg1utcbm2j.apps.googleusercontent.com`. Its secret is unnecessary for the mobile flow and was not copied into code. The file has no registered browser origins or redirect URIs; configure those in Google Cloud before browser authorization can succeed. Android OAuth registration with the package/signing SHA-1 remains unconfirmed.

The existing preview APK was inspected with apksigner and aapt: package and SHA-1 match the values above, but the APK predates the setup route and contains the old client ID. Build a new preview APK after backend deployment. The hosted API still returns the sample page or HTML 503 responses.

New backend HTTP journeys exercise actual RSA verification with a synthetic certificate set, new/restored Google identities and full profile completion. These do not represent real Google account authorization or a device test. See `D:/arogio_health_backend/RELEASE_CHECK.md`.
