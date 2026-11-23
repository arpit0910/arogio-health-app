# Homepage upload redesign — 14 November 2026

The user's `Homepage.png` and `Homepage.svg` replace the old app UI/UX. The source files were read as visual references, not as operational instructions. Earlier surface briefs and screenshots are historical where they conflict with this request.

## Implemented

- Updated the shared palette to the SVG's deep ink, emerald, mint and coral colors. Shared geometry now exposes 16-unit fields, 20-unit panels, 18-unit tiles and 52-unit controls.
- Preserved the Home section sequence: greeting/search, suggestions, emergency, eight service shortcuts, activity/vitals, water, medicines, Jeeva, hospitals, specialists, guides and trust information. Updated emergency and medical service symbols and banner proportions.
- Updated the shared header with a profile ring and the bottom navigation with a raised emerald/cyan Jeeva control. Retained safe areas and the expanded-screen navigation rail.
- Applied the system to care cards/details, topic imagery, page introductions, buttons, grouped account/settings rows, trackers, profile and account setup controls, welcome and Jeeva chat.
- Removed the old authentication background artwork and login/signup illustrations. Authentication now uses a white form panel on the shared canvas. Removed unused Inter font loading; Plus Jakarta Sans and DM Sans remain the app typefaces.
- Extracted hospital and guide artwork directly from the supplied SVG. Existing matching SMS/EHCC listings can use the supplied hospital images. Other providers keep category symbols; no sample provider is created. Missing profile photos now use a neutral icon.

## Data and behavior

Existing routes, sign-in, search, API reads, hydration logs, medicine actions, language selection, appearance preferences and permission flows are preserved. The screenshot's sample personal readings, live blood stock, emergency bed counts, appointment slots, star ratings and government affiliation are not asserted by this visual change. Jeeva retains its existing educational scope and does not advertise a new clinical triage service. The search submit action remains functional; a decorative microphone was not added without voice-search support.

## Verification

- `npm run check`: lint and TypeScript passed; 158 tests passed, zero failed.
- Web export: `node scripts/start-local.cjs --export --platform web --output-dir dist/homepage-redesign` passed.
- Android JavaScript/Hermes export: `node scripts/start-local.cjs --export --platform android --output-dir dist/homepage-redesign-android` passed (1,728 modules). This does not establish APK or device correctness.
- Source-rendered composition pages were generated for Home at 390 units, Home at 320 units with enlarged text, login, Health and dark Hindi Profile. These use synthetic records and are layout-review artifacts, not evidence of native interaction or visual acceptance.
- Local `/home` preview returned HTTP 200 at `http://localhost:8081/home`.
- Mechanical design detector reported advisory color findings in the pre-existing, inactive `HomeContent.tsx` banner and the existing profile modal overlay. It reported no blocking findings.
- Live browser/native screenshot verification is blocked because the Computer Use native pipe and browser host are unavailable. Android/iOS device appearance, keyboard behavior and touch interactions still require a connected preview/device review. No APK was rebuilt or deployed by this change.

The live preview uses the project's configured local API. Backend availability determines which care content and personal values appear.

The design tool also reported legacy product metadata and a missing native-platform stamp. `impeccable init` can refresh that metadata separately; this task did not silently migrate the project's design-tool configuration.
