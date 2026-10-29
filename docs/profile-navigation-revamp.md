# Profile, navigation and account controls

The October 29 extension keeps the existing Growing Well palette, fonts, shared controls and 440-unit app content width. It changes the shared navigation and account surfaces without introducing a new visual world or token primitives.

## Implemented behavior

- Every completed-profile signed-in page uses menu left, centered Arogio brand and notifications right. Detail back navigation and titles use a second row, so the menu stays in the Home position. The header profile shortcut is removed; Profile remains in the sidebar and bottom navigation.
- The sidebar is an overlay in the same native window as its BlurTargetView, with intensity 45, a dark dim layer and opaque theme-backed panel. Background touches and accessibility traversal are suppressed while open. Back, close and backdrop dismiss it. Reduced-motion settings remove panel animation.
- Profile uses an 88-unit avatar, name/email/city, one Edit profile action, a wrapping weight/height/BMI strip, and flat groups for goals and account controls. Referral code and sharing remain visible. Delete account appears separately below Log out.
- The deletion screen explains deactivation, sign-out, retained records and recovery. An unchecked acknowledgement must be selected before Delete my account becomes available. A successful request clears the local session.
- Today's activity uses the selected connected app when connected, with a source label. Without one it uses entered totals and supported foreground phone steps. Imported values are never added to manual or phone totals. Missing imported readings show Not shared; missing manual entries show Not logged. The Activity destination respects an explicit source. Home no longer duplicates its seven-day steps chart; dedicated trend pages remain.
- During the basics setup step, foreground location permission supports automatic city lookup. The city stays editable, and denial, lookup failure or timeout does not block account setup. Use my location can retry. Profile payloads save only the city, not latitude/longitude; ongoing location tracking is not implemented.
- The header bell opens the local account-scoped inbox and shows unread count. Reminder rows link to the relevant tracker. Real scheduled reminders appear as due, while received and tapped Arogio reminders are reconciled from native notification APIs. Due history does not prove OS delivery or completion. Read state cannot revert to unread on duplicate receipt. Retention is up to 120 past reminders from 90 days, with up to 60 pending reminders held separately. This is not an inbox for other apps' notifications or a server-synchronized notification archive.

## Account deletion contract

The backend implementation is in `D:/arogio_health_backend`. Migration `0009_minor_green_goblin.sql` adds `deletion_requested_at` and `recoverable_until` to users. `DELETE /api/v1/profile` requires `{ "confirm": true }`, soft-disables the account and revokes all sessions in one transaction. Basic identity details and saved records remain intact. The user explicitly selected **Keep soft-deleted records**; there is no automatic purge after 30 days.

Verified password or Google sign-in can restore the account before the 30-day deadline. Token refresh cannot restore it, and sign-in recovery is unavailable after the deadline. The access guard requires an active account and unrevoked, unexpired session; old sessions remain unusable after restoration. Session creation and rotation lock the account before session mutations, matching deletion's lock order. This documentation does not establish production deployment or migration execution.

## Evidence and remaining checks

Frontend lint/typecheck and 92 tests passed; backend lint/build, 51 unit/database tests and 29 HTTP journey tests passed. Independent source review resolved its reported findings. Build 26 completed successfully and its APK signature/version were verified; see `docs/apk-build-26-local.md`. These checks do not establish native device acceptance or production deployment.

The parent inspected synthetic React Native Web captures made from real screen components with fixture account data. Current captures are `.impeccable/review/profile-dark-final.png`, `profile-light-final.png` and `home-dark-final.png`. Earlier profile captures without `-final` had harness style/palette defects and must not be used as acceptance evidence. Fixtures and stubs do not exercise native effects or hardware.

Android drawer blur/layering, native permission prompts, actual connected-app sync, notification delivery and physical-device behavior remain to be verified. Large-text and narrow-screen behavior still require native captures. No production visual acceptance, backend deployment, official release signing or store readiness is asserted.
