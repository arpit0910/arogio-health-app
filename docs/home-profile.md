# Home, Profile and shared navigation

Visual authority is the first supplied image (`file_000000004a788211b103ca2824128be1.png`): Home, Profile, Edit Profile and the five-item navigation bar. The second image guides profile-editing behavior only. Avatar, hero, shortcut icons and Jeeva artwork in `assets/home` are extracted from the supplied first image; no substitute illustrations are generated.

## Routes and components

- `/` sends signed-in users to `/home` after setup, or `/setup-profile` if setup is incomplete. Email/Google sign-in and setup completion use that same entry decision.
- `(main)` owns Home, Explore, Jeeva AI, Health and Profile tabs.
- `src/navigation/AppNavigation.tsx` owns the reusable navigation bar and tab definitions. `AuthenticatedLayout.tsx` contains the shared account/setup guard.
- `(account)` contains editors, settings and shortcut destinations. Editors have a back header and bottom safe-area handling without the tab bar.
- `features/home` owns Home and the user-approved Coming soon state. Unavailable services do not pretend to offer health records, reminders or AI responses.
- `features/profile` owns profile display, personal/body/photo editing, and health-goal/activity editing. Shared draft/date/unit logic is reused with onboarding.
- `components/app` contains the common screen, avatar and functional icons. The old auth dashboard and mock-login helper were removed.

## Profile API

All paths are under `/api/v1` and require the signed-in user's Bearer token.

| Method | Path | Used for |
| --- | --- | --- |
| GET | `/profile/view` | Restore/display the profile |
| POST | `/profile/create` | First setup save; retries preserve an existing profile |
| PATCH | `/profile/update` | Subsequent setup saves and account edits |

Personal/body/photo edits use one validated PATCH, so a failed request does not partially save the name while losing other edits. The response updates the shared account state. Unsaved input stays on screen for retry. Goal editing preserves unrelated setup data and completion. BMI comes from the API's normalized measurements, and age is calculated from DOB.

Photo selection crops to a square, resizes to 256 × 256 and encodes a bounded JPEG. The backend validates the type/size and stores it in existing profile JSONB. No new database migration or public upload directory is needed.

## Verification and rollout

App lint, TypeScript and 34 tests pass. Backend lint/build, 37 service tests and 22 HTTP journey tests pass. HTTP tests cover the new route names, authentication, create retries, atomic edits, invalid dates, preserving preferences/completion, and compatibility URLs.

The compiled web app was tested in a fresh headless browser against the real disposable local API and database: Home redirect, all tabs, personal/body/photo save, failed-save retry, goals/activity, reload, Coming soon shortcuts, small-screen layout and logout passed. Original account fixtures were synthetic; no production profile was changed.

Android API 34 rendered Home, Profile and Edit Profile through Expo Go with the local API. Native automation was interrupted during later transitions, so this is not a completed native release/photopicker verification. Expo Go's floating developer control is not part of the production UI. Native iOS and physical-device checks remain unverified.

Deploy the updated backend `dist` and restart the hosting Node app **before** distributing a new APK with these profile URLs. Existing APKs retain compatibility through `/users/me*`; the new app uses `/profile/*` only. A new APK is needed for these screens and the photo-picker/manipulator native modules. No new APK was built for this change.
