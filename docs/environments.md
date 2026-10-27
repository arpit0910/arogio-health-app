# Local and production environments

Use Node 22 or newer in both repositories. Private `.env`, `.env.local` and
`.env.production` files are ignored by Git. App environment files are also
excluded from EAS upload; EAS profiles explicitly pin their public values.

| Target | API URL | Configuration |
| --- | --- | --- |
| Local Android emulator | `http://10.0.2.2:3001/api/v1` | App `.env.local` and `npm run start:local` |
| Local web | `http://localhost:3001/api/v1` | `npm run web` |
| Production / preview APK | `https://backend.arogio.com/api/v1` | EAS production/preview and `eas.json` |

The shared Google **Web** client is
`987857172312-fil8ani3esi0j9gsg095c6tg1utcbm2j.apps.googleusercontent.com`.
It is used by both app environments and backend `GOOGLE_CLIENT_IDS`.
Android client IDs are registered in Google Cloud, not used as `webClientId`.
No client secret belongs in the mobile app. iOS client configuration remains
empty until an actual iOS OAuth client is supplied.

## Start locally on Windows

First terminal:

```powershell
cd D:\arogio_health_backend
npm.cmd run start:local
```

Second terminal, with a development APK and emulator available:

```powershell
cd D:\arogio-health-app
npm.cmd run start:local
```

For a browser, use `npm.cmd run web` in the app instead. The wrapper selects
localhost for browser API requests and 10.0.2.2 for Android. It sets the Metro
address before Expo reads it. After changing backend code, rerun the backend
command; its prestart step recompiles it. `start:dev` aliases this local mode.

The local API uses the already-installed PGlite development dependency. Its
database is stored in backend `.local/database`, with migrations applied once.
Accounts and JWT sessions survive restarts, using a private local JWT secret.
It never opens the hosted database. Local accounts are independent of production.
`start:local:validation` retains the disposable in-memory mode for temporary QA.
`start:postgres:dev` retains Nest's watch mode for developers with a separately
configured PostgreSQL server.

Local readiness: `http://localhost:3001/api/v1/health/readiness`.
Local Swagger: `http://localhost:3001/api/docs`.

## Production

EAS development, preview and production public values are synchronized with
their build profiles. Preview and production use the hosted API. The app's
`start:production` command starts a development client against that hosted API;
it is not a replacement for a standalone release APK.

Use `npm.cmd run export:production` for a production web export. The wrapper
explicitly reads `.env.production`, disables automatic dotenv reloading and
omits the local signing hook, so `.env.local` cannot override production.

The backend's existing private production database URL and JWT secret were
preserved. `npm start`, `db:diagnose` and `db:migrate:production` load the optional
production file; hosting-manager environment variables retain precedence.
`app.js` defaults to production and Nest selects the corresponding env file.
Deploy updated backend code/`dist` and restart the host to use that loader.
Private env files are not pushed; maintain the existing hosting-manager secrets.
No production migration was run for this setup.

Production CORS origins are `https://arogio.com`, `https://backend.arogio.com`
and `https://app.arogio.com`. Production Swagger is disabled. Public templates
are provided as `.env.local.example` and `.env.production.example` in both repos;
generate a fresh local JWT secret when setting up another machine.

## Google certificate registrations

- Local debug: package `com.arogio.health`, SHA-1
  `6B:D7:02:D6:96:2B:4A:B0:67:06:CD:ED:39:DF:95:69:CA:2E:D9:45`.
- Shared release APK: same package, SHA-1
  `CD:D6:E8:F9:74:AB:F3:E8:1E:65:32:D0:4C:AD:3E:96:6D:BF:EB:B6`.

Both Android registrations must be in the Web client's Google Cloud project.
The supplied Android OAuth client covers the local debug SHA-1. A separate
release registration is still required; environment variables cannot register
that certificate. Build 11 already has the correct Web client and production URL.

## Verification

App lint/typecheck and 34 tests pass. Backend lint/build, 37 tests and 22 HTTP
journey tests pass. Persistent local registration/profile creation, session
validity and login after restart were verified. The production web export
contains the hosted URL and no local emulator/browser API URL. EAS public
environment values and the local debug certificate were read back and verified.
