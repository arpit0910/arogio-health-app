# Water and cycle tracking

Entry points: Home → Water & cycle tracking, or the Health tab. Both features are optional and available to every account without inferring gender.

## Water

Users choose their own target, serving size, wake time and bedtime. Tasks divide the target exactly into at most 16 servings, distributed inside waking hours. Overnight schedules and daylight-saving changes use the saved IANA timezone. Editing schedule fields replaces the task version; reminder toggles preserve it. Previously logged water continues to count toward the waking day's goal.

Quick logs fill unfinished servings in order; a task log credits that task. Logs use client UUIDs for safe retries and server-side task deduplication. Failed writes are not presented as saved. Users can undo logs, snooze a task for 15 minutes before bedtime, skip/restore tasks, pause until bedtime, disable daily reminders, edit settings and delete water data independently. History shows the last seven waking days; the API loads up to 90 days of water logs (maximum 3,000).

## Cycle

Users can record ongoing or finished periods, edit/delete dates, and record daily flow, symptoms, optional mood and notes. Dates cannot overlap or be in the future. The calendar separates recorded periods, estimated dates, check-ins and the selected day. History and the native share sheet contain recorded information only.

Estimates use the median of up to six recorded intervals between 10 and 120 days, falling back to the user's configured length. A range and variable-cycle indication communicate uncertainty. Overdue estimates stay overdue rather than silently moving forward. Ongoing periods suppress next-period notifications. Estimates are not fertility or contraception guidance.

Reminders use discreet wording by default. Users may pause reminders, disable estimates, change notification wording/time/lead time, and permanently delete cycle data independently. Daily history currently loads the latest 730 check-ins; period history is retained. Sharing includes the loaded check-in history and all period dates and is explicitly labeled in the UI.

## Notifications and release requirements

`expo-notifications ~58.1.6` and its config plugin require a new native build. Browser previews cannot deliver these device reminders. Permissions are requested only when enabling reminders. Android uses a private lock-screen channel. Local notifications open the tracker and never log a drink automatically.

Scheduling is deliberately bounded: at most 55 future water reminders over the next eight waking days, plus one estimated-cycle reminder, below iOS's 64 pending-notification limit. The app cancels/replaces only its wellness notifications when data changes, on foreground refresh, and on account changes/logout. Paused, completed, skipped and past tasks are excluded. Water displays the actual scheduled-through date after scheduling succeeds. Users need to open Arogio regularly to extend this horizon. No remote push/background server scheduler is included. OS notification, battery, focus and app force-stop behavior can affect delivery.

API writes require connectivity. Sensitive records are account-owned on the server; there is no additional persistent client health cache or third-party tracking in these features. Existing account/session storage is unchanged.

The matching backend change and migration `0005_majestic_skreet.sql` must be deployed before a production APK can use these features. This implementation does not migrate a hosted database or publish a new APK.

## Validation

- App lint/typecheck and domain tests cover schedules, exact totals, overnight days, DST folds/gaps, reminder bounds, pause/disable behavior, date validation and cycle estimates.
- Backend HTTP integration tests apply every migration to disposable PGlite, use real authentication/guards and cover ownership, duplicate requests, invalid settings/dates, overlapping periods, daily entries and independent deletion.
- Native visual checks and on-device notification delivery are still required. The Windows Computer Use inspection stopped because it could not confidently determine the browser URL; no rendered screenshots or native delivery results are claimed.

Device acceptance: enable permission; schedule a near-future task; verify delivery with app open/backgrounded/closed; tap through; log and confirm cancellation; snooze; pause/resume; change timezone; deny permission; log out/switch accounts; delete one tracker; relaunch and verify persistence. Check 320px phone, Android large text, iOS and tablet layouts.
