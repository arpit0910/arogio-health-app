# Medicine notification actions

Scheduled medicine doses use the native notification category `arogio_medicine_actions_v1` on Android and iOS. The notification includes the medicine name, dose amount, meal instruction and notes, with **Snooze (15 min)**, **Skip** and **Take** actions. Stock-refill, water and cycle notifications do not receive medicine actions.

Actions open Arogio (requiring unlock where supported) and use the existing authenticated dose endpoint. Take records `taken`, Skip records `skipped`, and Snooze records `pending` with a snooze deadline. The returned server snapshot must confirm the change before the phone acknowledges it. The schedule then updates and completed doses are excluded from future reminders. These are dose records in the existing tracking system, not a separate immutable action-history table.

## Full-screen reminder

Medicine notifications received while Arogio is active show the full-screen emerald reminder. Tapping the notification body opens the same screen, including on a cold start; notification action buttons still apply their action directly. The screen resolves the exact medicine/date/time against the signed-in account's server data. Simultaneous deliveries queue, and the badge indicates the number of alerts waiting. Completed or deleted doses show an unavailable state rather than another Take button.

Take and Snooze enter the same durable action queue. Snooze defaults to 15 minutes; the minus/plus buttons select 5–60 minutes in five-minute steps. The backend accepts optional `snoozeMinutes` only with a pending snooze action, preserving the old 15-minute default and same-day restriction. Deploy the updated backend before using adjustable snooze. Dismiss (including Android Back) closes only that alert and its presented notification; it does not log taken or skipped. Actions stay visible while long medicine details scroll, including with enlarged text.

This screen uses a native full-screen modal while the app is foregrounded. It does not request Android full-screen-intent access, draw over other applications, or automatically open over a locked phone. Android restricts full-screen intents to permitted alarm/calling use cases; iOS delivers background reminders through the system notification interface. Neither background notification delivery nor force-quit behavior has been certified on a physical device here.

The phone stores actions in SecureStore before clearing the native response. Account-specific queues and delivery receipts prevent cross-account processing and repeated cold-start handling. Network failures leave the action queued; opening/resuming Arogio, refreshing tracking, and the active-app minute timer retry it. Snooze begins when the server accepts the request; it does not create an offline alarm. Validation failures are shown to the user and removed from the retry queue. Authentication failures retain the action for the same account to retry after signing in.

The system controls notification styling and button visibility. iPhone users may need to press and hold the notification; Android users may need to expand it. Lock-screen privacy, Focus, channel settings and permission choices can hide details or prevent an alert. This implementation uses existing locally scheduled notifications, rather than adding a remote push service.

## Device acceptance checks

Use an installed native build with the updated JavaScript, allow notifications, and create a dose a few minutes ahead. Test both Android and iOS:

1. Lock the phone and expand/hold the alert. Verify the three action labels and the correct medicine and amount.
2. Tap Take. Verify the app opens, the correct date/time dose shows taken, and stock decreases once. Restart the app and verify no duplicate deduction.
3. For another dose, tap Skip. Verify skipped status without reducing stock.
4. Tap Snooze for a due dose. Verify the stored deadline and another actionable reminder after 15 minutes. Taking that reminder must complete the original dose.
5. Repeat from an app that has been terminated. Verify recovery of the last notification response.
6. Disconnect the network before tapping. Verify the pending-sync message; reconnect and resume the app. Verify the dose updates and the pending action clears.
7. Switch accounts before tapping an old notification. Verify the other account is not changed.
8. Turn off notifications. Verify the settings warning remains visible alongside action feedback.

Automated coverage includes action mapping, invalid payloads, owner isolation, durable retry state, duplicate receipts, storage failures, native category scheduling and cold-start response handling. Physical lock-screen presentation and delivery timing require these device checks.
