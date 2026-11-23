# Figma versus current app — 16 November 2026

Reference: https://www.figma.com/design/XMSozRvRMi90qhyELFA89J/Untitled?node-id=0-1

Native app review: design and source assessment; no browser detector applies. No app implementation was changed. This compares the current workspace source, not the APK installed on a user's phone or deployed production services.

## Evidence and limits

- Fetched the current Figma page tree: 14 top-level screens, including Articles (`11:3`), which is absent from the older `docs/figma-pages-review.md` screen inventory.
- Visually inspected current Figma renders of Add/Edit Medicine Reminder (`1:2943`), Profile (`1:1349`), and Activity (`1:2089`). Other screens were assessed through Figma layer metadata and current source. The Starter-plan MCP quota prevented further renders; account-plan information confirmed the limit.
- Read the current design/product instructions, route implementations, shared UI, and underlying action handlers. The source already contains a considerable Figma implementation.
- Did not launch a fresh native app session. Consequently this is not pixel-by-pixel acceptance, a full accessibility certification, or evidence that production APIs work. Layout risks below require native verification, especially Hindi, small screens, keyboard use and enlarged system text.

## What is already present

All 14 Figma screen concepts have corresponding app screens/flows: Home, Health/Medicine, Jeeva, Profile, Find Care, Activity, Medicine Reminder, Login, Profile Setup, Health Connect, three splash scenes and Articles.

Existing source includes daily dose times and logging, hydration logging, recorded activity/vitals, Android Health Connect source selection, provider search with hospital/department filters and pagination, provider calling/directions, English/Hindi, and a two-step setup journey. Articles includes categories, search, sort, local bookmarks, a featured article, infinite scrolling and a question handoff to Jeeva. These should not be counted as missing modules merely because the older review omits Articles.

## Missing or partial functionality shown in Figma

| Priority | Figma feature | Current app behavior | Work required |
| --- | --- | --- | --- |
| P1 | Weekly, cycle and SOS medicine schedules | Only Daily is accepted; other tabs show an unsupported alert | Persist recurrence rules and implement matching scheduling/logging behavior |
| P1 | Fixed treatment duration, 5/7/14/30 days | Only ongoing/chronic is accepted | Start/end dates, stopping future reminders and edit semantics |
| P1 | Stock count, refill threshold and depletion estimate | Switch stays off; stock action shows unsupported alert | Inventory model, dose-linked depletion, threshold notification and refill handling |
| P1 | Missed-dose caretaker escalation | Toggle stays off and shows unsupported alert | Caretaker setup/consent, missed-dose rules and actual message delivery |
| P1 | ABHA linking, EHR records, scheme connection | ABHA input disabled; profile shows not linked/not connected; no EHR record flow | Actual integration, consent and record handling |
| P1 | SOS contact and dispatch relay | No configured SOS contact; relay row opens the phone dialer | Contact management and explicitly defined relay workflow |
| P2 | Scan prescription to fill reminder | Scan Rx only explains unavailability | Scan/upload, extraction, review and explicit confirmation before saving |
| P2 | Per-dose before/after-food controls | One free-text instruction applies to the whole medicine | Store meal context per dose and expose the Figma pills |
| P2 | Loud alarm / gentle chime / vibrate choice | Selection fixed at Gentle Chime; other choices unsupported | Save notification preference and implement supported native behavior; do not promise DND bypass without it |
| P2 | Generic price comparison, savings and Reserve Generic | Only Locate Kendra is present | Verified prices, salt mapping and stock/reservation service |
| P2 | Home voice search | Text search only | Voice input with permission, locale, cancellation and recovery behavior |
| P2 | Jeeva voice query and prescription/report attachment | Text composer only | Voice and document input services and appropriate review/privacy UX |
| P2 | Saved hospitals/doctors and recent searches | Profile links open general directories/search; provider cards have no bookmark control | Persistence, save/unsave and actual saved/history lists |
| P2 | Full filter affordance and bookmark buttons in Find Care | Basic chips exist; no Figma filter panel or provider bookmark buttons | Add working filters backed by available data and saved-provider state |
| P2 | In-app map experience | Map View launches generic external Maps search, not the current result set | Clarify external action or implement map/results and filter parity |
| P2 | Clinical vitals PDF and top share action | Export opens a general retained-data JSON sharing screen; device-only readings excluded | Define report contents and produce an actual PDF with sources/dates |
| P2 | Weekly medicine adherence strip | Weekday checks are fixed gray icons; only today's counts/actions are calculated | Bind each day to real dose history and provide a text summary |
| P2 | Senior accessibility mode with voice prompts | Local component state enlarges Profile only; lost when unmounted | Persist an app-wide setting, propagate layout/text changes, add supported voice features |
| P2 | Consent locker and human support | Consent row opens privacy text; support row opens Jeeva | Actual consent-management flow and a distinct support/feedback destination |
| P2 | Apple HealthKit | Switch always false with unavailable alert | Native iOS integration; show platform-specific availability clearly |
| P2 | Dedicated wearable integrations | Existing app selection depends on installed Health Connect-compatible sources | Distinguish indirect Health Connect bridges from direct Garmin/Fitbit/vendor integration |

Figma also illustrates vitality scores, sinus-rhythm classification, stability percentages, sleep-stage/score analysis, personalized clinical notes and live bed/ICU availability. The current Activity dashboard uses recorded values and simple summaries, and care listings ask users to confirm availability. These are capability gaps, not numbers or clinical labels to copy into production. They require validated data and defined calculations/services. Fixed sample names, dates, prices and clinical claims should remain illustrative.

