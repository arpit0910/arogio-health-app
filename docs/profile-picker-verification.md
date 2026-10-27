# Profile input verification

Verified on 27 October 2026 with version 1.0.1, Android build 10.

Profile fields now have explicit empty-state prompts for birthday, weight,
height, gender, city and referral source. Optional detail dialogs explain what
to enter. The selected measurement unit uses primary teal (#096E64) with white
text; unselected units retain their light background. Existing conversions and
the supplied profile layout are preserved.

Birthday selection uses the Android system calendar, an iOS date spinner with
Save/Cancel, and a browser date input. Dates are bounded from 1900 to today.
Cancel preserves the previous birthday; saving stores a calendar date in
YYYY-MM-DD format without timezone conversion. Keyboard dismissal prevents a
measurement keyboard from obstructing the date picker or the next step.

Validation completed:

- Lint, TypeScript and all 32 tests pass, including leap-day and birthday
  round trips in Asia/Kolkata, America/Los_Angeles and Pacific/Kiritimati.
- Web production export passes. Isolated headless UI checks pass for
  placeholders, Save/Cancel, future-date rejection, unit styling/conversions,
  returning to personal details, city entry and a 320 × 568 date dialog.
- The signed release APK updates the prior version successfully on API 34.
  Native checks pass for calendar opening, canceling an empty selection,
  saving/reopening a date, canceling an existing selection, placeholders and
  selected lbs/inch states with converted measurements.
- A synthetic account signed in through the APK against production. Continue
  saved the birthday and measurements and advanced to lifestyle. A separate
  test-tool read-back encountered a transient fetch failure; verification then
  cold-restarted the APK, which successfully reloaded the production profile.
  Back showed the saved birthday (1 January 2000) and measurements intact.
  The UI test session was logged out afterward.
- Signature, name, package and build number verified. No debuggable/testOnly
  manifest flag or private env/key/test/doc/source-map entries in the APK.

iOS native rendering and real Google account authorization were not tested in
this change. A new APK is required for the added native date-picker module.
