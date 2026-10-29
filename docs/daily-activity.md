# Daily activity and targets

Arogio saves optional account targets for steps, active calories burned, food calories consumed, distance, exercise minutes and sleep hours. Active and food calories are separate fields. The current Health Connect API integration reads activity records, not other apps' daily target preferences; users set their targets in Arogio.

The Activity screen explicitly selects Arogio tracking or the connected app. Missing connected readings stay missing. Phone steps, entered totals and connected records are never added together. Editing an entered day replaces its totals; repeated saves do not double-count.

Optional phone step counting requests motion permission only when enabled, counts while Arogio is open, and pauses with a connected health source. It is not all-day background tracking. Counts are kept in account-keyed encrypted device storage for up to 30 days and are not uploaded. Other metrics can be entered without connecting an app. Account-entered history retains up to 90 days. Delete activity data clears targets, entered history and local phone counts without deleting water, medicine or cycle records.

Backend rollout requires additive migration `0007_daily_activity_targets.sql` and matching authenticated wellness endpoints. No hosted migration or deployment was performed in this implementation pass. Use the current native build for motion permission, Health Connect nutrition access and reminder audio; Expo Go is insufficient. Physical-device step accuracy, permissions and audio acceptance remain pending.
