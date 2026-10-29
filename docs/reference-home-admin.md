# Reference-led Home and backend administration

The user supplied `WhatsApp Image 2026-10-29 at 9.53.18 PM.jpeg` as the visual authority for Home and asked that its UI carry across the app. This is an approved system change from the earlier warm, flat-only design. The original Arogio name/logo remain. Source palette and reusable rules are recorded in `DESIGN.md` and `.impeccable/design.json`.

## App behavior

Home now has the reference's emerald background, mint actions, illustrated wellness banner, pastel care shortcuts, three activity cards and glass artwork on the water card. Shared theme tokens and rounded CareRow surfaces carry the treatment into other destinations. New installs default to dark; saved light/dark/system choices are preserved. The 440-unit content boundary and 16-unit page margins keep navigation and content aligned. Shortcuts adapt to two columns below 360 units or with enlarged text.

The date is the current IST calendar date. Weather is requested from the backend for the profile city and uses current provider fields, not the screenshot's temperature. The backend needs `OPENWEATHER_API_KEY`; unavailable data shows an unavailable temperature. City can be edited in Profile.

Published backend banners replace the built-in illustrated fallback. The app accepts only known internal destinations. Draft banners are not returned by the public list/image routes. A failed banner image keeps the built-in artwork available.

Today's activity uses the selected connected app when connected. Without a connection it uses saved Arogio totals and supported phone steps. Sources remain separate, never summed. Progress and seven-day bars use actual goals/readings; gaps stay gaps. Missing imported data says Not shared and missing manual entries says Not logged.

Foreground health reads run every 30 seconds and on resume. Wellness records refresh every 60 seconds. Home pull-to-refresh triggers health, wellness and Home content together; activity/health destinations also support pulling. New readings depend on when the source app writes into Health Connect. Optional Android background refresh uses OS scheduling with a minimum 15-minute interval and may be delayed. Supported phone counting is only while Arogio is open; the phone does not infer sleep, heart rate or calories from motion.

## One access setup

Three profile steps are followed by `AppAccessGate`, stored once per account under the v3 access preference. One explicit Set up access action runs notifications, supported motion, foreground city location and an optional selected Health Connect source sequentially. Android still presents separate platform dialogs. Users can skip optional access and keep the journal. The central flow reports connection/lookup failures without claiming success; the city alone is saved, not coordinates.

Tracker saves call the notification check without requesting permission. The repeated phone-counting controls are removed from tracking pages. Settings exposes the central App access destination; users can deliberately revisit access there. Optional source/background settings remain explicit management actions, not recurring prompts on Home.

## Artwork provenance

Both assets were generated with the built-in image generation tool for this project, not a screenshot used as a page background:

- `assets/home/reference-v2/wellness-banner.png`: a wide lake/mountain sunrise scene with a backpacked person on the right and light text space at left. The user screenshot was a style/composition reference.
- `assets/home/reference-v2/water-glass.png`: a transparent water glass and foliage cutout.

The exact prompt set is in each PNG's adjacent `.json` file and embedded PNG metadata. The provenance scan reported two rasters and zero missing prompts. Banner copy and all activity values are live UI content.

## Separate backend portal

The super-admin portal is served by the backend at `/admin`. There are no mobile admin screens. It manages server-stored accounts, profiles, daily tracking records, referral/usage analytics, banner uploads/publishing and an audit trail. Role enforcement is performed by the API on every administrative request. Device-only connected readings and sensor history are not uploaded or exposed. Setup and deployment instructions are in `D:/arogio_health_backend/SUPER_ADMIN.md`.

## Verification boundary

Final verification: frontend lint/typecheck and 93 tests passed; backend lint/build/migration checks, 56 unit/database tests and 30 HTTP journey tests passed. The isolated local backend also successfully seeded a synthetic administrator, served the portal and returned protected analytics. APK 27 completed and its signature/version were verified; `docs/apk-build-27-local.md` records the final artifact and checksum. Independent review resolved all reported findings at its source/composition scope.

The inspected composition evidence uses real components with synthetic records: `.impeccable/review/home27-dark-390-final.png`, `home27-dark-320-final.png`; backend desktop and corrected narrow portal previews are under `.tmp/admin-preview`. These confirm composition only. Earlier non-final Home captures and the first clipped mobile portal capture are not acceptance evidence.

Native sidebar layering, actual permission dialogs, connected-source timing, notification delivery and physical-device behavior remain unverified. No production backend deployment, migration execution, live weather key, seeded production administrator, official release signing or store approval is asserted here.
