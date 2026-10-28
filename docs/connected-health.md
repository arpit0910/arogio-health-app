# Connected health and alignment update

## Scope

Health > Connected health reads steps, sleep, heart rate and weight through Android Health Connect. Samsung Health, Google Fit and other source apps must first write their data to Health Connect. This is not a direct Google Fit OAuth or Samsung account integration. Users select types and grant read-only access in Android. No write, background-read or extended-history permissions are requested.

Imported readings stay in screen-session memory. They are never sent through the API client, stored in account/profile fields, persisted to disk, or written back to Health Connect. Sync runs on explicit connection, Sync now, or returning to the active screen while connected. Disconnect clears the view and stops reads; Android access is revoked separately in Health Connect settings. Account changes remount the screen session. No device readings were accessed during development.

## Analytics

- Seven IST calendar days, ending at the current instant.
- Native aggregate queries apply Health Connect source priority instead of summing raw step records.
- Sleep duration is converted from seconds to hours and shown within each calendar-day boundary; it is not labeled as a complete night of sleep.
- Heart rate uses the native measured average. Weight history uses native daily averages, with the latest measurement in the last 30 days separately labeled.
- Missing readings show No data. Real zeros remain zero. Weekly averages include only recorded days and disclose the day count.
- Permissions are checked before and after every sync. Data revoked during a read is removed before display. Failed reads do not retain stale screen values.

## Native setup

Uses react-native-health-connect 4.1.3 and Expo SDK 58 build properties. Native Android rebuild is required; Expo Go and previously built APKs cannot load the new native module. Minimum app SDK is now 26 (Android 8), while usable Health Connect requires Android 9 or later and an available provider. Android 14 includes Health Connect; earlier supported versions may require its Play Store installation.

The custom rationale plugin generates a dedicated activity with accurate data-use text and the app privacy link. It precedes the upstream Health Connect plugin in config order because Expo manifest mods execute in reverse registration order; this lets it retarget the Android 14 permission-usage alias and remove the generic MainActivity rationale route after upstream setup. Generated native folders remain generated, not hand-edited.

Before a Play release, declare these exact four read permissions in Play Console and align the finalized public privacy policy with the implemented data handling. Real Samsung Health/Google Fit sharing, partial grants, OS revocation, and provider install/update require device verification.

## Alignment changes

- Shared TouchTarget preserves a larger requested minimum height. AM/PM and hour/minute fields share a font-aware minimum height and equal vertical padding; AM/PM remain together when controls wrap.
- Profile editing is a labeled pencil touch target beside the name; the lower Edit profile button is removed.
- Stay in the loop descriptions sit below the checkbox/title row, with their left edge aligned to the title.
- The launch wordmark has an explicit full-width text box, horizontal breathing room, and a single-line fit so all six letters of Arogio remain visible. The original logo, cream background and reduced-motion exit remain.

## Verification

Automated analytics tests cover IST boundaries, partial grants, revocation before and during sync, missing versus zero values, and latest weight. Frontend lint and typecheck are required. Native build results are recorded in the build note when complete. Live visual QA is unavailable because the native and browser computer-use hosts are disconnected; no claim of physical-device or rendered layout sign-off is made.

References:
- https://developer.android.com/health-and-fitness/health-connect/get-started
- https://matinzd.github.io/react-native-health-connect/docs/get-started/
- https://docs.expo.dev/versions/v58.0.0/sdk/splash-screen/
