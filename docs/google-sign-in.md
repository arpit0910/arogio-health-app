# Google sign-in

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