## UI/UX findings and recommended changes

### P1 — Controls promise more than the destination delivers

Profile says “Saved Hospitals” and “Saved Doctors” but opens all listings. “Recent Searches” does not show history. “Consent Locker” is a policy page and “Support & Feedback” opens AI. Rename these to the actual behavior until the corresponding flows exist, then restore the intended labels. Show unavailable features before interaction instead of making people repeatedly discover them through alerts.

Evidence: `src/features/profile/components/AccountProfileScreen.tsx`, `src/features/care-directory/CareSearchScreen.tsx`.

### P1 — Topic links lose their search context

Health's Heat Wave, respiratory and remedy cards navigate to `/articles` with a `search` parameter. `ArticlesLibraryScreen` initializes empty local search and does not read route parameters. Thus different topic links arrive at the same unfiltered library. Initialize/synchronize the route search and make empty-topic recovery clear. This affects the perceived functionality of Figma's guide/remedy cards.

Evidence: `src/features/personal-wellness/HealthScreen.tsx`, `src/features/articles/ArticlesLibraryScreen.tsx`, `src/app/(account)/articles/index.tsx`.

### P1 — Health tabs do not consistently filter their subject

Nutrition and Seasonal Alerts render the same fixed Medical Guides cards. They are not category-specific feeds. Selecting Nutrition can therefore show heat-wave and respiratory content. Bind each tab to the intended content category and keep the category visible on arrival in Articles.

Evidence: `HealthScreen.tsx`, conditions around `show('Doctor Guides')`.

### P1 — Reminder edit state does not preserve structured identity

Form factor defaults to Tablet and strength/unit start empty even when editing a saved medicine. Strength is appended to the name rather than saved as a separate field. Changing form factor rewrites every dose amount to `1 <form>`, replacing custom amounts. Store and restore these fields and preserve amounts during non-dose edits. This is a user-data/interaction problem beyond visual fidelity.

Evidence: `src/features/personal-wellness/MedicineReminderScreen.tsx`, state initialization, form handler and submit handler.

### P1 — Capability and review copy needs to reflect actual state

Health Connect displays “Ready” whenever disconnected, regardless of availability, and “Live Biometric Telemetry Ready” without a successful connection. Medicine/guide cards label information reviewed without checking corresponding item review metadata in that rendering path. Setup promises emergency response-time calculation and appointment personalization, while Jeeva greets users with appointment guidance. Replace these with supported behavior or condition them on verified capability/data.

Evidence: `HealthConnectScreen.tsx`, `HealthScreen.tsx`, `ProfileSetupScreen.tsx`, `JeevaScreen.tsx`.

### P2 — Activity period controls are only partly effective

Day, Week and Trends all build the same seven-day step dataset; only Month changes the range to 30 days. Most cards remain today's readings, and Trends only adds a sleep chart when a snapshot exists. Specify the scope of each period and update summaries/charts consistently. The seven gray dose checkmarks should not look like a working adherence visualization.

Evidence: `src/features/activity/ActivityScreen.tsx`.

### P2 — Reminder composition differs from the Figma sheet

The implementation is a standard screen without Figma's top dismiss-sheet affordance. Form-factor options use a generic two-column grid rather than the reference's three-column icon grid. Units are segmented buttons rather than the dropdown. Dose rows replace meal-context pills with Edit Amount; inventory, savings and alert sections have simplified controls. These are confirmed source/design differences. Match geometry where it supports usable controls, but retain native touch targets and support large text rather than copying the reference's tiny controls.

### P2 — Shared styles diverge and dark-card headings need correction

`DesignUI.tsx` introduces its own colors, sizes and radii alongside shared theme tokens. Its headings default to dark ink. Activity's final emerald Jeeva card uses `DHeading` without a light-text override, so the title inherits dark ink on emerald. Consolidate semantic styles and make inverse text explicit. Review all fixed horizontal control groups and value rows at enlarged text/Hindi before calling visual fidelity complete.

### P2 — Accessibility is incomplete despite reasonable foundations

Shared TouchTarget enforces a 48dp minimum height, and many controls have labels. It does not enforce minimum width, so the narrow +/- dose controls warrant physical-width verification. The shared `DProgress` visual has no progress role/value, unlike Home's water progress bar. Profile's stat accessibility label says “Not available yet” even for a real blood-group value. Correct semantics and test with TalkBack and enlarged text.

### P2 — Distinguish legitimate design adaptations from omissions

Using real account/provider values, city-neutral text, source attribution and missing-reading states is appropriate. Do not restore Figma's sample Rahul profile, ABHA verification badge, sample provider ratings, scheme affiliation, guaranteed savings or clinical interpretations just to resemble its screenshots. Existing permissions, error/retry and guest boundaries also need to survive any visual changes.

## Suggested implementation order

1. Correct destinations, topic handoffs, category tabs, edit-state preservation and capability labels.
2. Add saved providers/history and persist app-wide accessibility preferences; restore the associated Figma interactions.
3. Complete medicine duration/recurrence/meal context and inventory, then validate notification and escalation behavior.
4. Implement PDF sharing and missing voice/document input where services are available.
5. Treat ABHA/EHR, scheme links, reservations and clinical analytics as separate integration projects.
6. Capture every screen from a fresh native build at the Figma viewport, a narrow phone and enlarged text in English/Hindi; compare spacing, type, artwork, navigation, keyboard and loading/empty/error states.

Questions skipped: the request is an audit, and these findings can be delivered without a design preference decision.
