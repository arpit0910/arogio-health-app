# Standalone tracking and optional reminders

Arogio is the primary journal: no external health app, watch or Health Connect installation is required for daily tracking. Home and Health show the user's Arogio activity first. Water, cycle check-ins, medicines and daily activity have implemented destinations; this does not establish production or native visual approval.

## Activity and sources

Daily activity opens in **Arogio tracking** mode. Users can record six daily totals and optional targets: steps, active calories (kcal), food calories (kcal), distance (km), exercise (minutes) and sleep (hours). Entries represent a day's total, not an additional event. A blank field clears that entered value. Each metric row offers a focused Log action; its save sends only that metric, preserving the others. The full daily editor remains available.

On supported installed phones, an explicit Start counting steps action requests motion access and enables the phone sensor independently of any linked health app. Counting runs only while Arogio is open in the foreground; background steps are not included. Unsupported sensors or declined motion access leave manual entry available. While phone counting is enabled, its totals supply the steps row and entered step totals cannot be edited; turning it off restores entered totals. Phone steps, manual totals and connected readings are never added together.

A phone alone does not reliably measure sleep or heart rate. Arogio does not infer them from step counts, inactivity or other phone signals. Sleep is an entered total or an explicitly connected reading; heart rate requires an appropriate connected source.

The recent-week date strip uses labeled radio controls, with a selected underline and value color. Choose another date reveals the calendar; activity entries support the last 90 days through today. Each metric appears as a journal row with value, units, source and optional target progress. The seven-day trend ends on the selected date, uses the selected source and leaves missing values empty.

Health connections first explains that Arogio works on its own. Connecting a watch or health app is behind an initially collapsed optional disclosure. When Health Connect is missing, installation is an explicit optional action inside that disclosure, never a prerequisite or automatic redirect. Unsupported or outdated connection support still allows Arogio tracking. An already connected app can be selected as a separate activity source; missing connected readings remain empty.

## Storage and deletion

Manual daily totals and targets continue to save through the existing authenticated wellness API (`activity/days/{day}` and `activity/goals`). Phone counts and their enabled preference are scoped to the signed-in user and stored locally with Expo SecureStore, retaining 30 days of phone history. They are not uploaded as manual records. Connected readings remain separate: session memory by default, with an encrypted device overview when optional background refresh is enabled; they are not sent to the Arogio API.

Delete activity targets and entries clears account activity data and then saved phone history. If clearing local history fails after account deletion, the interface reports that partial outcome. Water, cycle and medicine data use their own controls.

## Setup and notification choice

Setup has three required profile steps (goals, essential basics and activity), followed by a fourth, optional reminders stage. Its four-segment indicator reflects this sequence. The system notification request occurs only after the user chooses Allow notifications. Not now, denial, unavailable permission status and request errors all leave Finish setup available once any active permission request finishes. The permission choice does not create reminders or opt the user into account updates.

Medicine entry also requests notification access when the user chooses reminders. If access is denied, the medicine and its dose times still save with reminders off, with explicit feedback. A permission-check exception instead offers retry or saving with reminders off. Device reminders require the installed app and must be configured separately.

## Visual contract and verification

Preserve Growing Well: the existing cream canvas, forest actions, restrained plum accent, typography, flat dividers and shared controls. Home's compact activity summary and Health's journal and routine rows lead to concrete tasks. Use source labels, contextual empty states, inline save feedback and disclosures instead of generic status panels. No new design tokens are introduced.

The implementation handoff reports 89 passing tests, passing lint and typecheck, resolved source fixes and no source-review regressions in the new week selector. Native visual approval remains pending: no device or browser capture was available for this review.

Local APK 24 completed successfully as `com.arogio.health` version `1.0.1` (24), supporting `arm64-v8a` and `armeabi-v7a`. The artifact is `dist/apk-qa/arogio-build24-local.apk` (61,123,320 bytes), with a copy at `C:/Users/arpit/Downloads/Arogio-build24.apk`. Its v2 signature was verified against build 23's certificate. SHA-256: `7D86C76EB1005D6ED52D5C3572ADCBCAF12D1647F2F3749BE148BB96CAC962CC`. Build and signature checks do not establish native visual approval or release readiness.
