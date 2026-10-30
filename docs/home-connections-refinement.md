# Home and app connections refinement

The October 2026 reference remains the visual authority. Home now bounds shortcut and activity widths, reduces banner height and removes the step ring's extra layout row. Shared screens and headers use the same 440-unit phone / 880-unit expanded content bounds at 1024 units. Bottom navigation has an emerald themed surface and selected icon backgrounds.

## Connections

The product term health app connections includes installed health apps, not only Google's Health Connect application. Android discovery combines dynamically discovered health permission handlers with a scoped catalog: Samsung Health, Google Fit, Fitbit, Garmin Connect, Strava, Huawei Health, Mi Fitness, Zepp Life, Zepp and HealthifyMe. Only installed, enabled apps appear, using their native names and icons. This is a recognized-app catalog, not exhaustive enumeration of every health app in existence.

Declaring Health Connect write permissions identifies a possible local data source; it does not prove the source has granted write access or has available records. Apps without that capability remain visible as requiring provider integration. No direct Garmin, Fitbit, Strava or other cloud API adapter or provider credentials have been configured by this change. Those apps can connect now only if their installed version shares records through the supported local route. The Connect control cannot activate an unsupported app.

One Connect action selects all supported read types and invokes Android's permission chooser. Users can grant a subset. It also requests optional background access and registers OS-scheduled refresh if permitted; declining it leaves foreground syncing available. Foreground reads refresh every 30 seconds and on resume. Transient failures retain the last successful reading and its timestamp, report an error and retry on the next scheduled read. Permission revocation and unavailable source apps still clear readings. App icons are not stored in the small secure preference record.

## Verification

TypeScript, ESLint and the test suite are required. Composition previews use synthetic records and app lists, including long names and unavailable integrations. They do not establish physical Android discovery, permissions, background scheduling or native rendering acceptance. A rebuilt Android app is required for the new native discovery and icons. Continuous, failure-free sync cannot be guaranteed: source sharing, provider access, permissions and OS scheduling remain dependencies.
