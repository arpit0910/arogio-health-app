# Mobile Home and sidebar

Implemented as an extension of Growing Well, following the user's choice to keep bottom tabs and add a slide-out sidebar.

Home now uses a compact app bar with menu, centered original branding and profile shortcut; greeting/date; four quick care actions; a tonal water panel with real progress and direct logging; one chronologically sorted list of upcoming water/medicine times; a connected-health entry; and recent saved water activity. The expanded layout retains the existing navigation rail and two-column content. Large system text lets shortcut groups wrap. Existing loading, error, setup, pull refresh, retry-safe water logging and Undo are retained.

Cycle records remain inside the private tracker. Upcoming medicine times are scheduled doses, not adherence history: the UI does not claim a past dose was missed or taken. Disabled medicine reminder notifications are labeled Reminders off rather than removing the saved dose schedule. Device health readings are not silently imported into Home.

The sidebar opens from the Home app bar. It contains primary destinations, care tools and account links, plus Log out. It closes before navigating, supports explicit close, outside-tap and Android Back, honors safe-area insets and reduced motion, and scrolls independently while the logout action stays at its footer. User changes remount the sidebar session so another account does not inherit open state.

Validation: TypeScript, lint and all 62 tests pass. Added tests cover combined future care ordering, the three-item limit, privacy of cycle data, paused reminder labels, no invented missed/completed medicine doses, and empty plans. Native build results are recorded with the APK. Live native and browser UI hosts were unavailable, so the new dashboard/drawer has not received a rendered-device sign-off. Historical Home captures were inspected as incumbent evidence only.
