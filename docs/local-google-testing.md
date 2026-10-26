# Local Google sign-in setup

Confirmed on 2026-10-26:

| Setting | Value |
| --- | --- |
| Android OAuth client | `987857172312-2lpo2lomjmfde8r0kr4k9doeqnkfeb17.apps.googleusercontent.com` |
| Android package | `com.arogio.health` |
| Registered local debug SHA-1 | `6B:D7:02:D6:96:2B:4A:B0:67:06:CD:ED:39:DF:95:69:CA:2E:D9:45` |
| Web client used by app and backend | `987857172312-fil8ani3esi0j9gsg095c6tg1utcbm2j.apps.googleusercontent.com` |
| EAS APK build 4 SHA-1 | `CD:D6:E8:F9:74:AB:F3:E8:1E:65:32:D0:4C:AD:3E:96:6D:BF:EB:B6` |

The local debug SHA-1 was verified with keytool against this computer's `.android/debug.keystore`. Expo's generated template keystore has a different fingerprint, so the local config plugin selects the registered keystore through `AROGIO_LOCAL_DEBUG_KEYSTORE`. No private key is copied into the repository. EAS does not use this local override.

The Android client is registered in Google Cloud. Its ID is not supplied as `webClientId` or accepted as a backend token audience. The Web client ID is used in both places. Register the EAS signing SHA-1 separately before expecting build 4 to authenticate with Google; the local registration does not cover that APK.

## Backend

From `D:/arogio_health_backend`:

```powershell
npm.cmd run build
npm.cmd run start:local:validation
```

This binds `http://127.0.0.1:3001/api/v1`, uses a disposable in-memory database, generates an isolated session-signing secret, and performs real Google ID-token verification. It never connects to the hosted database. Local accounts disappear when the process stops. This runner requires development dependencies and is not a production startup command.

In another terminal:

```powershell
node scripts/smoke-api.mjs http://127.0.0.1:3001/api/v1
node --experimental-strip-types scripts/test-local-app-client.mjs
```

The second command uses the app's actual HTTP client and response schemas for signup, profile setup, resume, review edits, completion, login, refresh, logout and invalid Google-token rejection. It is restricted to loopback addresses. These checks passed; they do not assert a successful real Google account authorization.

## Android app

The ignored `.env.local` sets the local API URL, Web client ID, and absolute path to the registered debug keystore. `.env.local` is excluded from EAS uploads; preview builds keep the production URL from `eas.json`.

Run Expo prebuild after changing the local signing override; do not manually edit generated Android files:

```powershell
npx.cmd expo prebuild --platform android --no-install
npm.cmd run android:local -- --no-bundler --no-install
```

Start Metro for the Android emulator:

```powershell
npm.cmd run start:local
```

The launcher advertises `http://10.0.2.2:8081`, and `.env.local` uses `http://10.0.2.2:3001/api/v1`. This address lets the emulator reach Windows without adb reverse. Open the installed development app and connect to `http://10.0.2.2:8081` if it does not reconnect automatically. Keep both terminal processes running.

The launcher uses Expo CLI offline mode to avoid external Expo service requests during local startup. App API calls and Google authentication still have network access. On this machine, localhost-only Metro bound IPv6 and was unreachable through the emulator's IPv4 host address; online manifest requests also returned HTTP 500. The local launcher resolves both startup problems. This setup targets the Android emulator; physical phones require their own reachable host address.

The APK's Google account chooser and a successful backend session still need to be checked on a device with an actual Google account. Sign into Google yourself; no password or ID token should be pasted into the repository or logs. Expo Go cannot test this native SDK.
