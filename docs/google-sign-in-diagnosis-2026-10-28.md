# Google sign-in diagnosis — 2026-10-28

Inspected distributed APK build 12 (`dist/arogio-health-1.0.1-build-12.apk`), current native acquisition code and backend verifier.

## Verified

- APK application ID: `com.arogio.health` (aapt).
- Signing certificate SHA-1: `CD:D6:E8:F9:74:AB:F3:E8:1E:65:32:D0:4C:AD:3E:96:6D:BF:EB:B6` (apksigner).
- The APK embeds the shared Web OAuth client `987857172312-fil8ani3esi0j9gsg095c6tg1utcbm2j.apps.googleusercontent.com`, the production API URL, and native Google SDK references.
- Native code correctly passes the Web client as `webClientId`; Android OAuth client IDs are not substituted for it.
- Both local `.env.production` and `.env.local` backend files include this Web client in `GOOGLE_CLIENT_IDS`; hosted runtime values were not accessed.
- Live `GET https://backend.arogio.com/api/v1/health` returned HTTP 200 JSON.
- Live `POST /api/v1/auth/google/login` with an intentionally invalid diagnostic token returned HTTP 401 JSON with `INVALID_GOOGLE_TOKEN`. This proves routing/rejection behavior, not successful real-Google-token acceptance or the deployed audience configuration.
- The sanitized live request monitor showed only this diagnostic Google-login request in its recent window. It did not establish the failure stage of the user's current device attempt.

## Earlier confirmed mismatch

Follow-up: the user reports that the account picker opens and then displays “Google sign in not active use email instead.” This resembles the native configuration fallback for `10` / `DEVELOPER_ERROR`; the wording is a user transcription rather than a captured native error code. A subsequent sanitized production-monitor check still showed only our earlier invalid-token probe, with no new Google-login request in its recent window. Together these point toward native authorization failing before the backend, while the current Cloud registration and raw native error remain unverified.

`docs/google-sign-in.md` records a prior user-confirmed Android registration using debug SHA-1 `6B:D7:02:D6:96:2B:4A:B0:67:06:CD:ED:39:DF:95:69:CA:2E:D9:45`. It differs from the release APK's signing certificate. The live Google Cloud registration has not been accessed in this diagnosis, so whether the release pair has since been added remains unverified.

For error `10` / `DEVELOPER_ERROR`, register an **Android** OAuth client in the same Google project as the shared Web client, with:

```text
Package: com.arogio.health
SHA-1: CD:D6:E8:F9:74:AB:F3:E8:1E:65:32:D0:4C:AD:3E:96:6D:BF:EB:B6
```

Retain the debug registration. Do not change the Web client ID to an Android ID, expose client secrets, or weaken server token verification. Adding the matching Google Cloud registration alone does not require rebuilding an APK whose package, certificate and Web client are already correct.

## Distinguish the failure stage

- Native configuration error before a token: inspect Android package/certificate registration and shared Web client's project.
- `INVALID_GOOGLE_TOKEN` after account selection: inspect deployed `GOOGLE_CLIENT_IDS` and token-verification failure without logging the token. The allowed audience must include the shared Web client.
- `ACCOUNT_LINK_REQUIRED`: an email/password account already uses this Google email; the backend intentionally refuses automatic linking based only on an email match. An authenticated linking flow is a separate feature; weakening this check is not a safe fix.
- Browser OAuth error: inspect browser origin/redirect registration separately; native Android uses the native SDK.

The current exact on-device error and live Cloud registration are needed to confirm which path applies. No successful real Google authorization or Cloud change is claimed.

Reference: [Google Sign-In library troubleshooting](https://react-native-google-signin.github.io/docs/troubleshooting).
