# Logging visuals and IST clocks

Implemented 28 October 2026 inside the existing Growing Well palette and typography. Follow-up: the app background is now cream white and authentication uses the welcome health SVG; see `launch-screens.md` for the current artwork and splash behavior.

- Login and signup now share the welcome screen health illustration, replacing the initial editorial raster images. Artwork shrinks on compact screens; controls retain their existing touch sizes and keyboard scrolling.
- Water and cycle tracking have illustrated introductions. Water offers one-tap drink amounts and a disclosure for custom amounts, plus serving presets in setup. Cycle check-ins use wrapping icon choices for flow, symptoms, and optional mood. Selected choices expose their state to assistive technology.
- Shared AM/PM inputs replace 24-hour entry on native and web, regardless of the device's clock preference. All user-facing clock strings include IST. Home's current date also uses IST.

## Time contract

`src/lib/time.ts` owns the app timezone (`Asia/Kolkata`) and clock formatting. API clock values remain `HH:mm` and absolute timestamps remain ISO UTC for reliable storage and transport. They are converted to 12-hour IST at the display boundary.

Both repositories now calculate water waking days and schedules in IST. The API normalizes valid timezone inputs from older clients to IST and returns IST settings for legacy plans. Cycle date validation and notification schedules also use IST. Existing wake, bedtime, and reminder clock values are interpreted as IST; saved historical day labels and recorded period dates are preserved. No production database was changed by this work.

Deploy the matching backend changes with the app. Existing scheduled notifications are refreshed when the updated app opens. Notification delivery still depends on device permissions and battery settings.

## Artwork provenance

`assets/illustrations/daily-care.png` was generated with the built-in imagegen tool. It contains four coordinated illustrations displayed as individual quadrants by `CareIllustration`; the original image is preserved. The exact prompt is in `assets/illustrations/daily-care.prompt.txt` and embedded in the PNG metadata. No new dependency was added.

## Verification

App lint, TypeScript, all 52 tests, and an Android JavaScript/assets export passed. Tests include midnight/noon conversion, invalid time inputs, IST midnight boundaries, foreign legacy plans, and cycle reminder instants. Backend lint/build and three wellness HTTP journeys passed against an isolated PGlite database, including new assertions for timezone normalization and log-day assignment. The Android export is under `dist/visual-refresh-android`; it is a bundle validation artifact, not an installable APK.

Rendered verification remains pending: Computer Use stopped because it could not confidently determine the browser URL on Windows. No fresh native screenshots or visual sign-off are claimed. Check login/signup, water setup/logging, and cycle choices at standard and small phone widths, enlarged text, keyboard open, and tablet sizes; verify focus and scrolling, AM/PM entry, successful save feedback, and one-tap log retry/Undo behavior. No APK was built or published by this task.
