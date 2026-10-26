# Arogio Health Mobile

React Native (Expo SDK 58) client for `arogio_health_backend`, built with TypeScript, Expo Router, and feature-first architecture.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the project structure, development builds, EAS setup, environment configuration, and validation commands.

For a standalone Android test build and the live API verification status, see [testing-apk.md](docs/testing-apk.md).

## Start Locally

1. Copy `.env.example` to `.env` (pre-configured with `https://backend.arogio.com/api/v1` and Google OAuth Client ID).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the application:
   ```bash
   npm start        # Open in Expo Go or development build
   npm run web      # Run directly in web browser for rapid testing
   npm test         # Run automated test suite
   npm run typecheck # Validate TypeScript types
   npm run lint     # Lint project
   ```

On Windows PowerShell, if script execution policy blocks `npm.ps1` or `npx.ps1`, use `npm.cmd` and `npx.cmd` (for example, `npm.cmd start`) without changing the execution policy.

For mobile testing, keep the phone and computer on the same network, start Expo with `npm start`, and scan the terminal QR code with a compatible Expo Go installation. Use `npm run android` to open an installed Android emulator. The iOS simulator requires macOS; a physical iPhone can connect to the development server from Windows.

Verify the local setup with:

```bash
npx expo install --check
npm run lint
npm run typecheck
npm test
```

## Authentication & API Integration

The app is mapped directly to the backend contracts found in `arogio_health_api.postman_collection.json` and `arogio_backend_arogio_com.postman_environment.json`:

| Feature | Method & Endpoint | Payload / Details |
|---|---|---|
| **Register** | `POST /auth/register` | `email`, `password` (12+ chars, lower, upper, digit), optional `fullName`, `heightValue`, `heightUnit`, `weightValue`, `weightUnit` |
| **Login** | `POST /auth/login` | `email`, `password` |
| **Google Sign-In** | `POST /auth/google` | `idToken` from Google OAuth |
| **Token Refresh** | `POST /auth/refresh` | `refreshToken` for rotating session tokens |
| **Logout** | `POST /auth/logout` | `refreshToken` to revoke session server-side |
| **Current User** | `GET /users/me` | Bearer token authorization returning `SafeUser` |
| **Update Profile** | `PATCH /users/me` | Name, username, and health measurements through `useAuth().updateProfile` |
| **API Status** | `GET /health`, `GET /ready` | Liveness and dependency readiness |

## Google Sign-In

- Android/iOS use `@react-native-google-signin/google-signin` to open native Google sign-in. Web uses `expo-auth-session/providers/google` and `expo-web-browser`.
- The shared **Web application** OAuth client ID is configured in `.env` (`EXPO_PUBLIC_GOOGLE_CLIENT_ID`). `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, when set, takes precedence. Android does not require a separate client ID variable in JavaScript.
- iOS also requires `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`; `app.config.js` automatically registers its reversed client ID URL scheme without Firebase configuration.
- Deep link scheme `arogiohealth` is configured in `app.json`.

## Testing the Application

1. **Automated Unit & Contract Tests**:
   ```bash
   npm test
   ```
   Runs the test suite verifying authentication schemas, password complexity validation, Bearer token injection, and backend error extraction.

2. **Web Browser Testing**:
   ```bash
   npm run web
   ```
   Opens the app immediately in your browser. Includes cross-platform secure storage fallback.

## Authentication screens

The `/login` and `/signup` screens use the supplied Figma design, local SVG exports in `assets/auth/`, and the shared design tokens in `src/theme/tokens.ts`. Reusable fields, buttons, validation messages, consent controls, and the keyboard-aware layout are kept outside the route directory.

- Email sign-in and registration use the existing backend contracts.
- Sign-up validates password complexity, matching confirmation, and explicit agreement before submission. Consent is currently a client-side requirement; backend policy-version auditing is a future integration.
- Remember me stores session tokens securely on mobile; turning it off keeps tokens in memory for the current session. The web preview uses browser storage for remembered sessions.
- `/terms` and `/privacy` are in-app drafts requiring approval and confirmation of business/backend details before public release.
- `/forgot-password` provides a recovery information screen. Reset emails are not implemented because the backend collection has no recovery endpoint.
- Google sign-in requires a new development build after installing the native module. Expo Go does not include it. See [Google sign-in setup](docs/google-sign-in.md) for Google Cloud registrations and the live verification status.

Run `npm run check` for lint, TypeScript, and the existing contract tests. Verify the screens on compact phones and tablets, with the keyboard open, large accessibility text, a screen reader, and native Back gestures. Browser previews do not establish native correctness or backend capacity.
