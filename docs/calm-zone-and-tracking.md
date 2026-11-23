# Calm Zone and tracking refinement

Updated 10 November 2026. This is an extension of Arogio's established emerald visual system and daily-care product scope, documented against `PRODUCT.md`, `DESIGN.md` and the implemented source. It preserves the original name/logo, active-palette mint actions, Inter typography, rounded tonal groups and honest recorded-data states.

## Calm Zone

The Meditation destination is now labelled **Calm Zone**. Its introduction gives quick resets and slower evening care equal emphasis. Built-in guided practices remain available while the catalog loads, when it is empty, and when the server cannot be reached. A five-minute wind-down joins the existing practices. Published practices replace matching built-ins by id or normalized English title; published catalog pages are deduplicated by id. Existing videos retain their catalog/admin publication behavior; this change does not add an unrestricted video library.

**Sound & stillness** provides the bundled ambient music and an original synthesized soft-noise loop (`assets/sounds/soft_noise.wav`, reproducible with `scripts/generate-calm-sound.py`). These local sounds work offline with 2-, 5-, 10- and 20-minute timers. Playback pauses when the screen loses focus or the app leaves the foreground; choosing a guided practice removes the sound session. A ten-second load timeout exposes Retry sound and an error message, and playback-start failures have visible recovery copy. These are foreground breaks, not overnight background playback.

The quiet image reuses `assets/articles/mindfulness.jpg`. Welcome reuses that photo alongside `assets/articles/walking.jpg`, with concise everyday-care copy. No new raster imagery was generated.

## Tracking and progress

Phone tracking now treats the Android persistent step bridge as optional and falls back to supported foreground counting when it is absent. Direct tracking controls remain accessible from Activity. Failure to discover installed health apps does not prevent reading an already selected Health Connect source. Known source unavailability still has its own unavailable state.

Daily Health Connect bucket reads preserve successful buckets when another bucket fails. Failed buckets remain failed/missing or retain earlier cached readings and their original checked timestamps; they are not presented as freshly read values. These changes do not establish physical-device sensor or Health Connect acceptance.

Progress insights show an average over recorded completed days, the number of completed days reaching the user's current target, and the remaining amount today when a current reading and applicable saved goal exist. Missing days are excluded rather than counted as zero; real zeros remain readings. Dates are sorted, future readings are excluded, and today is excluded from completed-day averages. The current target is applied to historical recorded days; this is not a history of targets in effect on those dates. Food, heart rate and weight do not receive goal advice. The older duplicate average block was removed.

## Fit with the incumbent design

This work uses shared PageIntro, CareGroup, CareRow, Button and palette-backed text instead of introducing a new visual identity. Wrapping sound/timer controls, photographic crops with rounded corners and a focused session view continue the existing task hierarchy. Launch retains the original logo and emerald/mint atmosphere while centering its content in a capped-width column, allowing natural text wrapping and reducing the graphic's footprint. The complete static composition appears immediately; there is no late entrance reset when motion preferences resolve. Reduced-motion behavior remains supported. See `launch-screens.md` for the current opening-screen note.

`DESIGN.md` and `.impeccable/design.json` were preserved. Existing documentation/sidecar drift, including the older foreground-only phone-step description in the design document, remains pre-existing follow-up work; this scoped extension does not silently reconcile the global system.

## Evidence and acceptance limits

- `npm run check` passed lint, TypeScript and all **148 tests**, including stalled-sound load recovery.
- Final Android Expo export passed to `dist/calm-zone-android` after the sound recovery patch.
- Backend wellness and meditation E2E verification passed **2 suites / 7 tests**. No backend source changed in this task.
- Static React Native Web compositions cover 390-wide dark and 320-wide light/Hindi Calm Zone and Welcome, plus small/phone/tablet launch views. Evidence includes `.impeccable/review/ui-system/calm-phone.png`, `calm-small-hi.png`, `welcome.png`, `welcome-small-hi.png`, launch-refresh captures and `referrals-analytics/progress.png`.
- No Android device was attached via adb. These captures verify static composition only. Native audio, sync, sensor fallback, interruptions, enlarged system text and cold-launch acceptance remain pending.
- Reviewer's initial missing sound-load recovery finding was fixed and re-reviewed as resolved. Its source/static review verdict is not native or production release approval. No production deployment or APK was delivered.

## Recommended next additions � not implemented

- Licensed nature recordings and richer, appropriately licensed imagery.
- Approved sleep stories and additional curated videos.
- Favorites and explicit downloads for published content.
- An optional before/after mood journal with neutral reflection prompts and no medical claims.

