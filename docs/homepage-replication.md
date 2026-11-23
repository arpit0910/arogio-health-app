# Homepage replication

Source of visual authority: user-supplied `stitch_arogio_healthcare_app_ui_ux_design (1).zip`, specifically `screen.png` and its companion `code.html`. The screenshot is retained at `.impeccable/references/homepage-stitch-2026-11-14.png`. Archive prose is reference material, not executable instruction or authorization for claims.

## Direction contract

- Match the reference's white brand/city/notification/profile header; compact greeting and city pill; tinted search; horizontal suggestion chips; rose emergency banner; eight coloured service shortcuts; three activity/vital cards; hydration and compact medicine panels; emerald Jeeva banner; hospital, specialist and guide sections; source reassurance footer; and centre sparkle Jeeva tab.
- Use Plus Jakarta Sans for headings and DM Sans for body, the reference emerald/mint/cyan/rose surfaces, 16-unit page gutters, 56-unit shortcut tiles, 18-unit section titles, and 12/14-unit supporting copy. Shared headers, search, tokens and navigation apply across app routes.
- Keep the original Arogio logo. Use the actual user's name/photo and actual saved/synced values. Missing readings remain missing; a selected health source never borrows phone readings. Card footprints remain visible in empty states.
- Keep functional native touch areas at least 48dp and text scaling enabled. Longer Hindi and enlarged text can wrap. Tablets retain a navigation rail.
- Preserve working navigation, saved routines, source/permission semantics, explicit emergency dialer actions, and real public directory APIs. A missing aggregation endpoint falls back only to the existing public reviewed directory endpoints.
- Do not reproduce placeholder claims as product truth: no live blood/bed stock, fabricated ratings/fees/appointments, clinical triage promises, government affiliation or fake health values. Voice input is not implemented; Home search has a working submit action instead of a decorative microphone. Provider image slots use category icons until an authenticated source supplies provider media.

Native review screenshots live in `.impeccable/review/homepage-replica`. Populated review data is synthetic, labelled QA, and served from a disposable in-memory backend. Emulator-only local transport is kept separate from the final HTTPS-only APK.

## Verification

- Frontend check: lint, TypeScript, 158 tests passed. Final small behavior refinements also receive lint/type checks.
- Isolated Android emulator: phone light populated and guest states; Hindi dark at 1.3 font scale; 800dp tablet with navigation rail. No physical-device or iOS acceptance is claimed.
- Disposable local account: water quick-log persisted 1,750 ? 2,000 ml, and medicine Take persisted 1/2 ? 2/2 doses. No live account was modified.
- Native clipping in Jeeva and dark emergency contrast were corrected. Water confirmation uses the hydration panel subtitle, preserving the panel footprint.
- Shared header uses the original logo. Authenticated brand opens the existing menu; guest brand returns Home.
- No production backend changes or deployment are required by this composition; existing APIs supply real readings and directory content. The public directory fallback handles an older server lacking the Home aggregation route. Existing release-readiness/deployment requirements remain applicable.
