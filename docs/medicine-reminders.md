# Medicine reminders

Available from Health and the Medicines shortcut on Home. Each account can save up to 30 medicines with 1-12 distinct daily dose times, an amount for each dose, optional instructions, and a reminder toggle. Times follow the existing IST convention. Editing replaces that medicine only; deleting removes its future local notifications on the next sync. Data is stored in the account wellness settings under authenticated medicine endpoints.

Notifications share the existing local scheduler with water and cycle tracking: the nearest 60 events within an eight-day planning window are retained. Reopen the app regularly to extend the window. Device permissions are required to enable medicine reminders; web users can save medicines with reminders off. Notification delivery and keyboard clearance still require physical-device verification.

Backend rollout requires applying migration `0006_icy_skin.sql` before serving the updated API. No hosted deployment was performed.

Validation: frontend typecheck, lint and 54 tests; backend build, lint, migration consistency check and four wellness HTTP journeys (including multi-medicine CRUD, multiple dose times, invalid times, duplicate times and account isolation). Live rendered QA could not run because browser and native computer-use hosts were unavailable.
