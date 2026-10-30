# App usability refinement - 30 October 2026

## Changes

- One shared health connection screen serves both routes. It presents the real installed compatible source list, one Connect action, a visible updating/waiting status, and an Open source app action if data sharing is still needed. Permission and background controls are secondary disclosures. Connecting asks for source-supported read types; existing background access is reused without a second automatic permission prompt. A failed source switch restores the previous preference instead of silently losing it.
- Native discovery now admits only enabled installed apps that declare write access for at least one supported metric. The broad catalog of unsupported apps was removed. The picker also filters capabilities defensively. A writable declaration indicates a supported route, not proof of current records: an authorized source without records has a waiting state, not a claim of successful syncing.
- Home, Health, Activity and connected charts omit metrics without finite, nonnegative recorded values. Real zero readings remain visible. Permission alone does not create a metric tile. History selectors omit metrics with no records, summaries without recorded averages are hidden, and empty charts do not render placeholder cards.
- Activity defaults dynamically to a restored connection rather than staying on the manual mode selected during startup. An explicit user source choice is preserved. Logging, targets and actual readings are distinct. Target editing saves only changed fields, preserves draft values after failure, and checks the returned account snapshot before confirming success. Arogio targets are used consistently against both manual and imported readings.
- Daily target shortcuts open the editor directly from Health apps, Settings and profile preferences. The three common fields are visible first; additional metrics are in a disclosure. Date/source management and deletion are secondary controls.
- Shared headings, spacing, tonal surfaces, disclosure rows and compact care illustrations carry the Home visual system across screens. Water has a direct preferred-serving log action; other amounts are secondary. Add medicine appears before the saved list. Cycle dates now use the active theme palette and selected text uses onPrimary. Explore links to working tools. The active bottom navigation icon has no box/background or additional Jeeva selection border.

## Targets from Samsung Health

The existing Health Connect route does not import Samsung targets. Samsung's Health Data SDK exposes step, active-time, sleep and other goals, but shipping that SDK integration requires Samsung partner approval and a separate implementation. Arogio does not silently copy readings into goals or claim that this integration exists. The app explains that people can enter matching targets while that integration is pending.

Official reference: https://developer.samsung.com/health/data/migration-guide/overview.html (goal types and distribution partnership).

## Verification and limits

Frontend TypeScript, ESLint and 102 tests pass, including capability filtering, zero/missing data, restored source selection, malformed snapshot rejection and save acknowledgements. Five isolated backend HTTP/database wellness journeys pass, including target create/update/clear, repeated saves and account isolation. The public hosted /api/v1/health endpoint returned HTTP 200 with JSON status ok; this is not an authenticated live account save test.

Synthetic React Native Web compositions were rendered and reviewed for connection, activity/targets, Health, Water, Medicines, Cycle and Explore at phone sizes, with additional 320-unit and light-theme checks. Calendar contrast and missing-data display were corrected from these renders. These captures do not establish native permission behavior, physical Samsung data sharing, sound delivery or user retention outcomes. No production backend changes were needed or deployed for this refinement. Samsung target import remains a separate partnership/integration dependency.
