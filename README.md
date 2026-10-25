# Arogio Health Mobile

React Native (Expo SDK 58) client for `arogio_health_backend`, built with TypeScript, Expo Router, and feature-first architecture.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the project structure, development builds, EAS setup, environment configuration, and validation commands.

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

## Google Sign-In

- Configured using `expo-auth-session/providers/google` and `expo-web-browser`.
- Google Client ID is configured in `.env` (`EXPO_PUBLIC_GOOGLE_CLIENT_ID`).
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

3. **Built-in Quick-Fill Helpers**:
   - In **Sign In**: Tap **"Fill Sample"** to auto-fill the test credentials from the Postman environment (`user@example.com` / `SecurePassword123!`).
   - In **Sign Up**: Tap **"Fill Sample"** to generate a randomized new test account with BMI height/weight measurements.
   - For **Google Auth**: Tap **"⚙️ Test Google Sign-in with ID Token"** to test `POST /auth/google` directly with sample or developer ID tokens.
   - For **UI Verification**: Tap **"Demo Sign-In"** to preview the dashboard, health metrics, and BMI calculator instantly without requiring live network access.
