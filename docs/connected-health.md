# Connected health and alignment update

## Scope

Home and Health > Connected health use a shared, account-scoped connection. The saved source and Android permissions are restored without another consent prompt when the app opens. The Home connection prompt is permanently hidden after the first successful connection, including after disconnect, permission loss and restart. Steps are plotted there when shared and labeled with the selected source. Connection changes live in Settings > Connected health. Users select exactly one installed Health Connect-compatible source app and choose which read-only types to allow: steps, sleep, heart rate, weight, distance, active energy, total energy, exercise duration, floors climbed, resting heart rate and water intake. Samsung Health, Google Fit and other sources must write records to Health Connect first. Apple Health, web sync and direct source-account integrations are not implemented.

Automatic refresh runs every five minutes while the app is active, across all screens, and immediately on returning to the foreground. Overlapping reads are blocked. Sync never requests permissions; only Connect or Enable background refresh opens Android consent. Sync settings retain an optional Refresh now action. Account-scoped preferences, selected source and the first-connection flag are saved in SecureStore; health readings remain in signed-in app memory unless background refresh is enabled. Going into the background clears the visible snapshot until permissions are checked again. Failed reads clear the view and retry automatically. Disconnect persists an off preference so the next launch cannot silently reconnect.

Optional background refresh uses expo-background-task and expo-task-manager. It requests Health Connect background-read permission separately and schedules a 15-minute minimum interval. Android controls execution and may delay it for battery, system or vendor restrictions. Unsupported or declined background access leaves foreground refresh working. The task is defined at module scope and imported from the root layout so it is available headlessly. A background snapshot is stored in encrypted SecureStore chunks; cache manifests are scoped to the active account and selected source, and grants are checked again before cached data can be displayed. Disconnect and sign-out remove the work authorization, unregister this task and clear cached readings. In-flight results are discarded after authorization, account or source changes. Every native aggregate and latest-weight read supplies a single dataOriginFilter. An unexpected mixed-origin result is discarded rather than used. No device readings are uploaded, written back, or copied into account profile fields. No real device readings were accessed during development.

## Installed source selection

A local Expo module (`modules/health-source-apps`) discovers installed source apps using Android package-manager queries for the Health Connect permissions-rationale and health-permission-usage intents. Eligible source apps declare health write permissions; read-only consumer apps and the Health Connect system provider are excluded. The list uses installed app labels, is not limited to a hardcoded brand list, and is never uploaded. Narrow intent visibility queries replace any need for QUERY_ALL_PACKAGES. Apps that do not integrate with Health Connect cannot be read through this integration.

The picker is a single-choice radio list. Confirming a change immediately stops old reads, clears the displayed overview and encrypted background cache, then commits the new source and reloads only that source. No missing metric falls back to another app. Switching sources does not request data permissions again when the existing grant covers selected data. A removed source stops refreshes and directs the user to Settings. Earlier connections without a selected source are paused until one is selected in Settings; their Home prompt remains hidden.

This native discovery module requires an Android rebuild. Expo autolinking must include `arogio-health-source-apps`. Older APKs show a recoverable update message rather than presenting a fabricated app list.

## Analytics

- Bar charts for daily totals, line charts for heart rate/weight and a pie chart for each day's share of weekly activity totals; daily numeric readings remain available through disclosure. Missing days are gaps, and zero remains zero.
- Seven IST calendar days, ending at the current instant.
- Native aggregate queries apply Health Connect source priority instead of summing raw step records.
- Sleep duration is converted from seconds to hours and shown within each calendar-day boundary; it is not labeled as a complete night of sleep.
- Heart rate uses the native measured average. Weight history uses native daily averages, with the latest measurement in the last 30 days separately labeled.
- Missing readings show No data. Real zeros remain zero. Weekly averages include only recorded days and disclose the day count.
- Permissions are checked before and after every sync. Data revoked during a read is removed before display. Failed reads do not retain stale screen values.

## Native setup

Uses react-native-health-connect 4.1.3 and Expo SDK 58 build properties. Native Android rebuild is required; Expo Go and previously built APKs cannot load the new native module. Minimum app SDK is now 26 (Android 8), while usable Health Connect requires Android 9 or later and an available provider. Android 14 includes Health Connect; earlier supported versions may require its Play Store installation.

The custom rationale plugin generates a dedicated activity with accurate data-use text and the app privacy link. It precedes the upstream Health Connect plugin in config order because Expo manifest mods execute in reverse registration order; this lets it retarget the Android 14 permission-usage alias and remove the generic MainActivity rationale route after upstream setup. Generated native folders remain generated, not hand-edited.

Before a Play release, declare the eleven metric read permissions and optional background-read permission in Play Console and align the finalized public privacy policy with the implemented data handling. Real Samsung Health/Google Fit sharing, partial grants, OS revocation, and provider install/update require device verification.

## Alignment changes

- Shared TouchTarget preserves a larger requested minimum height. AM/PM and hour/minute fields share a font-aware minimum height and equal vertical padding; AM/PM remain together when controls wrap.
- Profile editing is a labeled pencil touch target beside the name; the lower Edit profile button is removed.
- Stay in the loop descriptions sit below the checkbox/title row, with their left edge aligned to the title.
- The launch wordmark has an explicit full-width text box, horizontal breathing room, and a single-line fit so all six letters of Arogio remain visible. The original logo, cream background and reduced-motion exit remain.

## Verification

Automated analytics tests cover IST boundaries, partial grants, revocation before and during sync, missing versus zero values, latest weight, native unit conversions, one-source filtering, legacy preference migration and Home prompt suppression, background scheduling, account cache isolation, failures and disconnect during an in-flight read. Run npm run check for lint, typecheck and the full test suite. scripts/preview-health-charts.cjs renders the shipping chart components with clearly labeled synthetic readings for visual QA; this does not verify native rendering. Native build results are recorded in the build note when complete. Native visual QA remains unavailable because the computer-use hosts cannot start. A standalone SSR chart preview was inspected at phone width with synthetic fixtures (see .impeccable/review/health-charts/phone-fixed.png); it does not establish physical-device or complete screen layout sign-off.

References:
- https://developer.android.com/health-and-fitness/health-connect/get-started
- https://matinzd.github.io/react-native-health-connect/docs/get-started/
- https://docs.expo.dev/versions/v58.0.0/sdk/splash-screen/

## Single-source verification - 29 October 2026

- Lint, TypeScript and all 73 tests pass. Tests cover each native aggregate and latest-weight source filter, rejection of mixed origins, overlapping source reads, background cache/source isolation, changing source during an active background read, and legacy/first-connection Home behavior.
- Expo autolinking resolves the local `arogio-health-source-apps` module. Its `compileDebugKotlin` task passed with the installed Android SDK. The Android JS bundle exported to `dist/health-source-android`.
- Source-picker, settings and empty-state composition previews use synthetic app names in `.impeccable/review/health-sources`. No physical-device installed-app discovery or real health sharing was exercised. A rebuilt Android binary and real-device checks remain required.
