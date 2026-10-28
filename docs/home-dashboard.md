# Mobile Home dashboard

Home is a daily working screen inside Arogio's existing Growing Well theme. The source is `src/features/home/HomeScreen.tsx`; `homeModel.ts` derives its water view from the authenticated wellness snapshot. This change does not redesign the other screens or replace the global design system.

## Screen structure

- A fixed app bar contains the Arogio brand and a profile avatar. Top and horizontal safe-area insets are respected. The five-destination navigation remains outside the scroll content: a bottom bar on phones and a left rail at widths of 768 logical units or more. Jeeva AI retains its prominent centre artwork on phones and a prominent artwork entry in the rail.
- A compact greeting and device-local calendar date introduce the day. The greeting tightens when the viewport is shorter than 720 logical units or the system font scale exceeds 1.2.
- Today shows the saved water target, logged volume, task completion count, accessible progress and a preferred-serving Log action before the secondary shortcuts. Progress is capped visually at the target while the actual logged amount remains visible. A user without a plan gets a real setup action; loading and request failures have explicit states. Loading, ready and setup use distinct keyed containers so the ready surface does not inherit the loading container's busy accessibility state.
- Four secondary labelled shortcuts open Water, the private Cycle tracker, My profile and My goals. They follow the primary water action on phones and occupy the secondary column in expanded layouts. They reflow to two columns on expanded layouts or when the system font scale exceeds 1.4.
- A private Cycle row opens the tracker. It does not show cycle dates, predictions, symptoms, notes or cycle activity on Home. This follows the user's explicit privacy choice.
- Coming up contains at most two future pending drinking tasks and opens the full water plan. Skipped, completed and earlier tasks are not represented as future work. The section is hidden after the target is reached.
- Recent activity contains at most three water logs from the current waking day, ordered newest first. Empty activity is omitted instead of populated with examples.

The former profile-promotion panel, introductory marketing copy, profile disclosures and future-service promotion are absent. Jeeva AI remains an existing navigation destination; this Home change does not add assistant functionality or imply it is available.

## Logging and refresh behavior

The primary action logs the user's saved serving size. A client UUID and timestamp are kept for a failed request so retrying the same drink does not generate another log ID. This pending request is held in component memory, not a durable offline queue. The action waits for the authenticated API response before showing a successful log. Rapid repeat presses are blocked while the request is in flight.

A successful log displays confirmation with Undo. Undo deletes that specific saved log through the same authenticated API and reports removal after a successful response. Users can dismiss the confirmation separately. A failed confirmation remains recoverable through the Retry drink log action; Home does not pretend a failed request was saved.

Pull-to-refresh reloads the account's wellness snapshot using the native RefreshControl. The existing provider also reloads on app foregrounding. Home refreshes its clock every minute and when the app returns to the foreground. Water totals and tasks follow the plan's saved timezone and waking day, including overnight schedules; the greeting date follows the device calendar.

## Source design evidence

Home reuses the shared warm background, off-white surface, forest primary, muted ink and restrained plum tokens. It uses Inter regular, medium and semibold. Local roles are a 24/32 greeting (20/28 in compact conditions), 18/26 section title, 17/24 feature title, 14/21 supporting body and 12/18 shortcut labels. These are source measurements in React Native logical units, not additions to the global token catalogue.

The content and app bar retain the established 440-unit width bound and 24-unit horizontal padding on phones. At widths of 768 logical units or more, Home expands to a maximum width of 1100, with a wrapping two-column layout and a 24-unit gap. The primary water column precedes secondary shortcuts and activity. `AuthenticatedLayout` moves the tab bar to the left, and `AppNavigation` renders a 96-unit navigation rail. The hydration surface has an 18-unit inset, 16-unit radius and one thin border; other tasks use divided rows. Shared Button and TouchTarget supply the existing minimum control heights. No new illustration, photo, font, shadow system or page-entry animation is introduced.

## Local emulator preview

`node scripts/build-local-home-preview.cjs` evaluates the existing Expo configuration plugins and builds an x86_64 emulator-only APK against `http://10.0.2.2:3001/api/v1`. It requires the local backend to be running, the local app environment file and an Android SDK environment configured for Gradle.

The script explicitly selects `AROGIO_LOCAL_QA`, which gates `plugins/with-local-qa-network.js` to permit local HTTP. `app.config.js` excludes this plugin whenever `EAS_BUILD=true`; that guard has been checked. Generated Android directories and `dist` are excluded by `.easignore`. The standalone preview build succeeds and is for synthetic local QA only, not an official EAS or uploaded release artifact.

## Verification boundary

The independent finish reviewer scored all three Android Home fixes resolved with disposition **ship**: daily action priority, loading accessibility leakage and expanded Android layout. This verdict covers those three fixes, not whole-app release readiness. The scoped verdict is recorded in [home-finish-review.md](../.impeccable/review/home-finish-review.md).

Valid direct Android API 34 emulator captures are retained under `.impeccable/review/`:

| Capture | Viewport/state |
| --- | --- |
| `home-phone-android.png` | Standard phone, 1080 × 2220 pixels |
| `home-phone-empty-android.png` | Standard phone, plan not configured |
| `home-phone-logged-android.png` | Standard phone, saved hydration activity |
| `home-small-large-text-android.png` | Compact phone, 880 × 1760 pixels, 320dp width and font scale 1.3 |
| `home-small-large-text-scrolled-android.png` | Same compact enlarged-text viewport, scrolled content |
| `home-tablet-android.png` | Expanded layout, 1600 × 2560 pixels and 800dp width |
| `home-phone-system-night-android.png` | Phone with system night appearance selected |

Native water logging, Undo and pull-to-refresh were exercised against the local API. The API confirmed that Undo removes the saved log. `dist/home-ready-after.xml` and `dist/home-setup-after.xml` contain no busy announcement in the ready/setup states. The earlier complete app test run passed all 49 tests; the final changed Home and Google subset passed 11 tests. Source lint/typecheck pass after the UI fix batch, and the standalone local Android preview rebuild succeeds. The subset is not an additional full-suite run.

QA viewport, density, font scale and night appearance settings were restored. The QA emulator and local API were stopped. The generated Android project was reset through normal Expo prebuild, removing the local QA HTTP override from that generated project.

No iOS, physical-hardware, notification-delivery or production-deployment sign-off, nor an official published APK, is claimed here. The system-night capture does not establish a separate dark-theme implementation.

Remaining release acceptance includes the wider state matrix: initial loading, loading failure/recovery, goal completion, paused/off reminders, overnight plans, failed-log retry, private Cycle navigation and every shortcut, plus iOS and physical-device checks. Cycle details must stay absent from Home's visible content and accessibility labels. The Android evidence above is scoped to the listed captures, exercised interactions and scored fixes.

The root DESIGN.md and `.impeccable/design.json` were preserved because this is a local Home refinement. Pre-existing documentation drift, including the older profile-led Home description and sidecar freshness, is not repaired by this task. This source note and the Home surface contract describe the implemented dashboard without treating that drift as new visual-system authority.
